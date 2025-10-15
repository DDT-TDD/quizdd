#[cfg(test)]
mod tests {
    use super::super::content_manager::*;
    use crate::database::connection::DatabaseConnection;
    use crate::models::question::{Question, QuestionType, QuestionContent};
    use crate::models::profile::Subject;
    use tempfile::tempdir;
    use tokio_test;
    use std::collections::HashMap;

    fn create_test_db() -> DatabaseConnection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        DatabaseConnection::new(db_path.to_str().unwrap()).unwrap()
    }

    fn create_test_subject() -> Subject {
        Subject {
            id: 1,
            name: "Mathematics".to_string(),
            display_name: "Mathematics".to_string(),
            icon_path: Some("/icons/math.svg".to_string()),
            color_scheme: Some("blue".to_string()),
            description: Some("Mathematical concepts and problem solving".to_string()),
        }
    }

    fn create_test_question() -> Question {
        Question {
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
            tags: vec!["addition".to_string(), "basic".to_string()],
        }
    }

    #[tokio::test]
    async fn test_content_manager_creation() {
        let db = create_test_db();
        let content_manager = ContentManager::new(db);
        
        assert!(content_manager.is_ok());
    }

    #[tokio::test]
    async fn test_add_subject() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        let subject = create_test_subject();
        let result = content_manager.add_subject(subject).await;
        
        assert!(result.is_ok());
        let subject_id = result.unwrap();
        assert!(subject_id > 0);
    }

    #[tokio::test]
    async fn test_get_all_subjects() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Add test subjects
        let mut subject1 = create_test_subject();
        subject1.name = "Mathematics".to_string();
        content_manager.add_subject(subject1).await.unwrap();
        
        let mut subject2 = create_test_subject();
        subject2.id = 2;
        subject2.name = "English".to_string();
        subject2.display_name = "English Language".to_string();
        content_manager.add_subject(subject2).await.unwrap();
        
        let result = content_manager.get_all_subjects().await;
        
        assert!(result.is_ok());
        let subjects = result.unwrap();
        assert_eq!(subjects.len(), 2);
        assert!(subjects.iter().any(|s| s.name == "Mathematics"));
        assert!(subjects.iter().any(|s| s.name == "English"));
    }

    #[tokio::test]
    async fn test_add_question() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Add subject first
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        // Add question
        let question = create_test_question();
        let result = content_manager.add_question(question).await;
        
        assert!(result.is_ok());
        let question_id = result.unwrap();
        assert!(question_id > 0);
    }

    #[tokio::test]
    async fn test_get_questions_by_subject() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        let question = create_test_question();
        content_manager.add_question(question).await.unwrap();
        
        // Test retrieval
        let result = content_manager.get_questions_by_subject("Mathematics", Some("KS1".to_string()), None, Some(10)).await;
        
        assert!(result.is_ok());
        let questions = result.unwrap();
        assert!(!questions.is_empty());
        assert_eq!(questions[0].content.text, "What is 2 + 2?");
    }

    #[tokio::test]
    async fn test_get_questions_with_difficulty_filter() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        // Add questions with different difficulties
        for i in 1..=5 {
            let mut question = create_test_question();
            question.id = i;
            question.difficulty_level = if i <= 2 { 1 } else { 3 };
            question.content.text = format!("Question {}", i);
            content_manager.add_question(question).await.unwrap();
        }
        
        // Test difficulty filtering
        let result = content_manager.get_questions_by_subject(
            "Mathematics", 
            Some("KS1".to_string()), 
            Some((1, 2)), 
            Some(10)
        ).await;
        
        assert!(result.is_ok());
        let questions = result.unwrap();
        assert!(questions.len() <= 2); // Only questions with difficulty 1-2
        assert!(questions.iter().all(|q| q.difficulty_level <= 2));
    }

    #[tokio::test]
    async fn test_update_question() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        let mut question = create_test_question();
        let question_id = content_manager.add_question(question.clone()).await.unwrap();
        
        // Update question
        question.id = question_id;
        question.content.text = "What is 3 + 3?".to_string();
        question.correct_answer = "6".to_string();
        
        let result = content_manager.update_question(question_id, question).await;
        assert!(result.is_ok());
        
        // Verify update
        let updated_question = content_manager.get_question_by_id(question_id).await.unwrap();
        assert_eq!(updated_question.content.text, "What is 3 + 3?");
        assert_eq!(updated_question.correct_answer, "6");
    }

    #[tokio::test]
    async fn test_delete_question() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        let question = create_test_question();
        let question_id = content_manager.add_question(question).await.unwrap();
        
        // Delete question
        let result = content_manager.delete_question(question_id).await;
        assert!(result.is_ok());
        
        // Verify deletion
        let get_result = content_manager.get_question_by_id(question_id).await;
        assert!(get_result.is_err());
    }

    #[tokio::test]
    async fn test_get_content_statistics() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        // Add multiple questions
        for i in 1..=10 {
            let mut question = create_test_question();
            question.id = i;
            question.content.text = format!("Question {}", i);
            content_manager.add_question(question).await.unwrap();
        }
        
        let result = content_manager.get_content_statistics().await;
        
        assert!(result.is_ok());
        let stats = result.unwrap();
        assert_eq!(stats.total_questions, 10);
        assert_eq!(stats.total_subjects, 1);
        assert!(stats.questions_by_subject.contains_key("Mathematics"));
        assert_eq!(stats.questions_by_subject["Mathematics"], 10);
    }

    #[tokio::test]
    async fn test_verify_content_signature() {
        let db = create_test_db();
        let content_manager = ContentManager::new(db).unwrap();
        
        // Test with valid signature (mock)
        let content_data = b"test content data";
        let signature = b"mock_signature";
        
        let result = content_manager.verify_content_signature(content_data, signature).await;
        
        // This would normally verify against a real signature
        // For testing, we'll assume it returns true for non-empty data
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_load_content_pack() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Create a mock content pack
        let content_pack = ContentPack {
            version: "1.0.0".to_string(),
            name: "Test Pack".to_string(),
            description: Some("Test content pack".to_string()),
            subjects: vec![create_test_subject()],
            questions: vec![create_test_question()],
            signature: Some("test_signature".to_string()),
        };
        
        let result = content_manager.load_content_pack(content_pack).await;
        
        assert!(result.is_ok());
        
        // Verify content was loaded
        let subjects = content_manager.get_all_subjects().await.unwrap();
        assert!(!subjects.is_empty());
        
        let questions = content_manager.get_questions_by_subject("Mathematics", None, None, None).await.unwrap();
        assert!(!questions.is_empty());
    }

    #[tokio::test]
    async fn test_search_questions_by_tags() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        // Add questions with different tags
        let mut question1 = create_test_question();
        question1.id = 1;
        question1.tags = vec!["addition".to_string(), "basic".to_string()];
        content_manager.add_question(question1).await.unwrap();
        
        let mut question2 = create_test_question();
        question2.id = 2;
        question2.tags = vec!["subtraction".to_string(), "basic".to_string()];
        question2.content.text = "What is 5 - 2?".to_string();
        content_manager.add_question(question2).await.unwrap();
        
        // Search by tag
        let result = content_manager.search_questions_by_tags(vec!["addition".to_string()]).await;
        
        assert!(result.is_ok());
        let questions = result.unwrap();
        assert_eq!(questions.len(), 1);
        assert!(questions[0].tags.contains(&"addition".to_string()));
    }

    #[tokio::test]
    async fn test_question_validation() {
        let db = create_test_db();
        let content_manager = ContentManager::new(db).unwrap();
        
        // Test invalid question (empty text)
        let mut invalid_question = create_test_question();
        invalid_question.content.text = "".to_string();
        
        let result = content_manager.validate_question(&invalid_question);
        assert!(result.is_err());
        
        // Test valid question
        let valid_question = create_test_question();
        let result = content_manager.validate_question(&valid_question);
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_bulk_import_questions() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup subject
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        // Create multiple questions for bulk import
        let mut questions = Vec::new();
        for i in 1..=50 {
            let mut question = create_test_question();
            question.id = i;
            question.content.text = format!("Bulk question {}", i);
            questions.push(question);
        }
        
        let result = content_manager.bulk_import_questions(questions).await;
        
        assert!(result.is_ok());
        let imported_count = result.unwrap();
        assert_eq!(imported_count, 50);
        
        // Verify import
        let all_questions = content_manager.get_questions_by_subject("Mathematics", None, None, None).await.unwrap();
        assert_eq!(all_questions.len(), 50);
    }

    #[tokio::test]
    async fn test_content_backup_and_restore() {
        let db = create_test_db();
        let mut content_manager = ContentManager::new(db).unwrap();
        
        // Setup test data
        let subject = create_test_subject();
        content_manager.add_subject(subject).await.unwrap();
        
        let question = create_test_question();
        content_manager.add_question(question).await.unwrap();
        
        // Create backup
        let backup_result = content_manager.create_backup().await;
        assert!(backup_result.is_ok());
        
        // Clear content
        content_manager.clear_all_content().await.unwrap();
        
        // Verify content is cleared
        let subjects = content_manager.get_all_subjects().await.unwrap();
        assert!(subjects.is_empty());
        
        // Restore from backup
        let backup_data = backup_result.unwrap();
        let restore_result = content_manager.restore_from_backup(backup_data).await;
        assert!(restore_result.is_ok());
        
        // Verify restoration
        let subjects = content_manager.get_all_subjects().await.unwrap();
        assert!(!subjects.is_empty());
        assert_eq!(subjects[0].name, "Mathematics");
    }
}