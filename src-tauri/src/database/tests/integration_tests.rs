#[cfg(test)]
mod tests {
    use super::super::connection::DatabaseConnection;
    use super::super::migrations::run_migrations;
    use crate::models::*;
    use crate::services::*;
    use tempfile::tempdir;
    use tokio_test;
    use std::sync::Arc;

    async fn create_test_database() -> DatabaseConnection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("integration_test.db");
        let mut db = DatabaseConnection::new(db_path.to_str().unwrap()).unwrap();
        
        // Run migrations to set up schema
        run_migrations(&mut db).await.unwrap();
        
        db
    }

    #[tokio::test]
    async fn test_full_quiz_workflow() {
        let db = create_test_database().await;
        
        // Initialize services
        let mut content_manager = ContentManager::new(db.clone()).unwrap();
        let mut profile_manager = ProfileManager::new(db.clone()).unwrap();
        let mut quiz_engine = QuizEngine::new(db.clone()).unwrap();
        
        // 1. Set up content
        let subject = Subject {
            id: 1,
            name: "Mathematics".to_string(),
            display_name: "Mathematics".to_string(),
            icon_path: Some("/icons/math.svg".to_string()),
            color_scheme: Some("blue".to_string()),
            description: Some("Math problems".to_string()),
        };
        content_manager.add_subject(subject).await.unwrap();
        
        let question = Question {
            id: 1,
            subject_id: 1,
            key_stage: "KS1".to_string(),
            question_type: QuestionType::MultipleChoice,
            content: QuestionContent {
                text: "What is 2 + 2?".to_string(),
                options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string()]),
                story: None,
                image_url: None,
                hotspots: None,
                blanks: None,
            },
            correct_answer: "4".to_string(),
            difficulty_level: 1,
            tags: vec!["addition".to_string()],
        };
        content_manager.add_question(question).await.unwrap();
        
        // 2. Create profile
        let profile = profile_manager.create_profile(
            "Test Student".to_string(),
            "avatar1".to_string()
        ).await.unwrap();
        
        // 3. Start quiz session
        let questions = quiz_engine.get_questions_by_subject("Mathematics", "KS1", 1).await.unwrap();
        assert_eq!(questions.len(), 1);
        
        // 4. Answer question
        let answer_result = quiz_engine.validate_answer(1, "4".to_string()).await.unwrap();
        assert!(answer_result.correct);
        assert_eq!(answer_result.score, 1);
        
        // 5. Update progress
        profile_manager.update_progress(
            profile.id,
            "Mathematics".to_string(),
            "KS1".to_string(),
            1,
            1,
            30
        ).await.unwrap();
        
        // 6. Verify progress was saved
        let progress = profile_manager.get_progress(profile.id).await.unwrap();
        assert_eq!(progress.total_questions_answered, 1);
        assert_eq!(progress.total_correct_answers, 1);
        assert!(progress.subject_progress.contains_key("Mathematics"));
    }

    #[tokio::test]
    async fn test_concurrent_database_operations() {
        let db = create_test_database().await;
        let db_arc = Arc::new(db);
        
        // Create multiple services sharing the same database
        let content_manager1 = ContentManager::new(db_arc.clone()).unwrap();
        let content_manager2 = ContentManager::new(db_arc.clone()).unwrap();
        let profile_manager = ProfileManager::new(db_arc.clone()).unwrap();
        
        // Run concurrent operations
        let handles = vec![
            tokio::spawn(async move {
                let subject = Subject {
                    id: 1,
                    name: "Math1".to_string(),
                    display_name: "Mathematics 1".to_string(),
                    icon_path: None,
                    color_scheme: None,
                    description: None,
                };
                content_manager1.add_subject(subject).await
            }),
            tokio::spawn(async move {
                let subject = Subject {
                    id: 2,
                    name: "Math2".to_string(),
                    display_name: "Mathematics 2".to_string(),
                    icon_path: None,
                    color_scheme: None,
                    description: None,
                };
                content_manager2.add_subject(subject).await
            }),
            tokio::spawn(async move {
                profile_manager.create_profile(
                    "Concurrent User".to_string(),
                    "avatar1".to_string()
                ).await
            }),
        ];
        
        // Wait for all operations to complete
        let results = futures::future::join_all(handles).await;
        
        // All operations should succeed
        for result in results {
            assert!(result.is_ok());
            assert!(result.unwrap().is_ok());
        }
    }

    #[tokio::test]
    async fn test_database_transaction_rollback() {
        let db = create_test_database().await;
        let mut profile_manager = ProfileManager::new(db).unwrap();
        
        // Start a transaction that will fail
        let result = profile_manager.create_profile_with_invalid_data().await;
        
        // Transaction should fail and rollback
        assert!(result.is_err());
        
        // Verify no partial data was saved
        let profiles = profile_manager.get_all_profiles().await.unwrap();
        assert!(profiles.is_empty());
    }

    #[tokio::test]
    async fn test_database_performance_bulk_operations() {
        let db = create_test_database().await;
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Add subject first
        let subject = Subject {
            id: 1,
            name: "Mathematics".to_string(),
            display_name: "Mathematics".to_string(),
            icon_path: None,
            color_scheme: None,
            description: None,
        };
        content_manager.add_subject(subject).await.unwrap();
        
        // Measure time for bulk question insertion
        let start_time = std::time::Instant::now();
        
        let mut questions = Vec::new();
        for i in 1..=1000 {
            let question = Question {
                id: i,
                subject_id: 1,
                key_stage: "KS1".to_string(),
                question_type: QuestionType::MultipleChoice,
                content: QuestionContent {
                    text: format!("Question {}", i),
                    options: Some(vec!["A".to_string(), "B".to_string(), "C".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                },
                correct_answer: "A".to_string(),
                difficulty_level: 1,
                tags: vec!["test".to_string()],
            };
            questions.push(question);
        }
        
        let result = content_manager.bulk_import_questions(questions).await;
        let duration = start_time.elapsed();
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 1000);
        
        // Should complete bulk insert in reasonable time (< 5 seconds)
        assert!(duration.as_secs() < 5);
        
        // Verify all questions were inserted
        let all_questions = content_manager.get_questions_by_subject("Mathematics", None, None, None).await.unwrap();
        assert_eq!(all_questions.len(), 1000);
    }

    #[tokio::test]
    async fn test_database_migration_compatibility() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("migration_test.db");
        
        // Create database with initial schema
        {
            let mut db = DatabaseConnection::new(db_path.to_str().unwrap()).unwrap();
            run_migrations(&mut db).await.unwrap();
            
            // Add some test data
            let mut profile_manager = ProfileManager::new(db).unwrap();
            profile_manager.create_profile("Test User".to_string(), "avatar1".to_string()).await.unwrap();
        }
        
        // Reopen database and verify data integrity
        {
            let mut db = DatabaseConnection::new(db_path.to_str().unwrap()).unwrap();
            run_migrations(&mut db).await.unwrap(); // Should handle existing schema
            
            let profile_manager = ProfileManager::new(db).unwrap();
            let profiles = profile_manager.get_all_profiles().await.unwrap();
            assert_eq!(profiles.len(), 1);
            assert_eq!(profiles[0].name, "Test User");
        }
    }

    #[tokio::test]
    async fn test_database_backup_and_restore() {
        let db = create_test_database().await;
        
        // Add test data
        let mut profile_manager = ProfileManager::new(db.clone()).unwrap();
        let mut content_manager = ContentManager::new(db.clone()).unwrap();
        
        let profile = profile_manager.create_profile("Backup User".to_string(), "avatar1".to_string()).await.unwrap();
        
        let subject = Subject {
            id: 1,
            name: "TestSubject".to_string(),
            display_name: "Test Subject".to_string(),
            icon_path: None,
            color_scheme: None,
            description: None,
        };
        content_manager.add_subject(subject).await.unwrap();
        
        // Create backup
        let backup_data = content_manager.create_backup().await.unwrap();
        
        // Clear database
        content_manager.clear_all_content().await.unwrap();
        profile_manager.delete_profile(profile.id).await.unwrap();
        
        // Verify data is gone
        let profiles = profile_manager.get_all_profiles().await.unwrap();
        assert!(profiles.is_empty());
        
        let subjects = content_manager.get_all_subjects().await.unwrap();
        assert!(subjects.is_empty());
        
        // Restore from backup
        content_manager.restore_from_backup(backup_data).await.unwrap();
        
        // Verify data is restored
        let subjects = content_manager.get_all_subjects().await.unwrap();
        assert_eq!(subjects.len(), 1);
        assert_eq!(subjects[0].name, "TestSubject");
    }

    #[tokio::test]
    async fn test_database_connection_pooling() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("pool_test.db");
        
        // Create multiple connections to the same database
        let mut connections = Vec::new();
        for _ in 0..10 {
            let db = DatabaseConnection::new(db_path.to_str().unwrap()).unwrap();
            connections.push(db);
        }
        
        // All connections should work
        for (i, db) in connections.into_iter().enumerate() {
            let profile_manager = ProfileManager::new(db).unwrap();
            let result = profile_manager.create_profile(
                format!("User {}", i),
                "avatar1".to_string()
            ).await;
            assert!(result.is_ok());
        }
    }

    #[tokio::test]
    async fn test_database_error_handling() {
        let db = create_test_database().await;
        let profile_manager = ProfileManager::new(db).unwrap();
        
        // Test constraint violations
        let profile1 = profile_manager.create_profile("Duplicate".to_string(), "avatar1".to_string()).await.unwrap();
        
        // Try to create profile with same name (if unique constraint exists)
        let result = profile_manager.create_profile("Duplicate".to_string(), "avatar2".to_string()).await;
        // This may or may not fail depending on schema constraints
        
        // Test foreign key violations
        let quiz_engine = QuizEngine::new(db).unwrap();
        let result = quiz_engine.validate_answer(999, "answer".to_string()).await;
        assert!(result.is_err());
        
        // Test invalid data types
        let result = profile_manager.get_profile(0).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_database_query_optimization() {
        let db = create_test_database().await;
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Set up large dataset
        let subject = Subject {
            id: 1,
            name: "Mathematics".to_string(),
            display_name: "Mathematics".to_string(),
            icon_path: None,
            color_scheme: None,
            description: None,
        };
        content_manager.add_subject(subject).await.unwrap();
        
        // Add many questions
        let mut questions = Vec::new();
        for i in 1..=10000 {
            let question = Question {
                id: i,
                subject_id: 1,
                key_stage: if i % 2 == 0 { "KS1".to_string() } else { "KS2".to_string() },
                question_type: QuestionType::MultipleChoice,
                content: QuestionContent {
                    text: format!("Question {}", i),
                    options: Some(vec!["A".to_string(), "B".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                },
                correct_answer: "A".to_string(),
                difficulty_level: (i % 5) + 1,
                tags: vec![format!("tag{}", i % 10)],
            };
            questions.push(question);
        }
        
        content_manager.bulk_import_questions(questions).await.unwrap();
        
        // Test query performance
        let start_time = std::time::Instant::now();
        
        // Complex query with filters
        let filtered_questions = content_manager.get_questions_by_subject(
            "Mathematics",
            Some("KS1".to_string()),
            Some((2, 4)),
            Some(100)
        ).await.unwrap();
        
        let query_duration = start_time.elapsed();
        
        // Query should complete quickly even with large dataset
        assert!(query_duration.as_millis() < 100); // < 100ms
        assert!(!filtered_questions.is_empty());
        assert!(filtered_questions.len() <= 100);
        
        // Verify filtering worked correctly
        for question in &filtered_questions {
            assert_eq!(question.key_stage, "KS1");
            assert!(question.difficulty_level >= 2 && question.difficulty_level <= 4);
        }
    }
}