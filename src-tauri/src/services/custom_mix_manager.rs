use crate::errors::{AppError, AppResult};
use crate::models::{CustomMix, CreateMixRequest, UpdateMixRequest, MixConfig, KeyStage};
use crate::database::DatabaseManager;
use std::sync::Arc;
use rusqlite::{params, Row};
use serde_json;
use chrono::{DateTime, Utc};

/// Custom mix manager for creating and managing quiz mixes
pub struct CustomMixManager {
    db_manager: Arc<DatabaseManager>,
}

impl CustomMixManager {
    /// Create a new custom mix manager
    pub fn new(db_manager: Arc<DatabaseManager>) -> Self {
        Self { db_manager }
    }

    /// Create a new custom mix
    pub fn create_custom_mix(&self, request: CreateMixRequest) -> AppResult<CustomMix> {
        // Validate the mix configuration
        request.config.validate().map_err(|e| AppError::InvalidQuestion(e))?;

        let mix = CustomMix::new(request.name, request.created_by, request.config);

        let mix_id = self.db_manager.transaction(|tx| {
            let config_json = serde_json::to_string(&mix.config)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

            tx.execute(
                "INSERT INTO custom_mixes (name, created_by, config, created_at)
                 VALUES (?1, ?2, ?3, ?4)",
                params![
                    mix.name,
                    mix.created_by,
                    config_json,
                    Utc::now().to_rfc3339()
                ],
            )?;

            Ok(tx.last_insert_rowid() as u32)
        })?;

        self.get_custom_mix_by_id(mix_id)
    }

    /// Get a custom mix by ID
    pub fn get_custom_mix_by_id(&self, mix_id: u32) -> AppResult<CustomMix> {
        self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, created_by, config, created_at, updated_at
                 FROM custom_mixes WHERE id = ?1"
            )?;

            let mix = stmt.query_row(params![mix_id], |row| {
                Ok(self.row_to_custom_mix(row)?)
            })?;

            Ok(mix)
        }).map_err(|e| match e {
            crate::database::DatabaseError::Sqlite(rusqlite::Error::QueryReturnedNoRows) => {
                AppError::NotFound(format!("Custom mix with id {} not found", mix_id))
            }
            _ => AppError::DatabaseConnection(e),
        })
    }

    /// Get all custom mixes
    pub fn get_all_custom_mixes(&self) -> AppResult<Vec<CustomMix>> {
        Ok(self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, created_by, config, created_at, updated_at
                 FROM custom_mixes ORDER BY created_at DESC"
            )?;

            let mix_iter = stmt.query_map([], |row| {
                Ok(self.row_to_custom_mix(row)?)
            })?;

            let mut mixes = Vec::new();
            for mix in mix_iter {
                mixes.push(mix?);
            }

            Ok(mixes)
        })?)
    }

    /// Get custom mixes created by a specific profile
    pub fn get_custom_mixes_by_profile(&self, profile_id: u32) -> AppResult<Vec<CustomMix>> {
        Ok(self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, created_by, config, created_at, updated_at
                 FROM custom_mixes WHERE created_by = ?1 ORDER BY created_at DESC"
            )?;

            let mix_iter = stmt.query_map(params![profile_id], |row| {
                Ok(self.row_to_custom_mix(row)?)
            })?;

            let mut mixes = Vec::new();
            for mix in mix_iter {
                mixes.push(mix?);
            }

            Ok(mixes)
        })?)
    }

    /// Update an existing custom mix
    pub fn update_custom_mix(&self, mix_id: u32, updates: UpdateMixRequest) -> AppResult<CustomMix> {
        // Verify mix exists
        let _existing_mix = self.get_custom_mix_by_id(mix_id)?;

        // Validate updated config if provided
        if let Some(ref config) = updates.config {
            config.validate().map_err(|e| AppError::InvalidQuestion(e))?;
        }

        self.db_manager.transaction(|tx| {
            let mut update_parts = Vec::new();
            let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
            let mut param_index = 1;

            if let Some(name) = &updates.name {
                update_parts.push(format!("name = ?{}", param_index));
                params_vec.push(Box::new(name.clone()));
                param_index += 1;
            }

            if let Some(config) = &updates.config {
                let config_json = serde_json::to_string(config)
                    .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
                update_parts.push(format!("config = ?{}", param_index));
                params_vec.push(Box::new(config_json));
                param_index += 1;
            }

            if !update_parts.is_empty() {
                update_parts.push(format!("updated_at = ?{}", param_index));
                params_vec.push(Box::new(Utc::now().to_rfc3339()));
                param_index += 1;

                let query = format!(
                    "UPDATE custom_mixes SET {} WHERE id = ?{}",
                    update_parts.join(", "),
                    param_index
                );
                params_vec.push(Box::new(mix_id));

                let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter()
                    .map(|p| p.as_ref())
                    .collect();

                tx.execute(&query, params_refs.as_slice())?;
            }

            Ok(())
        })?;

        self.get_custom_mix_by_id(mix_id)
    }

    /// Delete a custom mix
    pub fn delete_custom_mix(&self, mix_id: u32) -> AppResult<()> {
        // Verify mix exists
        let _existing_mix = self.get_custom_mix_by_id(mix_id)?;

        Ok(self.db_manager.transaction(|tx| {
            // Delete any quiz sessions that used this mix
            tx.execute("DELETE FROM quiz_sessions WHERE mix_id = ?1", params![mix_id])?;

            // Delete the custom mix
            tx.execute("DELETE FROM custom_mixes WHERE id = ?1", params![mix_id])?;

            Ok(())
        })?)
    }

    /// Get available question count for a mix configuration
    pub fn get_available_question_count(&self, config: &MixConfig) -> AppResult<u32> {
        Ok(self.db_manager.execute(|conn| {
            let mut query = "SELECT COUNT(DISTINCT q.id) FROM questions q
                             JOIN subjects s ON q.subject_id = s.id
                             WHERE 1=1".to_string();

            let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
            let mut param_index = 1;

            // Filter by subjects
            if !config.subjects.is_empty() {
                let placeholders: Vec<String> = config.subjects.iter()
                    .map(|_| {
                        let placeholder = format!("?{}", param_index);
                        param_index += 1;
                        placeholder
                    })
                    .collect();
                query.push_str(&format!(" AND s.name IN ({})", placeholders.join(", ")));
                
                for subject in &config.subjects {
                    params_vec.push(Box::new(subject.clone()));
                }
            }

            // Filter by key stages
            if !config.key_stages.is_empty() {
                let placeholders: Vec<String> = config.key_stages.iter()
                    .map(|_| {
                        let placeholder = format!("?{}", param_index);
                        param_index += 1;
                        placeholder
                    })
                    .collect();
                query.push_str(&format!(" AND q.key_stage IN ({})", placeholders.join(", ")));
                
                for key_stage in &config.key_stages {
                    let ks_str = match key_stage {
                        KeyStage::KS1 => "KS1",
                        KeyStage::KS2 => "KS2",
                    };
                    params_vec.push(Box::new(ks_str.to_string()));
                }
            }

            // Filter by difficulty range
            query.push_str(&format!(" AND q.difficulty_level BETWEEN ?{} AND ?{}", param_index, param_index + 1));
            params_vec.push(Box::new(config.difficulty_range.0));
            params_vec.push(Box::new(config.difficulty_range.1));
            param_index += 2;

            // Filter by question types if specified
            if let Some(ref question_types) = config.question_types {
                if !question_types.is_empty() {
                    let placeholders: Vec<String> = question_types.iter()
                        .map(|_| {
                            let placeholder = format!("?{}", param_index);
                            param_index += 1;
                            placeholder
                        })
                        .collect();
                    query.push_str(&format!(" AND q.question_type IN ({})", placeholders.join(", ")));
                    
                    for question_type in question_types {
                        params_vec.push(Box::new(question_type.clone()));
                    }
                }
            }

            let mut stmt = conn.prepare(&query)?;
            let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter()
                .map(|p| p.as_ref())
                .collect();

            let count: i32 = stmt.query_row(params_refs.as_slice(), |row| row.get(0))?;
            Ok(count as u32)
        })?)
    }

    /// Validate that a mix configuration can generate the requested number of questions
    pub fn validate_mix_feasibility(&self, config: &MixConfig) -> AppResult<()> {
        let available_count = self.get_available_question_count(config)?;
        
        if available_count < config.question_count {
            return Err(AppError::InvalidQuestion(format!(
                "Not enough questions available. Requested: {}, Available: {}",
                config.question_count, available_count
            )));
        }

        Ok(())
    }

    /// Convert database row to CustomMix
    fn row_to_custom_mix(&self, row: &Row) -> Result<CustomMix, rusqlite::Error> {
        let config_json: String = row.get(3)?;
        let created_at_str: String = row.get(4)?;
        let updated_at_str: Option<String> = row.get(5)?;

        let config: MixConfig = serde_json::from_str(&config_json)
            .map_err(|_| rusqlite::Error::InvalidColumnType(3, "config".to_string(), rusqlite::types::Type::Text))?;

        let created_at = DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?
            .with_timezone(&Utc);

        let updated_at = if let Some(updated_str) = updated_at_str {
            Some(DateTime::parse_from_rfc3339(&updated_str)
                .map_err(|_| rusqlite::Error::InvalidColumnType(5, "updated_at".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc))
        } else {
            None
        };

        Ok(CustomMix {
            id: Some(row.get::<_, u32>(0)?),
            name: row.get::<_, String>(1)?,
            created_by: row.get::<_, u32>(2)?,
            config,
            created_at: Some(created_at),
            updated_at,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::DatabaseService;
    use crate::models::KeyStage;
    use tempfile::tempdir;

    fn create_test_custom_mix_manager() -> (CustomMixManager, tempfile::TempDir) {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db_service = DatabaseService::new(&db_path).unwrap();
        db_service.initialize().unwrap();
        
        let custom_mix_manager = CustomMixManager::new(db_service.manager());
        
        (custom_mix_manager, temp_dir)
    }

    #[test]
    fn test_create_custom_mix() {
        let (manager, _temp_dir) = create_test_custom_mix_manager();
        
        let config = MixConfig::new(
            vec!["mathematics".to_string()],
            vec![KeyStage::KS1],
            10,
        );
        
        let request = CreateMixRequest {
            name: "Test Mix".to_string(),
            created_by: 1,
            config,
        };
        
        let result = manager.create_custom_mix(request);
        assert!(result.is_ok());
        
        let mix = result.unwrap();
        assert_eq!(mix.name, "Test Mix");
        assert_eq!(mix.created_by, 1);
        assert!(mix.id.is_some());
    }

    #[test]
    fn test_get_custom_mix_by_id() {
        let (manager, _temp_dir) = create_test_custom_mix_manager();
        
        // Create a mix first
        let config = MixConfig::new(
            vec!["mathematics".to_string()],
            vec![KeyStage::KS1],
            5,
        );
        
        let request = CreateMixRequest {
            name: "Test Mix".to_string(),
            created_by: 1,
            config,
        };
        
        let created_mix = manager.create_custom_mix(request).unwrap();
        let mix_id = created_mix.id.unwrap();
        
        // Retrieve the mix
        let retrieved_mix = manager.get_custom_mix_by_id(mix_id).unwrap();
        assert_eq!(retrieved_mix.name, "Test Mix");
        assert_eq!(retrieved_mix.id, Some(mix_id));
    }

    #[test]
    fn test_update_custom_mix() {
        let (manager, _temp_dir) = create_test_custom_mix_manager();
        
        // Create a mix first
        let config = MixConfig::new(
            vec!["mathematics".to_string()],
            vec![KeyStage::KS1],
            5,
        );
        
        let request = CreateMixRequest {
            name: "Original Mix".to_string(),
            created_by: 1,
            config,
        };
        
        let created_mix = manager.create_custom_mix(request).unwrap();
        let mix_id = created_mix.id.unwrap();
        
        // Update the mix
        let updates = UpdateMixRequest {
            name: Some("Updated Mix".to_string()),
            config: None,
        };
        
        let updated_mix = manager.update_custom_mix(mix_id, updates).unwrap();
        assert_eq!(updated_mix.name, "Updated Mix");
        assert!(updated_mix.updated_at.is_some());
    }

    #[test]
    fn test_delete_custom_mix() {
        let (manager, _temp_dir) = create_test_custom_mix_manager();
        
        // Create a mix first
        let config = MixConfig::new(
            vec!["mathematics".to_string()],
            vec![KeyStage::KS1],
            5,
        );
        
        let request = CreateMixRequest {
            name: "Test Mix".to_string(),
            created_by: 1,
            config,
        };
        
        let created_mix = manager.create_custom_mix(request).unwrap();
        let mix_id = created_mix.id.unwrap();
        
        // Delete the mix
        let result = manager.delete_custom_mix(mix_id);
        assert!(result.is_ok());
        
        // Verify it's deleted
        let get_result = manager.get_custom_mix_by_id(mix_id);
        assert!(get_result.is_err());
    }

    #[test]
    fn test_get_custom_mixes_by_profile() {
        let (manager, _temp_dir) = create_test_custom_mix_manager();
        
        // Create mixes for different profiles
        let config1 = MixConfig::new(
            vec!["mathematics".to_string()],
            vec![KeyStage::KS1],
            5,
        );
        
        let config2 = MixConfig::new(
            vec!["geography".to_string()],
            vec![KeyStage::KS2],
            10,
        );
        
        let request1 = CreateMixRequest {
            name: "Profile 1 Mix".to_string(),
            created_by: 1,
            config: config1,
        };
        
        let request2 = CreateMixRequest {
            name: "Profile 2 Mix".to_string(),
            created_by: 2,
            config: config2,
        };
        
        manager.create_custom_mix(request1).unwrap();
        manager.create_custom_mix(request2).unwrap();
        
        // Get mixes for profile 1
        let profile1_mixes = manager.get_custom_mixes_by_profile(1).unwrap();
        assert_eq!(profile1_mixes.len(), 1);
        assert_eq!(profile1_mixes[0].name, "Profile 1 Mix");
        
        // Get mixes for profile 2
        let profile2_mixes = manager.get_custom_mixes_by_profile(2).unwrap();
        assert_eq!(profile2_mixes.len(), 1);
        assert_eq!(profile2_mixes[0].name, "Profile 2 Mix");
    }
}