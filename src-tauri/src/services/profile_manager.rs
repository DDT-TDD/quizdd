use crate::errors::{AppError, AppResult};
use crate::models::{Profile, CreateProfileRequest, Progress};
use crate::database::DatabaseManager;
use crate::services::SecurityService;
use std::sync::Arc;
use rusqlite::params;
use chrono::{DateTime, Utc};

/// Profile manager for handling user profile CRUD operations
pub struct ProfileManager {
    db_manager: Arc<DatabaseManager>,
    security_service: SecurityService,
}

impl ProfileManager {
    /// Create a new profile manager
    pub fn new(db_manager: Arc<DatabaseManager>, security_service: SecurityService) -> Self {
        Self {
            db_manager,
            security_service,
        }
    }
    
    /// Create a new user profile
    pub fn create_profile(&self, request: CreateProfileRequest) -> AppResult<Profile> {
        // Validate input
        if request.name.trim().is_empty() {
            return Err(AppError::InvalidInput("Profile name cannot be empty".to_string()));
        }
        
        if request.name.len() > 50 {
            return Err(AppError::InvalidInput("Profile name too long (max 50 characters)".to_string()));
        }
        
        if request.avatar.trim().is_empty() {
            return Err(AppError::InvalidInput("Avatar selection is required".to_string()));
        }
        
        // Check if profile name already exists
        if self.profile_name_exists(&request.name)? {
            return Err(AppError::InvalidInput("Profile name already exists".to_string()));
        }
        
        let theme_preference = request.theme_preference.unwrap_or_else(|| "default".to_string());
        
        let profile_id = self.db_manager.execute(|conn| {
            conn.execute(
                "INSERT INTO profiles (name, avatar, theme_preference, created_at) VALUES (?1, ?2, ?3, ?4)",
                params![
                    request.name,
                    request.avatar,
                    theme_preference,
                    Utc::now().to_rfc3339()
                ],
            )?;
            
            let id = conn.last_insert_rowid() as u32;
            Ok(id)
        })?;
        
        // Initialize progress for the new profile
        self.initialize_profile_progress(profile_id)?;
        
        // Return the created profile
        self.get_profile_by_id(profile_id)
    }
    
    /// Get a profile by ID
    pub fn get_profile_by_id(&self, profile_id: u32) -> AppResult<Profile> {
        self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, avatar, created_at, theme_preference FROM profiles WHERE id = ?1"
            )?;
            
            let profile = stmt.query_row(params![profile_id], |row| {
                Ok(Profile {
                    id: Some(row.get::<_, u32>(0)?),
                    name: row.get::<_, String>(1)?,
                    avatar: row.get::<_, String>(2)?,
                    created_at: Some(DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                        .map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?
                        .with_timezone(&Utc)),
                    theme_preference: row.get::<_, String>(4)?,
                })
            })?;
            
            Ok(profile)
        }).map_err(|e| match e {
            crate::database::DatabaseError::Sqlite(rusqlite::Error::QueryReturnedNoRows) => AppError::ProfileNotFound { id: profile_id },
            _ => AppError::DatabaseConnection(e),
        })
    }
    
    /// Get all profiles
    pub fn get_all_profiles(&self) -> AppResult<Vec<Profile>> {
        let profiles = self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, avatar, created_at, theme_preference FROM profiles ORDER BY created_at DESC"
            )?;
            
            let profile_iter = stmt.query_map([], |row| {
                Ok(Profile {
                    id: Some(row.get::<_, u32>(0)?),
                    name: row.get::<_, String>(1)?,
                    avatar: row.get::<_, String>(2)?,
                    created_at: Some(DateTime::parse_from_rfc3339(&row.get::<_, String>(3)?)
                        .map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?
                        .with_timezone(&Utc)),
                    theme_preference: row.get::<_, String>(4)?,
                })
            })?;
            
            let mut profiles = Vec::new();
            for profile in profile_iter {
                profiles.push(profile?);
            }
            
            Ok(profiles)
        })?;

        // If no profiles exist, create a default one
        if profiles.is_empty() {
            let default_profile = self.create_profile(CreateProfileRequest {
                name: "Default User".to_string(),
                avatar: "😊".to_string(),
                theme_preference: Some("default".to_string()),
            })?;
            Ok(vec![default_profile])
        } else {
            Ok(profiles)
        }
    }
    
    /// Update a profile
    pub fn update_profile(&self, profile_id: u32, updates: ProfileUpdateRequest) -> AppResult<Profile> {
        // Validate that profile exists
        let _existing_profile = self.get_profile_by_id(profile_id)?;
        
        // Validate updates
        if let Some(ref name) = updates.name {
            if name.trim().is_empty() {
                return Err(AppError::InvalidInput("Profile name cannot be empty".to_string()));
            }
            if name.len() > 50 {
                return Err(AppError::InvalidInput("Profile name too long (max 50 characters)".to_string()));
            }
            // Check if new name conflicts with existing profiles (excluding current profile)
            if self.profile_name_exists_excluding(name, profile_id)? {
                return Err(AppError::InvalidInput("Profile name already exists".to_string()));
            }
        }
        
        if let Some(ref avatar) = updates.avatar {
            if avatar.trim().is_empty() {
                return Err(AppError::InvalidInput("Avatar selection is required".to_string()));
            }
        }
        
        // Build dynamic update query
        let mut update_fields = Vec::new();
        let mut params_vec = Vec::new();
        
        if let Some(name) = updates.name {
            update_fields.push("name = ?");
            params_vec.push(name);
        }
        
        if let Some(avatar) = updates.avatar {
            update_fields.push("avatar = ?");
            params_vec.push(avatar);
        }
        
        if let Some(theme_preference) = updates.theme_preference {
            update_fields.push("theme_preference = ?");
            params_vec.push(theme_preference);
        }
        
        if update_fields.is_empty() {
            return self.get_profile_by_id(profile_id); // No updates, return existing profile
        }
        
        // Add profile_id as the last parameter
        params_vec.push(profile_id.to_string());
        
        let query = format!(
            "UPDATE profiles SET {} WHERE id = ?",
            update_fields.join(", ")
        );
        
        self.db_manager.execute(|conn| {
            let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter()
                .map(|p| p as &dyn rusqlite::ToSql)
                .collect();
            
            conn.execute(&query, params_refs.as_slice())?;
            Ok(())
        })?;
        
        // Return updated profile
        self.get_profile_by_id(profile_id)
    }
    
    /// Delete a profile
    pub fn delete_profile(&self, profile_id: u32) -> AppResult<()> {
        // Validate that profile exists
        let _existing_profile = self.get_profile_by_id(profile_id)?;
        
        Ok(self.db_manager.transaction(|tx| {
            // Delete progress data
            tx.execute("DELETE FROM progress WHERE profile_id = ?1", params![profile_id])?;
            
            // Delete quiz sessions
            tx.execute("DELETE FROM quiz_sessions WHERE profile_id = ?1", params![profile_id])?;
            
            // Delete the profile
            tx.execute("DELETE FROM profiles WHERE id = ?1", params![profile_id])?;
            
            Ok(())
        })?)
    }
    
    /// Get progress for a profile
    pub fn get_progress(&self, profile_id: u32) -> AppResult<Progress> {
        // Validate that profile exists
        let _profile = self.get_profile_by_id(profile_id)?;
        
        Ok(self.db_manager.execute(|conn| {
            // Get progress data
            let mut stmt = conn.prepare(
                "SELECT subject, key_stage, questions_answered, correct_answers, total_time_spent, last_activity 
                 FROM progress WHERE profile_id = ?1"
            )?;
            
            let progress_iter = stmt.query_map(params![profile_id], |row| {
                Ok((
                    row.get::<_, String>(0)?, // subject
                    row.get::<_, String>(1)?, // key_stage
                    row.get::<_, u32>(2)?,    // questions_answered
                    row.get::<_, u32>(3)?,    // correct_answers
                    row.get::<_, u32>(4)?,    // total_time_spent
                    row.get::<_, String>(5)?, // last_activity
                ))
            })?;
            
            let mut subject_progress = std::collections::HashMap::new();
            let mut total_questions = 0;
            let mut total_correct = 0;
            
            for progress_row in progress_iter {
                let (subject, key_stage, questions_answered, correct_answers, time_spent, _last_activity) = progress_row?;
                
                total_questions += questions_answered;
                total_correct += correct_answers;
                
                let subject_key = format!("{}_{}", subject, key_stage);
                subject_progress.insert(subject_key, crate::models::SubjectProgress {
                    subject: subject.clone(),
                    key_stage: key_stage.clone(),
                    questions_answered,
                    correct_answers,
                    accuracy_percentage: if questions_answered > 0 {
                        (correct_answers as f64 / questions_answered as f64 * 100.0) as u8
                    } else {
                        0
                    },
                    time_spent_seconds: time_spent,
                    last_activity: chrono::Utc::now(), // Simplified for now
                });
            }

            // Get achievements
            let mut achievements_stmt = conn.prepare(
                "SELECT achievement_id, name, description, icon, category, earned_at 
                 FROM achievements WHERE profile_id = ?1 ORDER BY earned_at DESC"
            )?;
            
            let achievements_iter = achievements_stmt.query_map(params![profile_id], |row| {
                let category_str: String = row.get(4)?;
                let category = match category_str.as_str() {
                    "accuracy" => crate::models::AchievementCategory::Accuracy,
                    "streak" => crate::models::AchievementCategory::Streak,
                    "completion" => crate::models::AchievementCategory::Completion,
                    "time" => crate::models::AchievementCategory::Time,
                    "subject_mastery" => crate::models::AchievementCategory::SubjectMastery,
                    _ => crate::models::AchievementCategory::Completion,
                };

                Ok(crate::models::Achievement {
                    id: row.get::<_, String>(0)?,
                    name: row.get::<_, String>(1)?,
                    description: row.get::<_, String>(2)?,
                    icon: row.get::<_, String>(3)?,
                    category,
                    earned_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(5)?)
                        .map_err(|_| rusqlite::Error::InvalidColumnType(5, "earned_at".to_string(), rusqlite::types::Type::Text))?
                        .with_timezone(&Utc),
                })
            })?;

            let mut achievements = Vec::new();
            for achievement in achievements_iter {
                achievements.push(achievement?);
            }
            
            Ok(Progress {
                subject_progress,
                total_questions_answered: total_questions,
                total_correct_answers: total_correct,
                achievements,
                streaks: Vec::new(), // TODO: Implement streaks
            })
        })?)
    }
    
    /// Update progress for a profile after quiz completion
    pub fn update_progress(&self, profile_id: u32, quiz_result: QuizResult) -> AppResult<()> {
        // Validate that profile exists
        let _profile = self.get_profile_by_id(profile_id)?;
        
        self.db_manager.execute(|conn| {
            // Use INSERT OR REPLACE to handle both new and existing progress records
            conn.execute(
                "INSERT OR REPLACE INTO progress 
                 (profile_id, subject, key_stage, questions_answered, correct_answers, total_time_spent, last_activity)
                 VALUES (
                     ?1, ?2, ?3,
                     COALESCE((SELECT questions_answered FROM progress WHERE profile_id = ?1 AND subject = ?2 AND key_stage = ?3), 0) + ?4,
                     COALESCE((SELECT correct_answers FROM progress WHERE profile_id = ?1 AND subject = ?2 AND key_stage = ?3), 0) + ?5,
                     COALESCE((SELECT total_time_spent FROM progress WHERE profile_id = ?1 AND subject = ?2 AND key_stage = ?3), 0) + ?6,
                     ?7
                 )",
                params![
                    profile_id,
                    quiz_result.subject,
                    quiz_result.key_stage,
                    quiz_result.questions_answered,
                    quiz_result.correct_answers,
                    quiz_result.time_spent_seconds,
                    Utc::now().to_rfc3339()
                ],
            )?;
            
            Ok(())
        })?;

        // Check and award achievements after updating progress
        self.check_and_award_achievements(profile_id)?;
        
        Ok(())
    }

    /// Check for and award new achievements based on current progress
    fn check_and_award_achievements(&self, profile_id: u32) -> AppResult<()> {
        let progress = self.get_progress(profile_id)?;
        let mut new_achievements = Vec::new();

        // First Steps Achievement
        if progress.total_questions_answered >= 1 && 
           !progress.achievements.iter().any(|a| a.id == "first_steps") {
            new_achievements.push(crate::models::Achievement {
                id: "first_steps".to_string(),
                name: "First Steps".to_string(),
                description: "Answered your first question!".to_string(),
                icon: "👶".to_string(),
                earned_at: Utc::now(),
                category: crate::models::AchievementCategory::Completion,
            });
        }

        // Perfect Score Achievement
        let overall_accuracy = if progress.total_questions_answered > 0 {
            (progress.total_correct_answers as f64 / progress.total_questions_answered as f64) * 100.0
        } else {
            0.0
        };

        if overall_accuracy == 100.0 && progress.total_questions_answered >= 5 &&
           !progress.achievements.iter().any(|a| a.id == "perfect_score") {
            new_achievements.push(crate::models::Achievement {
                id: "perfect_score".to_string(),
                name: "Perfect Score".to_string(),
                description: "Achieved 100% accuracy with at least 5 questions!".to_string(),
                icon: "💯".to_string(),
                earned_at: Utc::now(),
                category: crate::models::AchievementCategory::Accuracy,
            });
        }

        // Quick Learner Achievement
        if progress.total_questions_answered >= 10 &&
           !progress.achievements.iter().any(|a| a.id == "quick_learner") {
            new_achievements.push(crate::models::Achievement {
                id: "quick_learner".to_string(),
                name: "Quick Learner".to_string(),
                description: "Answered 10 questions!".to_string(),
                icon: "⚡".to_string(),
                earned_at: Utc::now(),
                category: crate::models::AchievementCategory::Completion,
            });
        }

        // Subject Explorer Achievement
        let subjects_with_progress = progress.subject_progress.values()
            .filter(|sp| sp.questions_answered > 0)
            .map(|sp| sp.subject.clone())
            .collect::<std::collections::HashSet<_>>();

        if subjects_with_progress.len() >= 3 &&
           !progress.achievements.iter().any(|a| a.id == "subject_explorer") {
            new_achievements.push(crate::models::Achievement {
                id: "subject_explorer".to_string(),
                name: "Subject Explorer".to_string(),
                description: "Tried questions from 3 different subjects!".to_string(),
                icon: "🗺️".to_string(),
                earned_at: Utc::now(),
                category: crate::models::AchievementCategory::SubjectMastery,
            });
        }

        // Save new achievements to database
        for achievement in new_achievements {
            self.save_achievement(profile_id, &achievement)?;
        }

        Ok(())
    }

    /// Save an achievement to the database
    fn save_achievement(&self, profile_id: u32, achievement: &crate::models::Achievement) -> AppResult<()> {
        self.db_manager.execute(|conn| {
            conn.execute(
                "INSERT OR IGNORE INTO achievements (profile_id, achievement_id, name, description, icon, category, earned_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    profile_id,
                    achievement.id,
                    achievement.name,
                    achievement.description,
                    achievement.icon,
                    format!("{:?}", achievement.category).to_lowercase(),
                    achievement.earned_at.to_rfc3339()
                ],
            )?;
            Ok(())
        })?;
        Ok(())
    }
    
    /// Check if a profile name already exists
    fn profile_name_exists(&self, name: &str) -> AppResult<bool> {
        Ok(self.db_manager.execute(|conn| {
            let count: i32 = conn.query_row(
                "SELECT COUNT(*) FROM profiles WHERE LOWER(name) = LOWER(?1)",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?)
    }
    
    /// Check if a profile name exists excluding a specific profile ID
    fn profile_name_exists_excluding(&self, name: &str, exclude_id: u32) -> AppResult<bool> {
        Ok(self.db_manager.execute(|conn| {
            let count: i32 = conn.query_row(
                "SELECT COUNT(*) FROM profiles WHERE LOWER(name) = LOWER(?1) AND id != ?2",
                params![name, exclude_id],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?)
    }
    
    /// Initialize progress tracking for a new profile
    fn initialize_profile_progress(&self, profile_id: u32) -> AppResult<()> {
        // Initialize progress entries for all subjects and key stages
        let subjects = vec!["Mathematics", "Geography", "English", "Science", "General Knowledge"];
        let key_stages = vec!["KS1", "KS2"];
        
        Ok(self.db_manager.execute(|conn| {
            for subject in &subjects {
                for key_stage in &key_stages {
                    conn.execute(
                        "INSERT INTO progress (profile_id, subject, key_stage, questions_answered, correct_answers, total_time_spent, last_activity)
                         VALUES (?1, ?2, ?3, 0, 0, 0, ?4)",
                        params![
                            profile_id,
                            subject,
                            key_stage,
                            Utc::now().to_rfc3339()
                        ],
                    )?;
                }
            }
            Ok(())
        })?)
    }
}

/// Request structure for updating profiles
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProfileUpdateRequest {
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub theme_preference: Option<String>,
}

/// Quiz result structure for progress updates
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct QuizResult {
    pub subject: String,
    pub key_stage: String,
    pub questions_answered: u32,
    pub correct_answers: u32,
    pub time_spent_seconds: u32,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::DatabaseService;
    use tempfile::tempdir;

    fn create_test_profile_manager() -> (ProfileManager, tempfile::TempDir) {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db_service = DatabaseService::new(&db_path).unwrap();
        db_service.initialize().unwrap();
        
        let security_service = SecurityService::new().unwrap();
        let profile_manager = ProfileManager::new(db_service.manager(), security_service);
        
        (profile_manager, temp_dir)
    }

    #[test]
    fn test_create_profile() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        let request = CreateProfileRequest {
            name: "Test Child".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: Some("colorful".to_string()),
        };
        
        let profile = profile_manager.create_profile(request).unwrap();
        
        assert!(profile.id.is_some());
        assert_eq!(profile.name, "Test Child");
        assert_eq!(profile.avatar, "avatar1");
        assert_eq!(profile.theme_preference, "colorful");
    }

    #[test]
    fn test_create_profile_validation() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        // Empty name should fail
        let request = CreateProfileRequest {
            name: "".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: None,
        };
        
        let result = profile_manager.create_profile(request);
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::InvalidInput(_)));
    }

    #[test]
    fn test_get_profile_by_id() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        let request = CreateProfileRequest {
            name: "Test Child".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: None,
        };
        
        let created_profile = profile_manager.create_profile(request).unwrap();
        let profile_id = created_profile.id.unwrap();
        
        let retrieved_profile = profile_manager.get_profile_by_id(profile_id).unwrap();
        
        assert_eq!(retrieved_profile.id, created_profile.id);
        assert_eq!(retrieved_profile.name, created_profile.name);
    }

    #[test]
    fn test_update_profile() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        let request = CreateProfileRequest {
            name: "Test Child".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: None,
        };
        
        let profile = profile_manager.create_profile(request).unwrap();
        let profile_id = profile.id.unwrap();
        
        let update_request = ProfileUpdateRequest {
            name: Some("Updated Child".to_string()),
            avatar: Some("avatar2".to_string()),
            theme_preference: Some("dark".to_string()),
        };
        
        let updated_profile = profile_manager.update_profile(profile_id, update_request).unwrap();
        
        assert_eq!(updated_profile.name, "Updated Child");
        assert_eq!(updated_profile.avatar, "avatar2");
        assert_eq!(updated_profile.theme_preference, "dark");
    }

    #[test]
    fn test_delete_profile() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        let request = CreateProfileRequest {
            name: "Test Child".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: None,
        };
        
        let profile = profile_manager.create_profile(request).unwrap();
        let profile_id = profile.id.unwrap();
        
        // Delete the profile
        profile_manager.delete_profile(profile_id).unwrap();
        
        // Verify it's deleted
        let result = profile_manager.get_profile_by_id(profile_id);
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::ProfileNotFound { .. }));
    }

    #[test]
    fn test_progress_tracking() {
        let (profile_manager, _temp_dir) = create_test_profile_manager();
        
        let request = CreateProfileRequest {
            name: "Test Child".to_string(),
            avatar: "avatar1".to_string(),
            theme_preference: None,
        };
        
        let profile = profile_manager.create_profile(request).unwrap();
        let profile_id = profile.id.unwrap();
        
        // Update progress
        let quiz_result = QuizResult {
            subject: "Mathematics".to_string(),
            key_stage: "KS1".to_string(),
            questions_answered: 10,
            correct_answers: 8,
            time_spent_seconds: 300,
        };
        
        profile_manager.update_progress(profile_id, quiz_result).unwrap();
        
        // Get progress
        let progress = profile_manager.get_progress(profile_id).unwrap();
        
        assert_eq!(progress.total_questions_answered, 10);
        assert_eq!(progress.total_correct_answers, 8);
        
        let math_progress = progress.subject_progress.get("Mathematics_KS1").unwrap();
        assert_eq!(math_progress.questions_answered, 10);
        assert_eq!(math_progress.correct_answers, 8);
        assert_eq!(math_progress.accuracy_percentage, 80);
    }
}