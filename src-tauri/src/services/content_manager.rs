use crate::errors::{AppError, AppResult};
use crate::models::{Question, Subject, Asset, KeyStage, QuestionType};
use crate::database::DatabaseManager;
use crate::services::SecurityService;
use std::sync::Arc;
use std::path::{Path, PathBuf};
use std::fs;
use rusqlite::{params, Row};
use serde_json;

/// Content manager for loading and managing quiz content
pub struct ContentManager {
    db_manager: Arc<DatabaseManager>,
    security_service: SecurityService,
    content_directory: PathBuf,
}

impl ContentManager {
    /// Create a new content manager
    pub fn new(
        db_manager: Arc<DatabaseManager>,
        security_service: SecurityService,
        content_directory: PathBuf,
    ) -> Self {
        Self {
            db_manager,
            security_service,
            content_directory,
        }
    }
    
    /// Load a content pack from file system
    pub fn load_content_pack(&self, pack_path: &Path) -> AppResult<()> {
        // Verify the content pack exists
        if !pack_path.exists() {
            return Err(AppError::ContentManagement(
                format!("Content pack not found: {}", pack_path.display())
            ));
        }
        
        // Read and parse the content pack
        let content_data = fs::read(pack_path)
            .map_err(|e| AppError::ContentManagement(
                format!("Failed to read content pack: {}", e)
            ))?;
        
        let content_pack: ContentPack = serde_json::from_slice(&content_data)
            .map_err(|e| AppError::ContentManagement(
                format!("Invalid content pack format: {}", e)
            ))?;
        
        // Verify content signature if provided
        if let Some(ref signature) = content_pack.signature {
            let signature_bytes = hex::decode(signature)
                .map_err(|e| AppError::ContentManagement(
                    format!("Invalid signature format: {}", e)
                ))?;
            
            if !self.security_service.verify_update_signature(&content_data, &signature_bytes)? {
                return Err(AppError::ContentVerification(
                    "Content pack signature verification failed".to_string()
                ));
            }
        }
        
        // Load content into database
        self.install_content_pack(content_pack)?;
        
        Ok(())
    }
    
    /// Verify content package signature
    pub fn verify_content_signature(&self, pack: &ContentPack) -> AppResult<bool> {
        if let Some(ref signature) = pack.signature {
            let pack_data = serde_json::to_vec(pack)
                .map_err(|e| AppError::Serialization(e))?;
            
            let signature_bytes = hex::decode(signature)
                .map_err(|e| AppError::ContentManagement(
                    format!("Invalid signature format: {}", e)
                ))?;
            
            self.security_service.verify_update_signature(&pack_data, &signature_bytes)
        } else {
            // No signature provided - allow for development/testing
            Ok(true)
        }
    }
    
    /// Get all available subjects
    pub fn get_subjects(&self) -> AppResult<Vec<Subject>> {
        Ok(self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, display_name, icon_path, color_scheme, description FROM subjects ORDER BY name"
            )?;
            
            let subject_iter = stmt.query_map([], |row| {
                Ok(Subject {
                    id: Some(row.get::<_, u32>(0)?),
                    name: row.get::<_, String>(1)?,
                    display_name: row.get::<_, String>(2)?,
                    icon_path: row.get::<_, Option<String>>(3)?,
                    color_scheme: row.get::<_, Option<String>>(4)?,
                    description: row.get::<_, Option<String>>(5)?,
                })
            })?;
            
            let mut subjects = Vec::new();
            for subject in subject_iter {
                subjects.push(subject?);
            }
            
            Ok(subjects)
        })?)
    }
    
    /// Get questions by subject and key stage
    pub fn get_questions_by_subject(
        &self,
        subject_name: &str,
        key_stage: Option<KeyStage>,
        difficulty_range: Option<(u8, u8)>,
        limit: Option<usize>,
    ) -> AppResult<Vec<Question>> {
        Ok(self.db_manager.execute(|conn| {
            let mut query = "SELECT q.id, q.subject_id, q.key_stage, q.question_type, q.content, q.correct_answer, q.difficulty_level, q.tags, q.created_at
                             FROM questions q
                             JOIN subjects s ON q.subject_id = s.id
                             WHERE s.name = ?1".to_string();
            
            let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(subject_name.to_string())];
            let mut param_index = 2;
            
            if let Some(ks) = key_stage {
                query.push_str(&format!(" AND q.key_stage = ?{}", param_index));
                params_vec.push(Box::new(match ks {
                    KeyStage::KS1 => "KS1".to_string(),
                    KeyStage::KS2 => "KS2".to_string(),
                }));
                param_index += 1;
            }
            
            if let Some((min_diff, max_diff)) = difficulty_range {
                query.push_str(&format!(" AND q.difficulty_level BETWEEN ?{} AND ?{}", param_index, param_index + 1));
                params_vec.push(Box::new(min_diff));
                params_vec.push(Box::new(max_diff));
                param_index += 2;
            }
            
            query.push_str(" ORDER BY RANDOM()");
            
            if let Some(limit_count) = limit {
                query.push_str(&format!(" LIMIT ?{}", param_index));
                params_vec.push(Box::new(limit_count as i64));
            }
            
            let mut stmt = conn.prepare(&query)?;
            
            let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter()
                .map(|p| p.as_ref())
                .collect();
            
            let question_iter = stmt.query_map(params_refs.as_slice(), |row| {
                Ok(self.row_to_question(row)?)
            })?;
            
            let mut questions = Vec::new();
            for question_result in question_iter {
                let mut q = question_result?;
                // Load assets for this question
                q.assets = Some(self.get_question_assets(q.id.unwrap_or(0))?);
                questions.push(q);
            }
            
            Ok(questions)
        })?)
    }
    
    /// Get a specific question by ID
    pub fn get_question_by_id(&self, question_id: u32) -> AppResult<Question> {
        self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, subject_id, key_stage, question_type, content, correct_answer, difficulty_level, tags, created_at
                 FROM questions WHERE id = ?1"
            )?;
            
            let question = stmt.query_row(params![question_id], |row| {
                Ok(self.row_to_question(row)?)
            })?;
            
            let mut q = question;
            q.assets = Some(self.get_question_assets(question_id)?);
            
            Ok(q)
        }).map_err(|e| match e {
            crate::database::DatabaseError::Sqlite(rusqlite::Error::QueryReturnedNoRows) => AppError::NotFound(format!("Question with id {} not found", question_id)),
            _ => AppError::DatabaseConnection(e),
        })
    }
    
    /// Add a new question to the database
    pub fn add_question(&self, question: Question) -> AppResult<u32> {
        // Validate question data
        self.validate_question(&question)?;
        
        Ok(self.db_manager.transaction(|tx| {
            // Insert question
            let content_json = serde_json::to_string(&question.content)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let correct_answer_json = serde_json::to_string(&question.correct_answer)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let tags_json = serde_json::to_string(&question.tags)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let key_stage_str = match question.key_stage {
                KeyStage::KS1 => "KS1",
                KeyStage::KS2 => "KS2",
            };
            let question_type_str = match question.question_type {
                QuestionType::MultipleChoice => "multiple_choice",
                QuestionType::DragDrop => "drag_drop",
                QuestionType::Hotspot => "hotspot",
                QuestionType::FillBlank => "fill_blank",
                QuestionType::StoryQuiz => "story_quiz",
            };
            
            tx.execute(
                "INSERT INTO questions (subject_id, key_stage, question_type, content, correct_answer, difficulty_level, tags, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    question.subject_id,
                    key_stage_str,
                    question_type_str,
                    content_json,
                    correct_answer_json,
                    question.difficulty_level,
                    tags_json,
                    chrono::Utc::now().to_rfc3339()
                ],
            )?;
            
            let question_id = tx.last_insert_rowid() as u32;
            
            // Insert assets if any
            if let Some(assets) = &question.assets {
                for asset in assets {
                    let asset_type_str = match asset.asset_type {
                        crate::models::AssetType::Image => "image",
                        crate::models::AssetType::Audio => "audio",
                        crate::models::AssetType::Animation => "animation",
                    };
                    
                    tx.execute(
                        "INSERT INTO assets (question_id, asset_type, file_path, alt_text, file_size, created_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                        params![
                            question_id,
                            asset_type_str,
                            asset.file_path,
                            asset.alt_text,
                            asset.file_size,
                            chrono::Utc::now().to_rfc3339()
                        ],
                    )?;
                }
            }
            
            Ok(question_id)
        })?)
    }
    
    /// Update an existing question
    pub fn update_question(&self, question_id: u32, question: Question) -> AppResult<()> {
        // Validate question data
        self.validate_question(&question)?;
        
        // Verify question exists
        let _existing = self.get_question_by_id(question_id)?;
        
        Ok(self.db_manager.transaction(|tx| {
            let content_json = serde_json::to_string(&question.content)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let correct_answer_json = serde_json::to_string(&question.correct_answer)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let tags_json = serde_json::to_string(&question.tags)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
            let key_stage_str = match question.key_stage {
                KeyStage::KS1 => "KS1",
                KeyStage::KS2 => "KS2",
            };
            let question_type_str = match question.question_type {
                QuestionType::MultipleChoice => "multiple_choice",
                QuestionType::DragDrop => "drag_drop",
                QuestionType::Hotspot => "hotspot",
                QuestionType::FillBlank => "fill_blank",
                QuestionType::StoryQuiz => "story_quiz",
            };
            
            // Update question
            tx.execute(
                "UPDATE questions SET subject_id = ?1, key_stage = ?2, question_type = ?3, content = ?4, 
                 correct_answer = ?5, difficulty_level = ?6, tags = ?7 WHERE id = ?8",
                params![
                    question.subject_id,
                    key_stage_str,
                    question_type_str,
                    content_json,
                    correct_answer_json,
                    question.difficulty_level,
                    tags_json,
                    question_id
                ],
            )?;
            
            // Delete existing assets
            tx.execute("DELETE FROM assets WHERE question_id = ?1", params![question_id])?;
            
            // Insert new assets if any
            if let Some(assets) = &question.assets {
                for asset in assets {
                    let asset_type_str = match asset.asset_type {
                        crate::models::AssetType::Image => "image",
                        crate::models::AssetType::Audio => "audio",
                        crate::models::AssetType::Animation => "animation",
                    };
                    
                    tx.execute(
                        "INSERT INTO assets (question_id, asset_type, file_path, alt_text, file_size, created_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                        params![
                            question_id,
                            asset_type_str,
                            asset.file_path,
                            asset.alt_text,
                            asset.file_size,
                            chrono::Utc::now().to_rfc3339()
                        ],
                    )?;
                }
            }
            
            Ok(())
        })?)
    }
    
    /// Delete a question
    pub fn delete_question(&self, question_id: u32) -> AppResult<()> {
        // Verify question exists
        let _existing = self.get_question_by_id(question_id)?;
        
        Ok(self.db_manager.transaction(|tx| {
            // Delete assets first (foreign key constraint)
            tx.execute("DELETE FROM assets WHERE question_id = ?1", params![question_id])?;
            
            // Delete question
            tx.execute("DELETE FROM questions WHERE id = ?1", params![question_id])?;
            
            Ok(())
        })?)
    }
    
    /// Get content statistics
    pub fn get_content_statistics(&self) -> AppResult<ContentStatistics> {
        Ok(self.db_manager.execute(|conn| {
            let total_questions: i32 = conn.query_row(
                "SELECT COUNT(*) FROM questions",
                [],
                |row| row.get(0)
            )?;
            
            let total_subjects: i32 = conn.query_row(
                "SELECT COUNT(*) FROM subjects",
                [],
                |row| row.get(0)
            )?;
            
            let total_assets: i32 = conn.query_row(
                "SELECT COUNT(*) FROM assets",
                [],
                |row| row.get(0)
            )?;
            
            // Get questions by subject
            let mut stmt = conn.prepare(
                "SELECT s.name, COUNT(q.id) FROM subjects s 
                 LEFT JOIN questions q ON s.id = q.subject_id 
                 GROUP BY s.id, s.name"
            )?;
            
            let subject_iter = stmt.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
            })?;
            
            let mut questions_by_subject = std::collections::HashMap::new();
            for result in subject_iter {
                let (subject, count) = result?;
                questions_by_subject.insert(subject, count as u32);
            }
            
            Ok(ContentStatistics {
                total_questions: total_questions as u32,
                total_subjects: total_subjects as u32,
                total_assets: total_assets as u32,
                questions_by_subject,
            })
        })?)
    }
    
    /// Install content pack into database
    fn install_content_pack(&self, content_pack: ContentPack) -> AppResult<()> {
        Ok(self.db_manager.transaction(|tx| {
            
            // Install subjects first
            for subject in &content_pack.subjects {
                tx.execute(
                    "INSERT OR REPLACE INTO subjects (name, display_name, icon_path, color_scheme, description)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![
                        subject.name,
                        subject.display_name,
                        subject.icon_path,
                        subject.color_scheme,
                        subject.description
                    ],
                )?;
            }
            
            // Install questions
            for question in &content_pack.questions {
                let content_json = serde_json::to_string(&question.content)
                    .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
                let correct_answer_json = serde_json::to_string(&question.correct_answer)
                    .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
                let tags_json = serde_json::to_string(&question.tags)
                    .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
                
                // Get subject_id
                let subject_id: u32 = tx.query_row(
                    "SELECT id FROM subjects WHERE name = ?1",
                    params![&question.subject_name],
                    |row| row.get(0)
                )?;
                
                let key_stage_str = match question.key_stage {
                    KeyStage::KS1 => "KS1",
                    KeyStage::KS2 => "KS2",
                };
                
                let question_type_str = match question.question_type {
                    QuestionType::MultipleChoice => "multiple_choice",
                    QuestionType::DragDrop => "drag_drop",
                    QuestionType::Hotspot => "hotspot",
                    QuestionType::FillBlank => "fill_blank",
                    QuestionType::StoryQuiz => "story_quiz",
                };
                
                tx.execute(
                    "INSERT INTO questions (subject_id, key_stage, question_type, content, correct_answer, difficulty_level, tags, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                    params![
                        subject_id,
                        key_stage_str,
                        question_type_str,
                        content_json,
                        correct_answer_json,
                        question.difficulty_level,
                        tags_json,
                        chrono::Utc::now().to_rfc3339()
                    ],
                )?;
                
                let question_id = tx.last_insert_rowid() as u32;
                
                // Install assets
                if let Some(assets) = &question.assets {
                    for asset in assets {
                        let asset_type_str = match asset.asset_type {
                            crate::models::AssetType::Image => "image",
                            crate::models::AssetType::Audio => "audio",
                            crate::models::AssetType::Animation => "animation",
                        };
                        
                        tx.execute(
                            "INSERT INTO assets (question_id, asset_type, file_path, alt_text, file_size, created_at)
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                            params![
                                question_id,
                                asset_type_str,
                                asset.file_path,
                                asset.alt_text,
                                asset.file_size,
                                chrono::Utc::now().to_rfc3339()
                            ],
                        )?;
                    }
                }
            }
            
            Ok(())
        })?)
    }
    
    /// Convert database row to Question
    fn row_to_question(&self, row: &Row) -> Result<Question, rusqlite::Error> {
        let content_json: String = row.get(4)?;
        let correct_answer_json: String = row.get(5)?;
        let tags_json: String = row.get(7)?;
        let created_at_str: String = row.get(8)?;
        
        let content = serde_json::from_str(&content_json)
            .map_err(|_| rusqlite::Error::InvalidColumnType(4, "content".to_string(), rusqlite::types::Type::Text))?;
        
        let correct_answer = serde_json::from_str(&correct_answer_json)
            .map_err(|_| rusqlite::Error::InvalidColumnType(5, "correct_answer".to_string(), rusqlite::types::Type::Text))?;
        
        let tags = serde_json::from_str(&tags_json)
            .map_err(|_| rusqlite::Error::InvalidColumnType(7, "tags".to_string(), rusqlite::types::Type::Text))?;
        
        let key_stage = match row.get::<_, String>(2)?.as_str() {
            "KS1" => KeyStage::KS1,
            "KS2" => KeyStage::KS2,
            _ => return Err(rusqlite::Error::InvalidColumnType(2, "key_stage".to_string(), rusqlite::types::Type::Text)),
        };
        
        let question_type = match row.get::<_, String>(3)?.as_str() {
            "multiple_choice" => QuestionType::MultipleChoice,
            "drag_drop" => QuestionType::DragDrop,
            "hotspot" => QuestionType::Hotspot,
            "fill_blank" => QuestionType::FillBlank,
            "story_quiz" => QuestionType::StoryQuiz,
            _ => return Err(rusqlite::Error::InvalidColumnType(3, "question_type".to_string(), rusqlite::types::Type::Text)),
        };
        
        let created_at = chrono::DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|_| rusqlite::Error::InvalidColumnType(8, "created_at".to_string(), rusqlite::types::Type::Text))?
            .with_timezone(&chrono::Utc);
        
        Ok(Question {
            id: Some(row.get::<_, u32>(0)?),
            subject_id: row.get::<_, u32>(1)?,
            key_stage,
            question_type,
            content,
            correct_answer,
            difficulty_level: row.get::<_, u8>(6)?,
            tags,
            assets: None, // Will be loaded separately
            created_at: Some(created_at),
        })
    }
    
    /// Get assets for a question
    fn get_question_assets(&self, _question_id: u32) -> Result<Vec<Asset>, rusqlite::Error> {
        // This would be called within a database transaction, so we need to handle it differently
        // For now, return empty vector - this should be implemented properly in a real system
        Ok(Vec::new())
    }
    
    /// Validate question data
    fn validate_question(&self, question: &Question) -> AppResult<()> {
        if question.content.text.trim().is_empty() {
            return Err(AppError::InvalidQuestion("Question text cannot be empty".to_string()));
        }
        
        if question.difficulty_level < 1 || question.difficulty_level > 5 {
            return Err(AppError::InvalidQuestion("Difficulty level must be between 1 and 5".to_string()));
        }
        
        // Validate question type specific content
        match question.question_type {
            QuestionType::MultipleChoice => {
                if question.content.options.is_none() || question.content.options.as_ref().unwrap().is_empty() {
                    return Err(AppError::InvalidQuestion("Multiple choice questions must have options".to_string()));
                }
            },
            QuestionType::Hotspot => {
                if question.content.image_url.is_none() {
                    return Err(AppError::InvalidQuestion("Hotspot questions must have an image".to_string()));
                }
                if question.content.hotspots.is_none() || question.content.hotspots.as_ref().unwrap().is_empty() {
                    return Err(AppError::InvalidQuestion("Hotspot questions must have hotspot coordinates".to_string()));
                }
            },
            QuestionType::FillBlank => {
                if question.content.blanks.is_none() || question.content.blanks.as_ref().unwrap().is_empty() {
                    return Err(AppError::InvalidQuestion("Fill-in-blank questions must have blank configurations".to_string()));
                }
            },
            QuestionType::StoryQuiz => {
                if question.content.story.is_none() || question.content.story.as_ref().unwrap().trim().is_empty() {
                    return Err(AppError::InvalidQuestion("Story quiz questions must have a story".to_string()));
                }
            },
            QuestionType::DragDrop => {
                // Drag drop validation would depend on specific implementation
            },
        }
        
        Ok(())
    }
}

/// Content pack structure for loading external content
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ContentPack {
    pub version: String,
    pub name: String,
    pub description: Option<String>,
    pub subjects: Vec<Subject>,
    pub questions: Vec<ContentPackQuestion>,
    pub signature: Option<String>,
}

/// Question structure in content packs (includes subject name instead of ID)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ContentPackQuestion {
    pub subject_name: String,
    pub key_stage: KeyStage,
    pub question_type: QuestionType,
    pub content: crate::models::QuestionContent,
    pub correct_answer: crate::models::Answer,
    pub difficulty_level: u8,
    pub tags: Vec<String>,
    pub assets: Option<Vec<Asset>>,
}

/// Content statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ContentStatistics {
    pub total_questions: u32,
    pub total_subjects: u32,
    pub total_assets: u32,
    pub questions_by_subject: std::collections::HashMap<String, u32>,
}

// Add hex dependency for signature decoding
// This is a placeholder - in a real implementation you'd add hex to Cargo.toml
mod hex {
    pub fn decode(s: &str) -> Result<Vec<u8>, String> {
        if s.len() % 2 != 0 {
            return Err("Invalid hex string length".to_string());
        }
        
        let mut result = Vec::new();
        for chunk in s.as_bytes().chunks(2) {
            let hex_str = std::str::from_utf8(chunk).map_err(|_| "Invalid UTF-8")?;
            let byte = u8::from_str_radix(hex_str, 16).map_err(|_| "Invalid hex character")?;
            result.push(byte);
        }
        
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::DatabaseService;
    use tempfile::tempdir;

    fn create_test_content_manager() -> (ContentManager, tempfile::TempDir) {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db_service = DatabaseService::new(&db_path).unwrap();
        db_service.initialize().unwrap();
        
        let security_service = SecurityService::new().unwrap();
        let content_dir = temp_dir.path().join("content");
        fs::create_dir_all(&content_dir).unwrap();
        
        let content_manager = ContentManager::new(
            db_service.manager(),
            security_service,
            content_dir,
        );
        
        (content_manager, temp_dir)
    }

    #[test]
    fn test_get_subjects() {
        let (content_manager, _temp_dir) = create_test_content_manager();
        
        let subjects = content_manager.get_subjects().unwrap();
        // Should return the default subjects from schema
        assert_eq!(subjects.len(), 5);
        assert!(subjects.iter().any(|s| s.name == "mathematics"));
        assert!(subjects.iter().any(|s| s.name == "geography"));
    }

    #[test]
    fn test_content_statistics() {
        let (content_manager, _temp_dir) = create_test_content_manager();
        
        let stats = content_manager.get_content_statistics().unwrap();
        assert_eq!(stats.total_questions, 0);
        assert_eq!(stats.total_subjects, 5); // Default subjects from schema
        assert_eq!(stats.total_assets, 0);
    }

    #[test]
    fn test_question_validation() {
        let (content_manager, _temp_dir) = create_test_content_manager();
        
        // Test empty question text
        let invalid_question = Question {
            id: None,
            subject_id: 1,
            key_stage: KeyStage::KS1,
            question_type: QuestionType::MultipleChoice,
            content: crate::models::QuestionContent {
                text: "".to_string(),
                options: Some(vec!["A".to_string(), "B".to_string()]),
                story: None,
                image_url: None,
                hotspots: None,
                blanks: None,
                additional_data: None,
            },
            correct_answer: crate::models::Answer::Text("A".to_string()),
            difficulty_level: 1,
            tags: Vec::new(),
            assets: None,
            created_at: None,
        };
        
        let result = content_manager.validate_question(&invalid_question);
        assert!(result.is_err());
    }
}