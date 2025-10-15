#[cfg(test)]
mod tests {
    use super::super::quiz_engine::*;
    use crate::database::connection::DatabaseConnection;
    use crate::models::question::{Question, QuestionType, QuestionContent};
    use tempfile::tempdir;
    use tokio_test;

    fn create_test_db() -> DatabaseConnection {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        DatabaseConnection::new(db_path.to_str().unwrap()).unwrap()
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
            tags: vec!["addition".to_string()],
        }
    }

    #[tokio::test]
    async fn test_quiz_engine_creation() {
        let db = create_test_db();
        let quiz_engine = QuizEngine::new(db);
        
        assert!(quiz_engine.is_ok());
    }

    #[tokio::test]
    async fn test_get_questions_by_subject() {
        let db = create_test_db();
        let mut quiz_engine = QuizEngine::new(db).unwrap();
        
        // Insert test question
        let question = create_test_question();
        quiz_engine.insert_test_question(question).await.unwrap();
        
        let questions = quiz_engine.get_questions_by_subject("Mathematics", "KS1", 5).await;
        
        assert!(questions.is_ok());
        let questions = questions.unwrap();
        assert!(!questions.is_empty());
        assert_eq!(questions[0].content.text, "What is 2 + 2?");
    }

    #[tokio::test]
    async fn test_question_randomization() {
        let db = create_test_db();
        let mut quiz_engine = QuizEngine::new(db).unwrap();
        
        // Insert multiple test questions
        for i in 1..=10 {
            let mut question = create_test_question();
            question.id = i;
            question.content.text = format!("Question {}", i);
            quiz_engine.insert_test_question(question).await.unwrap();
        }
        
        let questions1 = quiz_engine.get_questions_by_subject("Mathematics", "KS1", 5).await.unwrap();
        let questions2 = quiz_engine.get_questions_by_subject("Mathematics", "KS1", 5).await.unwrap();
        
        // Questions should be randomized (very unlikely to be in same order)
        let same_order = questions1.iter().zip(questions2.iter())
            .all(|(q1, q2)| q1.id == q2.id);
        
        assert!(!same_order, "Questions should be randomized");
    }

    #[tokio::test]
    async fn test_validate_answer_correct() {
        let db = create_test_db();
        let mut quiz_engine = QuizEngine::new(db).unwrap();
        
        let question = create_test_question();
        quiz_engine.insert_test_question(question).await.unwrap();
        
        let result = quiz_engine.validate_answer(1, "4".to_string()).await;
        
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.correct);
        assert_eq!(result.score, 1);
    }

    #[tokio::test]
    async fn test_validate_answer_incorrect() {
        let db = create_test_db();
        let mut quiz_engine = QuizEngine::new(db).unwrap();
        
        let question = create_test_question();
        quiz_engine.insert_test_question(question).await.unwrap();
        
        let result = quiz_engine.validate_answer(1, "3".to_string()).await;
        
        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(!result.correct);
        assert_eq!(result.score, 0);
    }

    #[tokio::test]
    async fn test_calculate_quiz_score() {
        let db = create_test_db();
        let quiz_engine = QuizEngine::new(db).unwrap();
        
        let answers = vec![
            (1, true),  // correct
            (2, false), // incorrect
            (3, true),  // correct
            (4, true),  // correct
        ];
        
        let score = quiz_engine.calculate_score(&answers);
        
        assert_eq!(score.correct_answers, 3);
        assert_eq!(score.total_questions, 4);
        assert_eq!(score.percentage, 75.0);
    }

    #[tokio::test]
    async fn test_get_questions_with_difficulty_filter() {
        let db = create_test_db();
        let mut quiz_engine = QuizEngine::new(db).unwrap();
        
        // Insert questions with different difficulty levels
        for i in 1..=5 {
            let mut question = create_test_question();
            question.id = i;
            question.difficulty_level = if i <= 2 { 1 } else { 2 };
            quiz_engine.insert_test_question(question).await.unwrap();
        }
        
        let easy_questions = quiz_engine.get_questions_by_difficulty("Mathematics", "KS1", 1, 3).await;
        
        assert!(easy_questions.is_ok());
        let questions = easy_questions.unwrap();
        assert!(questions.len() <= 2); // Only 2 easy questions available
        assert!(questions.iter().all(|q| q.difficulty_level == 1));
    }

    #[tokio::test]
    async fn test_question_not_found() {
        let db = create_test_db();
        let quiz_engine = QuizEngine::new(db).unwrap();
        
        let result = quiz_engine.validate_answer(999, "answer".to_string()).await;
        
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Question not found"));
    }
}