#[cfg(test)]
mod tests {
    use super::super::profile_manager::*;
    use crate::database::connection::DatabaseConnection;
    use crate::models::profile::Profile;
    use crate::models::progress::Progress;
    use tempfile::tempdir;
    use tokio_test;

    fn create_test_db() -> DatabaseConnection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        DatabaseConnection::new(db_path.to_str().unwrap()).unwrap()
    }

    #[tokio::test]
    async fn test_create_profile() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        let result = profile_manager.create_profile(
            "Test Child".to_string(),
            "avatar1".to_string()
        ).await;
        
        assert!(result.is_ok());
        let profile = result.unwrap();
        assert_eq!(profile.name, "Test Child");
        assert_eq!(profile.avatar, "avatar1");
        assert!(profile.id > 0);
    }

    #[tokio::test]
    async fn test_get_profile_by_id() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create a profile first
        let created_profile = profile_manager.create_profile(
            "Test Child".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Retrieve it
        let result = profile_manager.get_profile(created_profile.id).await;
        
        assert!(result.is_ok());
        let profile = result.unwrap();
        assert_eq!(profile.name, "Test Child");
        assert_eq!(profile.id, created_profile.id);
    }

    #[tokio::test]
    async fn test_get_all_profiles() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create multiple profiles
        profile_manager.create_profile("Child 1".to_string(), "avatar1".to_string()).await.unwrap();
        profile_manager.create_profile("Child 2".to_string(), "avatar2".to_string()).await.unwrap();
        
        let result = profile_manager.get_all_profiles().await;
        
        assert!(result.is_ok());
        let profiles = result.unwrap();
        assert_eq!(profiles.len(), 2);
        assert!(profiles.iter().any(|p| p.name == "Child 1"));
        assert!(profiles.iter().any(|p| p.name == "Child 2"));
    }

    #[tokio::test]
    async fn test_update_profile() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create a profile
        let mut profile = profile_manager.create_profile(
            "Original Name".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Update it
        profile.name = "Updated Name".to_string();
        profile.avatar = "avatar2".to_string();
        
        let result = profile_manager.update_profile(&profile).await;
        assert!(result.is_ok());
        
        // Verify update
        let updated_profile = profile_manager.get_profile(profile.id).await.unwrap();
        assert_eq!(updated_profile.name, "Updated Name");
        assert_eq!(updated_profile.avatar, "avatar2");
    }

    #[tokio::test]
    async fn test_delete_profile() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create a profile
        let profile = profile_manager.create_profile(
            "To Delete".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Delete it
        let result = profile_manager.delete_profile(profile.id).await;
        assert!(result.is_ok());
        
        // Verify deletion
        let get_result = profile_manager.get_profile(profile.id).await;
        assert!(get_result.is_err());
    }

    #[tokio::test]
    async fn test_update_progress() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create a profile
        let profile = profile_manager.create_profile(
            "Test Child".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Update progress
        let result = profile_manager.update_progress(
            profile.id,
            "Mathematics".to_string(),
            "KS1".to_string(),
            5,
            4,
            120
        ).await;
        
        assert!(result.is_ok());
        
        // Verify progress was saved
        let progress = profile_manager.get_progress(profile.id).await.unwrap();
        assert!(progress.subject_progress.contains_key("Mathematics"));
        
        let math_progress = &progress.subject_progress["Mathematics"];
        assert_eq!(math_progress.questions_answered, 5);
        assert_eq!(math_progress.correct_answers, 4);
        assert_eq!(math_progress.time_spent, 120);
    }

    #[tokio::test]
    async fn test_get_progress_empty() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create a profile
        let profile = profile_manager.create_profile(
            "New Child".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Get progress (should be empty)
        let result = profile_manager.get_progress(profile.id).await;
        
        assert!(result.is_ok());
        let progress = result.unwrap();
        assert_eq!(progress.total_questions_answered, 0);
        assert_eq!(progress.total_correct_answers, 0);
        assert!(progress.subject_progress.is_empty());
    }

    #[tokio::test]
    async fn test_profile_name_validation() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Test empty name
        let result = profile_manager.create_profile("".to_string(), "avatar1".to_string()).await;
        assert!(result.is_err());
        
        // Test name too long
        let long_name = "A".repeat(101);
        let result = profile_manager.create_profile(long_name, "avatar1".to_string()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_profile_not_found() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        let result = profile_manager.get_profile(999).await;
        
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Profile not found"));
    }

    #[tokio::test]
    async fn test_calculate_achievements() {
        let db = create_test_db();
        let profile_manager = ProfileManager::new(db);
        
        // Create profile and add significant progress
        let profile = profile_manager.create_profile(
            "Achiever".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // Add progress that should trigger achievements
        profile_manager.update_progress(profile.id, "Mathematics".to_string(), "KS1".to_string(), 100, 90, 1800).await.unwrap();
        
        let achievements = profile_manager.calculate_achievements(profile.id).await.unwrap();
        
        assert!(!achievements.is_empty());
        assert!(achievements.iter().any(|a| a.name.contains("Math")));
    }
}