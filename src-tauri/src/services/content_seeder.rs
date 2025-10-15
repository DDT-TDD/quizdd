use crate::errors::AppResult;
use crate::models::{Question, QuestionContent, Answer, KeyStage, QuestionType, AssetType, BlankConfig};
use crate::database::DatabaseManager;
use std::sync::Arc;
use std::collections::HashMap;
use serde_json;

/// Content seeder for populating the database with initial educational content
pub struct ContentSeeder {
    db_manager: Arc<DatabaseManager>,
}

impl ContentSeeder {
    /// Create a new content seeder
    pub fn new(db_manager: Arc<DatabaseManager>) -> Self {
        Self { db_manager }
    }

    /// Seed all educational content
    pub fn seed_all_content(&self) -> AppResult<()> {
        println!("Starting comprehensive content seeding...");

        // Get subject IDs
        let subjects = self.get_subjects()?;
        let mut subject_map = HashMap::new();
        for subject in subjects {
            subject_map.insert(subject.name.clone(), subject.id.unwrap());
        }

        // Seed content for each subject
        self.seed_mathematics_content(subject_map["mathematics"])?;
        self.seed_geography_content(subject_map["geography"])?;
        self.seed_english_content(subject_map["english"])?;
        self.seed_science_content(subject_map["science"])?;
        self.seed_general_knowledge_content(subject_map["general_knowledge"])?;
        self.seed_times_tables_content(subject_map["times_tables"])?;
        self.seed_flags_capitals_content(subject_map["flags_capitals"])?;

        // Seed additional interactive content
        self.seed_interactive_mathematics_content(subject_map["mathematics"])?;
        self.seed_interactive_geography_content(subject_map["geography"])?;
        self.seed_interactive_english_content(subject_map["english"])?;
        self.seed_interactive_science_content(subject_map["science"])?;

        println!("Content seeding completed successfully!");
        Ok(())
    }

    /// Seed Mathematics content (KS1 & KS2 timetables, arithmetic, shapes) - EXPANDED
    fn seed_mathematics_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding Mathematics content...");

        let questions = vec![
            // KS1 Basic Addition - Expanded Set
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1 + 0?".to_string(),
                    options: Some(vec!["0".to_string(), "1".to_string(), "2".to_string(), "3".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 2 + 3?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 5 + 4?".to_string(),
                    options: Some(vec!["8".to_string(), "9".to_string(), "10".to_string(), "11".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            // KS1 Basic Subtraction
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 - 3?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            // KS1 Shape Recognition
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a triangle have?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/triangle.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a square have?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/square.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // More KS1 Addition Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3 + 2?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 4 + 1?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 6 + 2?".to_string(),
                    options: Some(vec!["7".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 + 3?".to_string(),
                    options: Some(vec!["9".to_string(), "10".to_string(), "11".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            // More KS1 Subtraction Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 5 - 2?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 - 4?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 10 - 3?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            // KS1 Counting Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the stars: ⭐⭐⭐⭐".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the hearts: ❤️❤️❤️❤️❤️❤️".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the circles: ⭕⭕⭕⭕⭕⭕⭕".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            // More KS1 Shape Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a circle have?".to_string(),
                    options: Some(vec!["0".to_string(), "1".to_string(), "2".to_string(), "3".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a rectangle have?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many corners does a triangle have?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // KS1 Counting
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the objects: 🍎🍎🍎🍎🍎".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the stars: ⭐⭐⭐⭐⭐⭐⭐".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            // KS2 Multiplication Tables
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 × 8?".to_string(),
                    options: Some(vec!["54".to_string(), "56".to_string(), "58".to_string(), "64".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("56".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 × 6?".to_string(),
                    options: Some(vec!["52".to_string(), "54".to_string(), "56".to_string(), "58".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("54".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            // More KS1 Addition Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1 + 1?".to_string(),
                    options: Some(vec!["1".to_string(), "2".to_string(), "3".to_string(), "4".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("2".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3 + 2?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 4 + 3?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 6 + 2?".to_string(),
                    options: Some(vec!["7".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 + 3?".to_string(),
                    options: Some(vec!["9".to_string(), "10".to_string(), "11".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            // More KS1 Subtraction Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 5 - 2?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 - 4?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 10 - 6?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            // More KS2 Times Tables
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3 × 4?".to_string(),
                    options: Some(vec!["10".to_string(), "11".to_string(), "12".to_string(), "13".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("12".to_string()),
            ).with_difficulty(2).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 5 × 6?".to_string(),
                    options: Some(vec!["25".to_string(), "30".to_string(), "35".to_string(), "40".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("30".to_string()),
            ).with_difficulty(2).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 × 7?".to_string(),
                    options: Some(vec!["54".to_string(), "56".to_string(), "58".to_string(), "64".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("56".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 12 × 3?".to_string(),
                    options: Some(vec!["33".to_string(), "36".to_string(), "39".to_string(), "42".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("36".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            // KS2 Division
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 24 ÷ 6?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 35 ÷ 7?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            // Fractions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1/2 + 1/4?".to_string(),
                    options: Some(vec!["1/4".to_string(), "1/2".to_string(), "3/4".to_string(), "1".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3/4".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is half of 16?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(2).with_tags(vec!["fractions".to_string(), "halves".to_string()]),

            // More Shape Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a circle have?".to_string(),
                    options: Some(vec!["0".to_string(), "1".to_string(), "2".to_string(), "3".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/circle.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a rectangle have?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/rectangle.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a pentagon have?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/pentagon.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(3).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a hexagon have?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/hexagon.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(3).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // Number Patterns
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes next in the pattern: 2, 4, 6, 8, ?".to_string(),
                    options: Some(vec!["9".to_string(), "10".to_string(), "11".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10".to_string()),
            ).with_difficulty(2).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes next in the pattern: 5, 10, 15, 20, ?".to_string(),
                    options: Some(vec!["22".to_string(), "24".to_string(), "25".to_string(), "30".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("25".to_string()),
            ).with_difficulty(2).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            // Money Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 2 pennies worth?".to_string(),
                    options: Some(vec!["1p".to_string(), "2p".to_string(), "3p".to_string(), "5p".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("2p".to_string()),
            ).with_difficulty(1).with_tags(vec!["money".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 50p + 20p + 10p?".to_string(),
                    options: Some(vec!["70p".to_string(), "80p".to_string(), "90p".to_string(), "£1".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("80p".to_string()),
            ).with_difficulty(3).with_tags(vec!["money".to_string(), "addition".to_string()]),

            // Time Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many minutes are in an hour?".to_string(),
                    options: Some(vec!["50".to_string(), "60".to_string(), "70".to_string(), "100".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("60".to_string()),
            ).with_difficulty(2).with_tags(vec!["time".to_string(), "measurement".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What time is 30 minutes after 2:15?".to_string(),
                    options: Some(vec!["2:30".to_string(), "2:45".to_string(), "3:15".to_string(), "3:45".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("2:45".to_string()),
            ).with_difficulty(3).with_tags(vec!["time".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 12 × 4?".to_string(),
                    options: Some(vec!["44".to_string(), "46".to_string(), "48".to_string(), "50".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("48".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            // KS2 Fractions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1/2 + 1/4?".to_string(),
                    options: Some(vec!["1/6".to_string(), "2/6".to_string(), "3/4".to_string(), "2/4".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3/4".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3/4 - 1/4?".to_string(),
                    options: Some(vec!["1/4".to_string(), "2/4".to_string(), "1/2".to_string(), "2/8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1/2".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "subtraction".to_string()]),

            // EXPANDED KS1 CONTENT - DOUBLING THE QUESTIONS
            
            // More KS1 Addition (0-20 range)
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 0 + 5?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "0".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 + 1?".to_string(),
                    options: Some(vec!["7".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 + 2?".to_string(),
                    options: Some(vec!["10".to_string(), "11".to_string(), "12".to_string(), "13".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("11".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 6 + 5?".to_string(),
                    options: Some(vec!["10".to_string(), "11".to_string(), "12".to_string(), "13".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("11".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 + 4?".to_string(),
                    options: Some(vec!["11".to_string(), "12".to_string(), "13".to_string(), "14".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("12".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 + 6?".to_string(),
                    options: Some(vec!["12".to_string(), "13".to_string(), "14".to_string(), "15".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("13".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 + 7?".to_string(),
                    options: Some(vec!["15".to_string(), "16".to_string(), "17".to_string(), "18".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("16".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 + 9?".to_string(),
                    options: Some(vec!["16".to_string(), "17".to_string(), "18".to_string(), "19".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("17".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "basic_arithmetic".to_string()]),

            // More KS1 Subtraction (within 20)
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 6 - 1?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 - 2?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 12 - 5?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 15 - 8?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 20 - 3?".to_string(),
                    options: Some(vec!["16".to_string(), "17".to_string(), "18".to_string(), "19".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("17".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 14 - 6?".to_string(),
                    options: Some(vec!["7".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(2).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            // More KS1 Counting and Number Recognition
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the dots: • • • • • • • •".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the hearts: ❤️❤️❤️❤️❤️❤️❤️❤️❤️".to_string(),
                    options: Some(vec!["8".to_string(), "9".to_string(), "10".to_string(), "11".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count the flowers: 🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸".to_string(),
                    options: Some(vec!["10".to_string(), "11".to_string(), "12".to_string(), "13".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("12".to_string()),
            ).with_difficulty(2).with_tags(vec!["counting".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What number comes after 7?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["number_sequence".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What number comes before 15?".to_string(),
                    options: Some(vec!["13".to_string(), "14".to_string(), "15".to_string(), "16".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("14".to_string()),
            ).with_difficulty(2).with_tags(vec!["number_sequence".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number is bigger: 8 or 5?".to_string(),
                    options: Some(vec!["5".to_string(), "8".to_string(), "They are equal".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["comparison".to_string(), "numbers".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number is smaller: 12 or 9?".to_string(),
                    options: Some(vec!["12".to_string(), "9".to_string(), "They are equal".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(2).with_tags(vec!["comparison".to_string(), "numbers".to_string()]),

            // More KS1 Shape Recognition and Properties
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many corners does a triangle have?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/triangle.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many corners does a square have?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: Some("assets/images/mathematics/square.svg".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What shape has no corners?".to_string(),
                    options: Some(vec!["Triangle".to_string(), "Square".to_string(), "Circle".to_string(), "Rectangle".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Circle".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which shape has 4 equal sides?".to_string(),
                    options: Some(vec!["Triangle".to_string(), "Circle".to_string(), "Square".to_string(), "Oval".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Square".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // More KS1 Simple Patterns
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes next: 🔴🔵🔴🔵🔴?".to_string(),
                    options: Some(vec!["🔴".to_string(), "🔵".to_string(), "🟡".to_string(), "🟢".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("🔵".to_string()),
            ).with_difficulty(2).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes next: ⭐🌙⭐🌙⭐?".to_string(),
                    options: Some(vec!["⭐".to_string(), "🌙".to_string(), "☀️".to_string(), "🌟".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("🌙".to_string()),
            ).with_difficulty(2).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes next: 1, 2, 1, 2, 1, ?".to_string(),
                    options: Some(vec!["1".to_string(), "2".to_string(), "3".to_string(), "4".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("2".to_string()),
            ).with_difficulty(2).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            // More KS1 Simple Money
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 1 penny worth?".to_string(),
                    options: Some(vec!["1p".to_string(), "2p".to_string(), "5p".to_string(), "10p".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1p".to_string()),
            ).with_difficulty(1).with_tags(vec!["money".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 5 pennies worth?".to_string(),
                    options: Some(vec!["3p".to_string(), "4p".to_string(), "5p".to_string(), "6p".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5p".to_string()),
            ).with_difficulty(1).with_tags(vec!["money".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 1p + 1p + 1p?".to_string(),
                    options: Some(vec!["2p".to_string(), "3p".to_string(), "4p".to_string(), "5p".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3p".to_string()),
            ).with_difficulty(2).with_tags(vec!["money".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How much is 2p + 3p?".to_string(),
                    options: Some(vec!["4p".to_string(), "5p".to_string(), "6p".to_string(), "7p".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5p".to_string()),
            ).with_difficulty(2).with_tags(vec!["money".to_string(), "addition".to_string()]),

            // More KS1 Simple Time
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many days are in a week?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["time".to_string(), "calendar".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes after Monday?".to_string(),
                    options: Some(vec!["Sunday".to_string(), "Tuesday".to_string(), "Wednesday".to_string(), "Friday".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Tuesday".to_string()),
            ).with_difficulty(2).with_tags(vec!["time".to_string(), "calendar".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What time do we eat breakfast?".to_string(),
                    options: Some(vec!["Morning".to_string(), "Afternoon".to_string(), "Evening".to_string(), "Night".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Morning".to_string()),
            ).with_difficulty(1).with_tags(vec!["time".to_string(), "daily_routine".to_string()]),

            // More KS1 Simple Measurement
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which is longer: a pencil or a ruler?".to_string(),
                    options: Some(vec!["Pencil".to_string(), "Ruler".to_string(), "Same length".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ruler".to_string()),
            ).with_difficulty(1).with_tags(vec!["measurement".to_string(), "comparison".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which is heavier: a feather or a book?".to_string(),
                    options: Some(vec!["Feather".to_string(), "Book".to_string(), "Same weight".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Book".to_string()),
            ).with_difficulty(1).with_tags(vec!["measurement".to_string(), "weight".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which holds more water: a cup or a bucket?".to_string(),
                    options: Some(vec!["Cup".to_string(), "Bucket".to_string(), "Same amount".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Bucket".to_string()),
            ).with_difficulty(1).with_tags(vec!["measurement".to_string(), "capacity".to_string()]),

            // More KS1 Doubling and Halving
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is double 3?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(2).with_tags(vec!["doubling".to_string(), "multiplication".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is double 5?".to_string(),
                    options: Some(vec!["8".to_string(), "9".to_string(), "10".to_string(), "11".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10".to_string()),
            ).with_difficulty(2).with_tags(vec!["doubling".to_string(), "multiplication".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is half of 8?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(2).with_tags(vec!["halving".to_string(), "division".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is half of 10?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(2).with_tags(vec!["halving".to_string(), "division".to_string()]),

            // More KS1 Position and Direction
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "If you turn left from facing forward, which way are you facing?".to_string(),
                    options: Some(vec!["Forward".to_string(), "Backward".to_string(), "Left".to_string(), "Right".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Left".to_string()),
            ).with_difficulty(2).with_tags(vec!["position".to_string(), "direction".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the opposite of 'up'?".to_string(),
                    options: Some(vec!["Left".to_string(), "Right".to_string(), "Down".to_string(), "Forward".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Down".to_string()),
            ).with_difficulty(1).with_tags(vec!["position".to_string(), "opposites".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the opposite of 'in front of'?".to_string(),
                    options: Some(vec!["Above".to_string(), "Below".to_string(), "Behind".to_string(), "Beside".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Behind".to_string()),
            ).with_difficulty(2).with_tags(vec!["position".to_string(), "opposites".to_string()]),

            // KS2 Division
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 72 ÷ 8?".to_string(),
                    options: Some(vec!["8".to_string(), "9".to_string(), "10".to_string(), "11".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            // KS2 Measurements
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many centimeters are in 1 meter?".to_string(),
                    options: Some(vec!["10".to_string(), "50".to_string(), "100".to_string(), "1000".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("100".to_string()),
            ).with_difficulty(2).with_tags(vec!["measurements".to_string(), "units".to_string()]),

            // Additional KS1 Mathematics Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 10 - 7?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("3".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a circle have?".to_string(),
                    options: Some(vec!["0".to_string(), "1".to_string(), "2".to_string(), "3".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What comes after 19?".to_string(),
                    options: Some(vec!["18".to_string(), "20".to_string(), "21".to_string(), "22".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("20".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "number_sequence".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number is bigger: 15 or 12?".to_string(),
                    options: Some(vec!["15".to_string(), "12".to_string(), "They are the same".to_string(), "Cannot tell".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("15".to_string()),
            ).with_difficulty(1).with_tags(vec!["comparison".to_string(), "numbers".to_string()]),

            // Additional KS2 Mathematics Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 144 ÷ 12?".to_string(),
                    options: Some(vec!["11".to_string(), "12".to_string(), "13".to_string(), "14".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("12".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 25% of 100?".to_string(),
                    options: Some(vec!["20".to_string(), "25".to_string(), "30".to_string(), "35".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("25".to_string()),
            ).with_difficulty(4).with_tags(vec!["percentages".to_string(), "fractions".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many minutes are in 2 hours?".to_string(),
                    options: Some(vec!["100".to_string(), "110".to_string(), "120".to_string(), "130".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("120".to_string()),
            ).with_difficulty(2).with_tags(vec!["time".to_string(), "measurements".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the area of a rectangle with length 6 and width 4?".to_string(),
                    options: Some(vec!["20".to_string(), "24".to_string(), "28".to_string(), "32".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("24".to_string()),
            ).with_difficulty(4).with_tags(vec!["area".to_string(), "geometry".to_string()]),

            // Additional KS1 Number Recognition
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number comes after 7?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(1).with_tags(vec!["number_sequence".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number comes before 5?".to_string(),
                    options: Some(vec!["3".to_string(), "4".to_string(), "5".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(1).with_tags(vec!["number_sequence".to_string(), "counting".to_string()]),

            // KS1 Money Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many pence are in 1 pound?".to_string(),
                    options: Some(vec!["50".to_string(), "100".to_string(), "150".to_string(), "200".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("100".to_string()),
            ).with_difficulty(3).with_tags(vec!["money".to_string(), "practical_maths".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What coin is worth 10 pence?".to_string(),
                    options: Some(vec!["1p coin".to_string(), "5p coin".to_string(), "10p coin".to_string(), "20p coin".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10p coin".to_string()),
            ).with_difficulty(2).with_tags(vec!["money".to_string(), "practical_maths".to_string()]),

            // More KS2 Multiplication
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 6 × 7?".to_string(),
                    options: Some(vec!["40".to_string(), "41".to_string(), "42".to_string(), "43".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("42".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 × 4?".to_string(),
                    options: Some(vec!["32".to_string(), "34".to_string(), "36".to_string(), "38".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("36".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 8 × 6?".to_string(),
                    options: Some(vec!["46".to_string(), "48".to_string(), "50".to_string(), "52".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("48".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            // KS2 Division Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 36 ÷ 6?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 45 ÷ 9?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            // KS2 Fractions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1/4 + 1/4?".to_string(),
                    options: Some(vec!["1/8".to_string(), "2/8".to_string(), "1/2".to_string(), "2/4".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1/2".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3/4 of 12?".to_string(),
                    options: Some(vec!["6".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("9".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "multiplication".to_string()]),

            // === NEW DIVERSE MATHEMATICS QUESTIONS ===
            
            // KS1 - More Number Recognition
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which number comes after 19?".to_string(),
                    options: Some(vec!["18".to_string(), "20".to_string(), "21".to_string(), "29".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("20".to_string()),
            ).with_difficulty(1).with_tags(vec!["counting".to_string(), "number_sequence".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 + 7?".to_string(),
                    options: Some(vec!["12".to_string(), "13".to_string(), "14".to_string(), "15".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("14".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "doubles".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "If you have 3 apples and get 4 more, how many do you have?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["addition".to_string(), "word_problems".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 10 - 3?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["subtraction".to_string(), "basic_arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a hexagon have?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "7".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // KS1 - Time and Measurement
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many minutes are in one hour?".to_string(),
                    options: Some(vec!["30".to_string(), "50".to_string(), "60".to_string(), "100".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("60".to_string()),
            ).with_difficulty(2).with_tags(vec!["time".to_string(), "measurement".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which is longer: a meter or a centimeter?".to_string(),
                    options: Some(vec!["Centimeter".to_string(), "Meter".to_string(), "They are the same".to_string(), "Neither".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Meter".to_string()),
            ).with_difficulty(2).with_tags(vec!["measurement".to_string(), "length".to_string()]),

            // KS2 - More Multiplication
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 7 × 8?".to_string(),
                    options: Some(vec!["48".to_string(), "54".to_string(), "56".to_string(), "63".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("56".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 9 × 6?".to_string(),
                    options: Some(vec!["45".to_string(), "54".to_string(), "63".to_string(), "72".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("54".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 12 × 5?".to_string(),
                    options: Some(vec!["50".to_string(), "55".to_string(), "60".to_string(), "65".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("60".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),

            // KS2 - Division
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 48 ÷ 6?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 72 ÷ 9?".to_string(),
                    options: Some(vec!["6".to_string(), "7".to_string(), "8".to_string(), "9".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 100 ÷ 4?".to_string(),
                    options: Some(vec!["20".to_string(), "24".to_string(), "25".to_string(), "30".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("25".to_string()),
            ).with_difficulty(3).with_tags(vec!["division".to_string(), "arithmetic".to_string()]),

            // KS2 - Decimals
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 0.5 + 0.3?".to_string(),
                    options: Some(vec!["0.2".to_string(), "0.8".to_string(), "0.53".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0.8".to_string()),
            ).with_difficulty(4).with_tags(vec!["decimals".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1.0 - 0.4?".to_string(),
                    options: Some(vec!["0.4".to_string(), "0.6".to_string(), "0.96".to_string(), "6".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0.6".to_string()),
            ).with_difficulty(4).with_tags(vec!["decimals".to_string(), "subtraction".to_string()]),

            // KS2 - Percentages
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 50% of 100?".to_string(),
                    options: Some(vec!["25".to_string(), "50".to_string(), "75".to_string(), "100".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("50".to_string()),
            ).with_difficulty(3).with_tags(vec!["percentages".to_string(), "fractions".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 25% of 80?".to_string(),
                    options: Some(vec!["15".to_string(), "20".to_string(), "25".to_string(), "30".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("20".to_string()),
            ).with_difficulty(4).with_tags(vec!["percentages".to_string(), "calculation".to_string()]),

            // KS2 - Word Problems
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "A book costs £8 and a pen costs £2. How much do they cost together?".to_string(),
                    options: Some(vec!["£6".to_string(), "£10".to_string(), "£12".to_string(), "£16".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("£10".to_string()),
            ).with_difficulty(2).with_tags(vec!["word_problems".to_string(), "money".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "If a train travels 60 miles in 1 hour, how far does it travel in 3 hours?".to_string(),
                    options: Some(vec!["120 miles".to_string(), "150 miles".to_string(), "180 miles".to_string(), "200 miles".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("180 miles".to_string()),
            ).with_difficulty(4).with_tags(vec!["word_problems".to_string(), "multiplication".to_string(), "distance".to_string()]),

            // KS2 - Geometry
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many degrees are in a right angle?".to_string(),
                    options: Some(vec!["45".to_string(), "60".to_string(), "90".to_string(), "180".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("90".to_string()),
            ).with_difficulty(3).with_tags(vec!["geometry".to_string(), "angles".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the perimeter of a square with sides of 5cm?".to_string(),
                    options: Some(vec!["10cm".to_string(), "15cm".to_string(), "20cm".to_string(), "25cm".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("20cm".to_string()),
            ).with_difficulty(4).with_tags(vec!["geometry".to_string(), "perimeter".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many faces does a cube have?".to_string(),
                    options: Some(vec!["4".to_string(), "6".to_string(), "8".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(3).with_tags(vec!["geometry".to_string(), "3d_shapes".to_string()]),

            // KS1 - More Counting
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Count by 2s: 2, 4, 6, 8, ___?".to_string(),
                    options: Some(vec!["9".to_string(), "10".to_string(), "11".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("10".to_string()),
            ).with_difficulty(2).with_tags(vec!["counting".to_string(), "patterns".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 5 + 5 + 5?".to_string(),
                    options: Some(vec!["10".to_string(), "15".to_string(), "20".to_string(), "25".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("15".to_string()),
            ).with_difficulty(2).with_tags(vec!["addition".to_string(), "repeated_addition".to_string()]),

            // KS2 - More Fractions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 2/3 + 1/3?".to_string(),
                    options: Some(vec!["1/3".to_string(), "3/6".to_string(), "3/3".to_string(), "1".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "addition".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which fraction is equivalent to 1/2?".to_string(),
                    options: Some(vec!["2/3".to_string(), "2/4".to_string(), "3/5".to_string(), "1/3".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("2/4".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "equivalence".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1/2 of 50?".to_string(),
                    options: Some(vec!["20".to_string(), "25".to_string(), "30".to_string(), "35".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("25".to_string()),
            ).with_difficulty(3).with_tags(vec!["fractions".to_string(), "division".to_string()]),

            // KS1 - More Shapes
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which shape has 3 sides?".to_string(),
                    options: Some(vec!["Square".to_string(), "Triangle".to_string(), "Circle".to_string(), "Rectangle".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Triangle".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which shape has no corners?".to_string(),
                    options: Some(vec!["Square".to_string(), "Triangle".to_string(), "Circle".to_string(), "Rectangle".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Circle".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string()]),

            // KS2 - More Advanced Problems
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "If 5 pencils cost £10, how much does 1 pencil cost?".to_string(),
                    options: Some(vec!["£1".to_string(), "£2".to_string(), "£3".to_string(), "£5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("£2".to_string()),
            ).with_difficulty(3).with_tags(vec!["word_problems".to_string(), "division".to_string(), "money".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the next number in the sequence: 3, 6, 9, 12, ___?".to_string(),
                    options: Some(vec!["13".to_string(), "14".to_string(), "15".to_string(), "16".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("15".to_string()),
            ).with_difficulty(3).with_tags(vec!["patterns".to_string(), "sequences".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 11 × 11?".to_string(),
                    options: Some(vec!["111".to_string(), "121".to_string(), "112".to_string(), "122".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("121".to_string()),
            ).with_difficulty(4).with_tags(vec!["multiplication".to_string(), "times_tables".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed Geography content (world flags, maps, capital cities)
    fn seed_geography_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding Geography content...");

        let questions = vec![
            // KS1 Basic Countries and Capitals
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of England?".to_string(),
                    options: Some(vec!["Manchester".to_string(), "Birmingham".to_string(), "London".to_string(), "Liverpool".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("London".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "uk".to_string(), "cities".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which continent do we live on?".to_string(),
                    options: Some(vec!["Asia".to_string(), "Africa".to_string(), "Europe".to_string(), "America".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Europe".to_string()),
            ).with_difficulty(2).with_tags(vec!["continents".to_string(), "world_knowledge".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the largest ocean in the world?".to_string(),
                    options: Some(vec!["Atlantic".to_string(), "Pacific".to_string(), "Indian".to_string(), "Arctic".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Pacific".to_string()),
            ).with_difficulty(3).with_tags(vec!["oceans".to_string(), "world_knowledge".to_string()]),

            // KS2 World Capitals
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of France?".to_string(),
                    options: Some(vec!["Lyon".to_string(), "Marseille".to_string(), "Paris".to_string(), "Nice".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Paris".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "france".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Italy?".to_string(),
                    options: Some(vec!["Milan".to_string(), "Rome".to_string(), "Naples".to_string(), "Venice".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Rome".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "italy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Australia?".to_string(),
                    options: Some(vec!["Sydney".to_string(), "Melbourne".to_string(), "Canberra".to_string(), "Perth".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canberra".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "oceania".to_string(), "australia".to_string()]),

            // KS2 Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a red circle on a white background?".to_string(),
                    options: Some(vec!["China".to_string(), "Japan".to_string(), "South Korea".to_string(), "Thailand".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Japan".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "countries".to_string(), "asia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country's flag has red and white stripes with a blue square containing stars?".to_string(),
                    options: Some(vec!["Canada".to_string(), "United Kingdom".to_string(), "United States".to_string(), "Australia".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("United States".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "countries".to_string(), "north_america".to_string()]),

            // KS2 Geography Features
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the longest river in the world?".to_string(),
                    options: Some(vec!["Amazon".to_string(), "Nile".to_string(), "Mississippi".to_string(), "Yangtze".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Nile".to_string()),
            ).with_difficulty(4).with_tags(vec!["rivers".to_string(), "world_records".to_string(), "africa".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which mountain range contains Mount Everest?".to_string(),
                    options: Some(vec!["Alps".to_string(), "Andes".to_string(), "Himalayas".to_string(), "Rockies".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Himalayas".to_string()),
            ).with_difficulty(3).with_tags(vec!["mountains".to_string(), "world_records".to_string(), "asia".to_string()]),

            // Additional KS1 Geography Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the name of our planet?".to_string(),
                    options: Some(vec!["Mars".to_string(), "Earth".to_string(), "Venus".to_string(), "Jupiter".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Earth".to_string()),
            ).with_difficulty(1).with_tags(vec!["planets".to_string(), "basic_knowledge".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a red and white flag with a maple leaf?".to_string(),
                    options: Some(vec!["USA".to_string(), "Canada".to_string(), "Mexico".to_string(), "Brazil".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canada".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "north_america".to_string()]),

            // EXPANDED FLAG QUESTIONS - MANY MORE FLAGS FOR BETTER LEARNING

            // European Flags - KS1 & KS2
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with three horizontal stripes: red, white, and blue?".to_string(),
                    options: Some(vec!["Germany".to_string(), "Netherlands".to_string(), "Belgium".to_string(), "Austria".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Netherlands".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with black, red, and yellow horizontal stripes?".to_string(),
                    options: Some(vec!["Germany".to_string(), "Belgium".to_string(), "Spain".to_string(), "Italy".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Germany".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with three vertical stripes: blue, white, and red?".to_string(),
                    options: Some(vec!["France".to_string(), "Italy".to_string(), "Spain".to_string(), "Portugal".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("France".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green, white, and red vertical stripes?".to_string(),
                    options: Some(vec!["Italy".to_string(), "Ireland".to_string(), "Mexico".to_string(), "Hungary".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Italy".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with red and yellow horizontal stripes?".to_string(),
                    options: Some(vec!["Spain".to_string(), "Portugal".to_string(), "Greece".to_string(), "Turkey".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Spain".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a Union Jack in the corner and stars?".to_string(),
                    options: Some(vec!["Australia".to_string(), "New Zealand".to_string(), "Both Australia and New Zealand".to_string(), "Canada".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Both Australia and New Zealand".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "oceania".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a white cross on a red background?".to_string(),
                    options: Some(vec!["Switzerland".to_string(), "Denmark".to_string(), "Norway".to_string(), "Sweden".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Denmark".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "scandinavia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a yellow cross on a blue background?".to_string(),
                    options: Some(vec!["Norway".to_string(), "Sweden".to_string(), "Finland".to_string(), "Iceland".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Sweden".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "scandinavia".to_string()]),

            // Asian Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with red and yellow stars?".to_string(),
                    options: Some(vec!["China".to_string(), "Vietnam".to_string(), "North Korea".to_string(), "All of these".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("All of these".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a green field and a white crescent moon and star?".to_string(),
                    options: Some(vec!["Pakistan".to_string(), "Turkey".to_string(), "Saudi Arabia".to_string(), "Iran".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Pakistan".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with three horizontal stripes: saffron, white, and green with a wheel in the center?".to_string(),
                    options: Some(vec!["India".to_string(), "Bangladesh".to_string(), "Sri Lanka".to_string(), "Nepal".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("India".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            // African Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green, yellow, and red horizontal stripes?".to_string(),
                    options: Some(vec!["Ethiopia".to_string(), "Ghana".to_string(), "Mali".to_string(), "All of these".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("All of these".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a green field and a white crescent and star?".to_string(),
                    options: Some(vec!["Algeria".to_string(), "Libya".to_string(), "Tunisia".to_string(), "Morocco".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Algeria".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with black, red, and yellow horizontal stripes with an eagle?".to_string(),
                    options: Some(vec!["Angola".to_string(), "Mozambique".to_string(), "Zambia".to_string(), "Zimbabwe".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Zambia".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string()]),

            // South American Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green field and a yellow diamond with a blue circle?".to_string(),
                    options: Some(vec!["Brazil".to_string(), "Argentina".to_string(), "Colombia".to_string(), "Peru".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Brazil".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "south_america".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with light blue and white horizontal stripes with a sun?".to_string(),
                    options: Some(vec!["Argentina".to_string(), "Uruguay".to_string(), "Both Argentina and Uruguay".to_string(), "Chile".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Both Argentina and Uruguay".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "south_america".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with yellow, blue, and red horizontal stripes?".to_string(),
                    options: Some(vec!["Colombia".to_string(), "Venezuela".to_string(), "Ecuador".to_string(), "All of these".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("All of these".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "south_america".to_string()]),

            // More North American Flags
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green, white, and red vertical stripes with an eagle?".to_string(),
                    options: Some(vec!["Mexico".to_string(), "Italy".to_string(), "Hungary".to_string(), "Bulgaria".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mexico".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "north_america".to_string()]),

            // Unique and Distinctive Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag that is not rectangular?".to_string(),
                    options: Some(vec!["Nepal".to_string(), "Switzerland".to_string(), "Vatican City".to_string(), "Monaco".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Nepal".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "unique_flags".to_string(), "asia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a red background and a white cross?".to_string(),
                    options: Some(vec!["Switzerland".to_string(), "Denmark".to_string(), "England".to_string(), "Georgia".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Switzerland".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a red field and a yellow star?".to_string(),
                    options: Some(vec!["Vietnam".to_string(), "China".to_string(), "Morocco".to_string(), "Turkey".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Vietnam".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            // Island Nations
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a white background and a red circle?".to_string(),
                    options: Some(vec!["Japan".to_string(), "Bangladesh".to_string(), "Palau".to_string(), "South Korea".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Japan".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "asia".to_string(), "islands".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green, white, and orange vertical stripes?".to_string(),
                    options: Some(vec!["Ireland".to_string(), "India".to_string(), "Ivory Coast".to_string(), "Niger".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ireland".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string(), "islands".to_string()]),

            // Middle Eastern Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with red and white horizontal stripes and a green cedar tree?".to_string(),
                    options: Some(vec!["Lebanon".to_string(), "Syria".to_string(), "Jordan".to_string(), "Iraq".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Lebanon".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "middle_east".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with black, white, green, and red horizontal stripes?".to_string(),
                    options: Some(vec!["Jordan".to_string(), "Palestine".to_string(), "UAE".to_string(), "Kuwait".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Jordan".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "middle_east".to_string()]),

            // More Distinctive Flags
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a blue field and yellow stars in a circle?".to_string(),
                    options: Some(vec!["European Union".to_string(), "Alaska".to_string(), "Bosnia".to_string(), "Kosovo".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("European Union".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "organizations".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a white background and a red maple leaf?".to_string(),
                    options: Some(vec!["Canada".to_string(), "Lebanon".to_string(), "Japan".to_string(), "Switzerland".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canada".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "north_america".to_string()]),

            // Flag Colors and Patterns - Educational
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What are the most common colors found on flags around the world?".to_string(),
                    options: Some(vec!["Red, white, and blue".to_string(), "Green, yellow, and purple".to_string(), "Pink, orange, and brown".to_string(), "Black, gray, and silver".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Red, white, and blue".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "colors".to_string(), "patterns".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which shape is most commonly found on flags?".to_string(),
                    options: Some(vec!["Stars".to_string(), "Circles".to_string(), "Triangles".to_string(), "Hearts".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Stars".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "shapes".to_string(), "patterns".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we call a large area of water surrounded by land?".to_string(),
                    options: Some(vec!["River".to_string(), "Lake".to_string(), "Ocean".to_string(), "Stream".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Lake".to_string()),
            ).with_difficulty(2).with_tags(vec!["water_bodies".to_string(), "geography_terms".to_string()]),

            // Additional KS2 Geography Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Germany?".to_string(),
                    options: Some(vec!["Munich".to_string(), "Hamburg".to_string(), "Berlin".to_string(), "Frankfurt".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Berlin".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "germany".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which desert is the largest in the world?".to_string(),
                    options: Some(vec!["Sahara".to_string(), "Gobi".to_string(), "Kalahari".to_string(), "Antarctic".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Antarctic".to_string()),
            ).with_difficulty(4).with_tags(vec!["deserts".to_string(), "world_records".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many continents are there?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["continents".to_string(), "world_knowledge".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which line of latitude runs around the middle of the Earth?".to_string(),
                    options: Some(vec!["Prime Meridian".to_string(), "Equator".to_string(), "Tropic of Cancer".to_string(), "Arctic Circle".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Equator".to_string()),
            ).with_difficulty(3).with_tags(vec!["latitude".to_string(), "geography_terms".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed English content (spelling, vocabulary, grammar)
    fn seed_english_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding English content...");

        let questions = vec![
            // KS1 Basic Spelling
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How do you spell the word for a furry pet that says 'meow'?".to_string(),
                    options: Some(vec!["cat".to_string(), "cot".to_string(), "cut".to_string(), "cart".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("cat".to_string()),
            ).with_difficulty(1).with_tags(vec!["spelling".to_string(), "animals".to_string(), "basic_words".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How do you spell the word for a large animal with a trunk?".to_string(),
                    options: Some(vec!["elefant".to_string(), "elephant".to_string(), "eliphant".to_string(), "elifant".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("elephant".to_string()),
            ).with_difficulty(2).with_tags(vec!["spelling".to_string(), "animals".to_string()]),

            // KS1 Phonics and Rhyming
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word rhymes with 'hat'?".to_string(),
                    options: Some(vec!["hot".to_string(), "cat".to_string(), "hit".to_string(), "hut".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("cat".to_string()),
            ).with_difficulty(2).with_tags(vec!["phonics".to_string(), "rhyming".to_string(), "sounds".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word rhymes with 'dog'?".to_string(),
                    options: Some(vec!["dig".to_string(), "log".to_string(), "bag".to_string(), "big".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("log".to_string()),
            ).with_difficulty(2).with_tags(vec!["phonics".to_string(), "rhyming".to_string(), "sounds".to_string()]),

            // KS1 Fill in the Blank
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "The ___ is shining brightly today.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 4,
                        expected_answer: "sun".to_string(),
                        case_sensitive: false,
                        accept_alternatives: Some(vec!["Sun".to_string()]),
                    }]),
                    additional_data: None,
                },
                Answer::Text("sun".to_string()),
            ).with_difficulty(2).with_tags(vec!["fill_blank".to_string(), "vocabulary".to_string(), "weather".to_string()]),

            // KS2 Grammar
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What type of word is 'quickly'?".to_string(),
                    options: Some(vec!["Noun".to_string(), "Verb".to_string(), "Adjective".to_string(), "Adverb".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Adverb".to_string()),
            ).with_difficulty(3).with_tags(vec!["grammar".to_string(), "parts_of_speech".to_string(), "adverbs".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which sentence uses the correct punctuation?".to_string(),
                    options: Some(vec![
                        "What time is it.".to_string(),
                        "What time is it?".to_string(),
                        "What time is it!".to_string(),
                        "What time is it,".to_string()
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("What time is it?".to_string()),
            ).with_difficulty(2).with_tags(vec!["grammar".to_string(), "punctuation".to_string(), "questions".to_string()]),

            // KS2 Vocabulary
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What does the word 'enormous' mean?".to_string(),
                    options: Some(vec!["Very small".to_string(), "Very big".to_string(), "Very fast".to_string(), "Very slow".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Very big".to_string()),
            ).with_difficulty(3).with_tags(vec!["vocabulary".to_string(), "synonyms".to_string(), "adjectives".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the opposite of 'ancient'?".to_string(),
                    options: Some(vec!["Old".to_string(), "Modern".to_string(), "Big".to_string(), "Small".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Modern".to_string()),
            ).with_difficulty(3).with_tags(vec!["vocabulary".to_string(), "antonyms".to_string(), "adjectives".to_string()]),

            // KS2 Story Quiz
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::StoryQuiz,
                QuestionContent {
                    text: "What was the main character's problem in the story?".to_string(),
                    options: Some(vec![
                        "She lost her keys".to_string(),
                        "She couldn't find her way home".to_string(),
                        "She forgot her lunch".to_string(),
                        "She missed the bus".to_string()
                    ]),
                    story: Some("Sarah was walking home from school when she realized she had taken a wrong turn. The streets looked unfamiliar, and she couldn't see any landmarks she recognized. She felt worried as the sun was starting to set.".to_string()),
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("She couldn't find her way home".to_string()),
            ).with_difficulty(3).with_tags(vec!["reading_comprehension".to_string(), "story_quiz".to_string(), "main_idea".to_string()]),

            // Additional KS1 English Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word rhymes with 'tree'?".to_string(),
                    options: Some(vec!["car".to_string(), "bee".to_string(), "dog".to_string(), "sun".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("bee".to_string()),
            ).with_difficulty(2).with_tags(vec!["phonics".to_string(), "rhyming".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many letters are in the alphabet?".to_string(),
                    options: Some(vec!["24".to_string(), "25".to_string(), "26".to_string(), "27".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("26".to_string()),
            ).with_difficulty(1).with_tags(vec!["alphabet".to_string(), "basic_knowledge".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "I like to ___ books before bedtime.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 11,
                        expected_answer: "read".to_string(),
                        case_sensitive: false,
                        accept_alternatives: Some(vec!["Read".to_string()]),
                    }]),
                    additional_data: None,
                },
                Answer::Text("read".to_string()),
            ).with_difficulty(2).with_tags(vec!["fill_blank".to_string(), "vocabulary".to_string()]),

            // Additional KS2 English Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is a synonym for 'happy'?".to_string(),
                    options: Some(vec!["Sad".to_string(), "Joyful".to_string(), "Angry".to_string(), "Tired".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Joyful".to_string()),
            ).with_difficulty(3).with_tags(vec!["vocabulary".to_string(), "synonyms".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which sentence is written in past tense?".to_string(),
                    options: Some(vec![
                        "I am walking to school".to_string(),
                        "I will walk to school".to_string(),
                        "I walked to school".to_string(),
                        "I walk to school".to_string()
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("I walked to school".to_string()),
            ).with_difficulty(3).with_tags(vec!["grammar".to_string(), "tenses".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the plural of 'child'?".to_string(),
                    options: Some(vec!["childs".to_string(), "childes".to_string(), "children".to_string(), "child".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("children".to_string()),
            ).with_difficulty(2).with_tags(vec!["grammar".to_string(), "plurals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::StoryQuiz,
                QuestionContent {
                    text: "How did Tom feel at the end of the story?".to_string(),
                    options: Some(vec![
                        "Worried".to_string(),
                        "Excited".to_string(),
                        "Proud".to_string(),
                        "Confused".to_string()
                    ]),
                    story: Some("Tom had been practicing for weeks for the school talent show. When his name was called, he walked onto the stage nervously. But as soon as he started singing, he felt confident. The audience clapped loudly when he finished, and Tom smiled widely as he took a bow.".to_string()),
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Proud".to_string()),
            ).with_difficulty(3).with_tags(vec!["reading_comprehension".to_string(), "emotions".to_string(), "story_quiz".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed Science content (plants, animals, human body topics)
    fn seed_science_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding Science content...");

        let questions = vec![
            // KS1 Animals
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do bees make?".to_string(),
                    options: Some(vec!["Milk".to_string(), "Honey".to_string(), "Eggs".to_string(), "Wool".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Honey".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "insects".to_string(), "nature".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which animal is known for changing colors?".to_string(),
                    options: Some(vec!["Elephant".to_string(), "Chameleon".to_string(), "Lion".to_string(), "Rabbit".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Chameleon".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "reptiles".to_string(), "adaptation".to_string()]),

            // KS1 Plants
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do plants need to grow?".to_string(),
                    options: Some(vec!["Only water".to_string(), "Only sunlight".to_string(), "Water and sunlight".to_string(), "Only soil".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Water and sunlight".to_string()),
            ).with_difficulty(2).with_tags(vec!["plants".to_string(), "growth".to_string(), "nature".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which part of the plant makes food?".to_string(),
                    options: Some(vec!["Roots".to_string(), "Leaves".to_string(), "Stem".to_string(), "Flowers".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Leaves".to_string()),
            ).with_difficulty(2).with_tags(vec!["plants".to_string(), "photosynthesis".to_string(), "biology".to_string()]),

            // KS2 Human Body
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many bones are there in an adult human body?".to_string(),
                    options: Some(vec!["106".to_string(), "206".to_string(), "306".to_string(), "406".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("206".to_string()),
            ).with_difficulty(4).with_tags(vec!["human_body".to_string(), "bones".to_string(), "anatomy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which organ pumps blood around the body?".to_string(),
                    options: Some(vec!["Brain".to_string(), "Lungs".to_string(), "Heart".to_string(), "Liver".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Heart".to_string()),
            ).with_difficulty(2).with_tags(vec!["human_body".to_string(), "organs".to_string(), "circulation".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many chambers does a human heart have?".to_string(),
                    options: Some(vec!["2".to_string(), "3".to_string(), "4".to_string(), "5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("4".to_string()),
            ).with_difficulty(3).with_tags(vec!["human_body".to_string(), "heart".to_string(), "anatomy".to_string()]),

            // KS2 Environment and Ecosystems
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What gas do plants absorb from the air?".to_string(),
                    options: Some(vec!["Oxygen".to_string(), "Nitrogen".to_string(), "Carbon dioxide".to_string(), "Hydrogen".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Carbon dioxide".to_string()),
            ).with_difficulty(3).with_tags(vec!["plants".to_string(), "environment".to_string(), "gases".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the process by which water changes from liquid to gas?".to_string(),
                    options: Some(vec!["Condensation".to_string(), "Evaporation".to_string(), "Precipitation".to_string(), "Freezing".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Evaporation".to_string()),
            ).with_difficulty(3).with_tags(vec!["water_cycle".to_string(), "states_of_matter".to_string(), "physics".to_string()]),

            // KS2 Space and Earth
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How long does it take for Earth to orbit the Sun?".to_string(),
                    options: Some(vec!["1 day".to_string(), "1 month".to_string(), "1 year".to_string(), "1 decade".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1 year".to_string()),
            ).with_difficulty(2).with_tags(vec!["space".to_string(), "earth".to_string(), "solar_system".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which planet is closest to the Sun?".to_string(),
                    options: Some(vec!["Venus".to_string(), "Earth".to_string(), "Mercury".to_string(), "Mars".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mercury".to_string()),
            ).with_difficulty(3).with_tags(vec!["space".to_string(), "planets".to_string(), "solar_system".to_string()]),

            // Additional KS1 Science Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do fish use to breathe underwater?".to_string(),
                    options: Some(vec!["Lungs".to_string(), "Gills".to_string(), "Nose".to_string(), "Mouth".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Gills".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "fish".to_string(), "breathing".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which season comes after winter?".to_string(),
                    options: Some(vec!["Summer".to_string(), "Autumn".to_string(), "Spring".to_string(), "Winter".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Spring".to_string()),
            ).with_difficulty(1).with_tags(vec!["seasons".to_string(), "weather".to_string(), "nature".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we call baby cats?".to_string(),
                    options: Some(vec!["Puppies".to_string(), "Kittens".to_string(), "Cubs".to_string(), "Chicks".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Kittens".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "baby_animals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What happens to water when it gets very cold?".to_string(),
                    options: Some(vec!["It disappears".to_string(), "It turns to ice".to_string(), "It gets hot".to_string(), "It changes color".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("It turns to ice".to_string()),
            ).with_difficulty(2).with_tags(vec!["states_of_matter".to_string(), "water".to_string(), "temperature".to_string()]),

            // Additional KS2 Science Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the hardest natural substance on Earth?".to_string(),
                    options: Some(vec!["Gold".to_string(), "Iron".to_string(), "Diamond".to_string(), "Silver".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Diamond".to_string()),
            ).with_difficulty(4).with_tags(vec!["materials".to_string(), "properties".to_string(), "minerals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many teeth does an adult human typically have?".to_string(),
                    options: Some(vec!["28".to_string(), "30".to_string(), "32".to_string(), "34".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("32".to_string()),
            ).with_difficulty(3).with_tags(vec!["human_body".to_string(), "teeth".to_string(), "health".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What type of animal is a whale?".to_string(),
                    options: Some(vec!["Fish".to_string(), "Mammal".to_string(), "Reptile".to_string(), "Bird".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mammal".to_string()),
            ).with_difficulty(3).with_tags(vec!["animals".to_string(), "classification".to_string(), "mammals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do plants release into the air during photosynthesis?".to_string(),
                    options: Some(vec!["Carbon dioxide".to_string(), "Oxygen".to_string(), "Nitrogen".to_string(), "Hydrogen".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Oxygen".to_string()),
            ).with_difficulty(3).with_tags(vec!["plants".to_string(), "photosynthesis".to_string(), "gases".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What force pulls objects toward the Earth?".to_string(),
                    options: Some(vec!["Magnetism".to_string(), "Gravity".to_string(), "Electricity".to_string(), "Friction".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Gravity".to_string()),
            ).with_difficulty(2).with_tags(vec!["forces".to_string(), "physics".to_string(), "gravity".to_string()]),

            // === NEW DIVERSE SCIENCE QUESTIONS ===
            
            // KS1 - Animals
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do bees make?".to_string(),
                    options: Some(vec!["Milk".to_string(), "Honey".to_string(), "Eggs".to_string(), "Wool".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Honey".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "insects".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which animal has a long trunk?".to_string(),
                    options: Some(vec!["Lion".to_string(), "Elephant".to_string(), "Giraffe".to_string(), "Zebra".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Elephant".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "mammals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do caterpillars turn into?".to_string(),
                    options: Some(vec!["Bees".to_string(), "Butterflies".to_string(), "Birds".to_string(), "Beetles".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Butterflies".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "life_cycles".to_string(), "insects".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which animal lives in water and has gills?".to_string(),
                    options: Some(vec!["Dog".to_string(), "Fish".to_string(), "Cat".to_string(), "Bird".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Fish".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "fish".to_string(), "habitats".to_string()]),

            // KS1 - Plants
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do plants need to grow?".to_string(),
                    options: Some(vec!["Only water".to_string(), "Water, sunlight, and air".to_string(), "Only sunlight".to_string(), "Only soil".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Water, sunlight, and air".to_string()),
            ).with_difficulty(2).with_tags(vec!["plants".to_string(), "growth".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which part of the plant grows underground?".to_string(),
                    options: Some(vec!["Leaves".to_string(), "Flowers".to_string(), "Roots".to_string(), "Stem".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Roots".to_string()),
            ).with_difficulty(1).with_tags(vec!["plants".to_string(), "plant_parts".to_string()]),

            // KS1 - Human Body
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many fingers do you have on one hand?".to_string(),
                    options: Some(vec!["4".to_string(), "5".to_string(), "6".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("5".to_string()),
            ).with_difficulty(1).with_tags(vec!["human_body".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which sense do you use to smell?".to_string(),
                    options: Some(vec!["Eyes".to_string(), "Ears".to_string(), "Nose".to_string(), "Tongue".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Nose".to_string()),
            ).with_difficulty(1).with_tags(vec!["human_body".to_string(), "senses".to_string()]),

            // KS2 - More Animals
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the largest animal on Earth?".to_string(),
                    options: Some(vec!["Elephant".to_string(), "Blue Whale".to_string(), "Giraffe".to_string(), "Polar Bear".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Blue Whale".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "mammals".to_string(), "records".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which animal is known for changing colors to blend in?".to_string(),
                    options: Some(vec!["Chameleon".to_string(), "Lion".to_string(), "Elephant".to_string(), "Penguin".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Chameleon".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "reptiles".to_string(), "adaptation".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do herbivores eat?".to_string(),
                    options: Some(vec!["Only meat".to_string(), "Only plants".to_string(), "Both plants and meat".to_string(), "Only fish".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Only plants".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "diet".to_string(), "classification".to_string()]),

            // KS2 - Space
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which planet is closest to the Sun?".to_string(),
                    options: Some(vec!["Venus".to_string(), "Earth".to_string(), "Mercury".to_string(), "Mars".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mercury".to_string()),
            ).with_difficulty(3).with_tags(vec!["space".to_string(), "planets".to_string(), "solar_system".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many planets are in our solar system?".to_string(),
                    options: Some(vec!["7".to_string(), "8".to_string(), "9".to_string(), "10".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(3).with_tags(vec!["space".to_string(), "planets".to_string(), "solar_system".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the name of Earth's natural satellite?".to_string(),
                    options: Some(vec!["Sun".to_string(), "Moon".to_string(), "Mars".to_string(), "Venus".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Moon".to_string()),
            ).with_difficulty(2).with_tags(vec!["space".to_string(), "moon".to_string(), "earth".to_string()]),

            // KS2 - Materials
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What happens to water when it freezes?".to_string(),
                    options: Some(vec!["It becomes gas".to_string(), "It becomes ice".to_string(), "It disappears".to_string(), "It becomes warmer".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("It becomes ice".to_string()),
            ).with_difficulty(2).with_tags(vec!["materials".to_string(), "states_of_matter".to_string(), "water".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What are the three states of matter?".to_string(),
                    options: Some(vec!["Hot, cold, warm".to_string(), "Solid, liquid, gas".to_string(), "Big, medium, small".to_string(), "Hard, soft, rough".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Solid, liquid, gas".to_string()),
            ).with_difficulty(3).with_tags(vec!["materials".to_string(), "states_of_matter".to_string()]),

            // KS2 - Energy and Forces
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What type of energy comes from the Sun?".to_string(),
                    options: Some(vec!["Sound energy".to_string(), "Light and heat energy".to_string(), "Electrical energy".to_string(), "Wind energy".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Light and heat energy".to_string()),
            ).with_difficulty(3).with_tags(vec!["energy".to_string(), "sun".to_string(), "light".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do magnets attract?".to_string(),
                    options: Some(vec!["Wood".to_string(), "Plastic".to_string(), "Iron and steel".to_string(), "Paper".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Iron and steel".to_string()),
            ).with_difficulty(3).with_tags(vec!["forces".to_string(), "magnetism".to_string(), "materials".to_string()]),

            // KS2 - Electricity
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we call materials that let electricity pass through them?".to_string(),
                    options: Some(vec!["Insulators".to_string(), "Conductors".to_string(), "Resistors".to_string(), "Batteries".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Conductors".to_string()),
            ).with_difficulty(4).with_tags(vec!["electricity".to_string(), "materials".to_string(), "conductors".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What provides the energy in a simple circuit?".to_string(),
                    options: Some(vec!["Wire".to_string(), "Switch".to_string(), "Battery".to_string(), "Bulb".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Battery".to_string()),
            ).with_difficulty(3).with_tags(vec!["electricity".to_string(), "circuits".to_string(), "energy".to_string()]),

            // KS2 - Food Chains
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we call animals that eat other animals?".to_string(),
                    options: Some(vec!["Herbivores".to_string(), "Carnivores".to_string(), "Omnivores".to_string(), "Producers".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Carnivores".to_string()),
            ).with_difficulty(3).with_tags(vec!["animals".to_string(), "food_chains".to_string(), "diet".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is at the start of every food chain?".to_string(),
                    options: Some(vec!["Animals".to_string(), "Plants".to_string(), "Humans".to_string(), "Insects".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Plants".to_string()),
            ).with_difficulty(3).with_tags(vec!["food_chains".to_string(), "plants".to_string(), "ecosystems".to_string()]),

            // KS1 - Weather
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we see in the sky when it rains?".to_string(),
                    options: Some(vec!["Sun".to_string(), "Clouds".to_string(), "Stars".to_string(), "Moon".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Clouds".to_string()),
            ).with_difficulty(1).with_tags(vec!["weather".to_string(), "clouds".to_string(), "rain".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which season is the coldest?".to_string(),
                    options: Some(vec!["Spring".to_string(), "Summer".to_string(), "Autumn".to_string(), "Winter".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Winter".to_string()),
            ).with_difficulty(1).with_tags(vec!["seasons".to_string(), "weather".to_string(), "temperature".to_string()]),

            // KS2 - Rocks and Soil
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What type of rock is formed from cooled lava?".to_string(),
                    options: Some(vec!["Sedimentary".to_string(), "Igneous".to_string(), "Metamorphic".to_string(), "Limestone".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Igneous".to_string()),
            ).with_difficulty(4).with_tags(vec!["rocks".to_string(), "geology".to_string(), "volcanoes".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is soil made from?".to_string(),
                    options: Some(vec!["Only water".to_string(), "Rock particles, dead plants, and animals".to_string(), "Only sand".to_string(), "Only clay".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Rock particles, dead plants, and animals".to_string()),
            ).with_difficulty(3).with_tags(vec!["soil".to_string(), "rocks".to_string(), "earth".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed General Knowledge content (history, culture, interesting facts)
    fn seed_general_knowledge_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding General Knowledge content...");

        let questions = vec![
            // KS1 Basic Facts
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many days are there in a week?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(1).with_tags(vec!["time".to_string(), "calendar".to_string(), "basic_facts".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many months are there in a year?".to_string(),
                    options: Some(vec!["10".to_string(), "11".to_string(), "12".to_string(), "13".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("12".to_string()),
            ).with_difficulty(1).with_tags(vec!["time".to_string(), "calendar".to_string(), "basic_facts".to_string()]),

            // KS1 Colors and Art
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What color do you get when you mix red and yellow?".to_string(),
                    options: Some(vec!["Purple".to_string(), "Green".to_string(), "Orange".to_string(), "Blue".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Orange".to_string()),
            ).with_difficulty(2).with_tags(vec!["colors".to_string(), "art".to_string(), "mixing".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What color do you get when you mix blue and yellow?".to_string(),
                    options: Some(vec!["Purple".to_string(), "Green".to_string(), "Orange".to_string(), "Red".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Green".to_string()),
            ).with_difficulty(2).with_tags(vec!["colors".to_string(), "art".to_string(), "mixing".to_string()]),

            // KS2 History
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Who was the first person to walk on the moon?".to_string(),
                    options: Some(vec!["Buzz Aldrin".to_string(), "Neil Armstrong".to_string(), "John Glenn".to_string(), "Alan Shepard".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Neil Armstrong".to_string()),
            ).with_difficulty(3).with_tags(vec!["history".to_string(), "space".to_string(), "famous_people".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "In which year did World War II end?".to_string(),
                    options: Some(vec!["1944".to_string(), "1945".to_string(), "1946".to_string(), "1947".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1945".to_string()),
            ).with_difficulty(4).with_tags(vec!["history".to_string(), "world_war".to_string(), "dates".to_string()]),

            // KS2 Culture and Landmarks
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "In which country would you find Machu Picchu?".to_string(),
                    options: Some(vec!["Brazil".to_string(), "Peru".to_string(), "Chile".to_string(), "Argentina".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Peru".to_string()),
            ).with_difficulty(4).with_tags(vec!["culture".to_string(), "landmarks".to_string(), "south_america".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which ancient wonder of the world still exists today?".to_string(),
                    options: Some(vec!["Hanging Gardens of Babylon".to_string(), "Colossus of Rhodes".to_string(), "Great Pyramid of Giza".to_string(), "Lighthouse of Alexandria".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Great Pyramid of Giza".to_string()),
            ).with_difficulty(4).with_tags(vec!["history".to_string(), "ancient_world".to_string(), "landmarks".to_string()]),

            // KS2 Inventions and Technology
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Who invented the telephone?".to_string(),
                    options: Some(vec!["Thomas Edison".to_string(), "Alexander Graham Bell".to_string(), "Nikola Tesla".to_string(), "Benjamin Franklin".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Alexander Graham Bell".to_string()),
            ).with_difficulty(3).with_tags(vec!["inventions".to_string(), "technology".to_string(), "famous_people".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What does 'WWW' stand for?".to_string(),
                    options: Some(vec!["World Wide Web".to_string(), "World War Won".to_string(), "Wild Wild West".to_string(), "World Weather Watch".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("World Wide Web".to_string()),
            ).with_difficulty(2).with_tags(vec!["technology".to_string(), "internet".to_string(), "acronyms".to_string()]),

            // KS2 Sports and Olympics
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How often are the Summer Olympic Games held?".to_string(),
                    options: Some(vec!["Every 2 years".to_string(), "Every 3 years".to_string(), "Every 4 years".to_string(), "Every 5 years".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Every 4 years".to_string()),
            ).with_difficulty(2).with_tags(vec!["sports".to_string(), "olympics".to_string(), "events".to_string()]),

            // Additional KS1 General Knowledge Questions
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What sound does a cow make?".to_string(),
                    options: Some(vec!["Woof".to_string(), "Meow".to_string(), "Moo".to_string(), "Chirp".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Moo".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "sounds".to_string(), "farm_animals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we use to brush our teeth?".to_string(),
                    options: Some(vec!["Spoon".to_string(), "Toothbrush".to_string(), "Fork".to_string(), "Comb".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Toothbrush".to_string()),
            ).with_difficulty(1).with_tags(vec!["hygiene".to_string(), "daily_life".to_string(), "health".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which meal do we eat in the morning?".to_string(),
                    options: Some(vec!["Lunch".to_string(), "Dinner".to_string(), "Breakfast".to_string(), "Snack".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Breakfast".to_string()),
            ).with_difficulty(1).with_tags(vec!["meals".to_string(), "daily_life".to_string(), "time".to_string()]),

            // Additional KS2 General Knowledge Questions
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which famous scientist developed the theory of relativity?".to_string(),
                    options: Some(vec!["Isaac Newton".to_string(), "Albert Einstein".to_string(), "Charles Darwin".to_string(), "Marie Curie".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Albert Einstein".to_string()),
            ).with_difficulty(4).with_tags(vec!["scientists".to_string(), "famous_people".to_string(), "physics".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the currency used in the United Kingdom?".to_string(),
                    options: Some(vec!["Dollar".to_string(), "Euro".to_string(), "Pound".to_string(), "Yen".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Pound".to_string()),
            ).with_difficulty(2).with_tags(vec!["money".to_string(), "uk".to_string(), "currency".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which instrument has 88 keys?".to_string(),
                    options: Some(vec!["Guitar".to_string(), "Piano".to_string(), "Violin".to_string(), "Drums".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Piano".to_string()),
            ).with_difficulty(3).with_tags(vec!["music".to_string(), "instruments".to_string(), "arts".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the fastest land animal?".to_string(),
                    options: Some(vec!["Lion".to_string(), "Horse".to_string(), "Cheetah".to_string(), "Elephant".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Cheetah".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "speed".to_string(), "records".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "In Greek mythology, who is the king of the gods?".to_string(),
                    options: Some(vec!["Apollo".to_string(), "Zeus".to_string(), "Poseidon".to_string(), "Hades".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Zeus".to_string()),
            ).with_difficulty(4).with_tags(vec!["mythology".to_string(), "ancient_greece".to_string(), "culture".to_string()]),

            // === EXPANDED KS1 GENERAL KNOWLEDGE ===
            
            // More Basic Life Skills
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What season comes after winter?".to_string(),
                    options: Some(vec!["Summer".to_string(), "Autumn".to_string(), "Spring".to_string(), "Winter".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Spring".to_string()),
            ).with_difficulty(1).with_tags(vec!["seasons".to_string(), "nature".to_string(), "time".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which of these is a fruit?".to_string(),
                    options: Some(vec!["Carrot".to_string(), "Apple".to_string(), "Potato".to_string(), "Lettuce".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Apple".to_string()),
            ).with_difficulty(1).with_tags(vec!["food".to_string(), "healthy_eating".to_string(), "fruits".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do bees make?".to_string(),
                    options: Some(vec!["Milk".to_string(), "Honey".to_string(), "Butter".to_string(), "Cheese".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Honey".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "nature".to_string(), "insects".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we call a baby dog?".to_string(),
                    options: Some(vec!["Kitten".to_string(), "Puppy".to_string(), "Calf".to_string(), "Chick".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Puppy".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "pets".to_string(), "vocabulary".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many legs does a spider have?".to_string(),
                    options: Some(vec!["6".to_string(), "8".to_string(), "10".to_string(), "12".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("8".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "insects".to_string(), "counting".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What color is the sun?".to_string(),
                    options: Some(vec!["Red".to_string(), "Blue".to_string(), "Yellow".to_string(), "Green".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Yellow".to_string()),
            ).with_difficulty(1).with_tags(vec!["space".to_string(), "colors".to_string(), "nature".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which animal says 'ribbit'?".to_string(),
                    options: Some(vec!["Duck".to_string(), "Frog".to_string(), "Cat".to_string(), "Dog".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Frog".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "sounds".to_string(), "amphibians".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What do we use to cut paper?".to_string(),
                    options: Some(vec!["Scissors".to_string(), "Spoon".to_string(), "Pencil".to_string(), "Brush".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Scissors".to_string()),
            ).with_difficulty(1).with_tags(vec!["tools".to_string(), "school".to_string(), "daily_life".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which shape has three sides?".to_string(),
                    options: Some(vec!["Circle".to_string(), "Square".to_string(), "Triangle".to_string(), "Rectangle".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Triangle".to_string()),
            ).with_difficulty(1).with_tags(vec!["shapes".to_string(), "geometry".to_string(), "maths".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Where do fish live?".to_string(),
                    options: Some(vec!["In trees".to_string(), "In water".to_string(), "In caves".to_string(), "In the sky".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("In water".to_string()),
            ).with_difficulty(1).with_tags(vec!["animals".to_string(), "habitats".to_string(), "nature".to_string()]),

            // === EXPANDED KS2 GENERAL KNOWLEDGE ===

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the largest ocean on Earth?".to_string(),
                    options: Some(vec!["Atlantic Ocean".to_string(), "Indian Ocean".to_string(), "Pacific Ocean".to_string(), "Arctic Ocean".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Pacific Ocean".to_string()),
            ).with_difficulty(3).with_tags(vec!["geography".to_string(), "oceans".to_string(), "earth".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many continents are there in the world?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("7".to_string()),
            ).with_difficulty(2).with_tags(vec!["geography".to_string(), "continents".to_string(), "world".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the tallest mountain in the world?".to_string(),
                    options: Some(vec!["K2".to_string(), "Mount Everest".to_string(), "Kilimanjaro".to_string(), "Mont Blanc".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mount Everest".to_string()),
            ).with_difficulty(2).with_tags(vec!["geography".to_string(), "mountains".to_string(), "records".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which planet is known as the 'Red Planet'?".to_string(),
                    options: Some(vec!["Venus".to_string(), "Mars".to_string(), "Jupiter".to_string(), "Saturn".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mars".to_string()),
            ).with_difficulty(2).with_tags(vec!["space".to_string(), "planets".to_string(), "science".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Who wrote 'Romeo and Juliet'?".to_string(),
                    options: Some(vec!["Charles Dickens".to_string(), "William Shakespeare".to_string(), "Jane Austen".to_string(), "Mark Twain".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("William Shakespeare".to_string()),
            ).with_difficulty(3).with_tags(vec!["literature".to_string(), "authors".to_string(), "famous_works".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Australia?".to_string(),
                    options: Some(vec!["Sydney".to_string(), "Melbourne".to_string(), "Canberra".to_string(), "Brisbane".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canberra".to_string()),
            ).with_difficulty(4).with_tags(vec!["geography".to_string(), "capitals".to_string(), "australia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which gas do plants absorb from the air?".to_string(),
                    options: Some(vec!["Oxygen".to_string(), "Carbon dioxide".to_string(), "Nitrogen".to_string(), "Helium".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Carbon dioxide".to_string()),
            ).with_difficulty(3).with_tags(vec!["science".to_string(), "plants".to_string(), "photosynthesis".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many sides does a hexagon have?".to_string(),
                    options: Some(vec!["5".to_string(), "6".to_string(), "7".to_string(), "8".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(2).with_tags(vec!["shapes".to_string(), "geometry".to_string(), "maths".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the freezing point of water in Celsius?".to_string(),
                    options: Some(vec!["-10°C".to_string(), "0°C".to_string(), "10°C".to_string(), "32°C".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0°C".to_string()),
            ).with_difficulty(2).with_tags(vec!["science".to_string(), "temperature".to_string(), "water".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which famous ship sank in 1912?".to_string(),
                    options: Some(vec!["Queen Mary".to_string(), "Titanic".to_string(), "Lusitania".to_string(), "Britannic".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Titanic".to_string()),
            ).with_difficulty(2).with_tags(vec!["history".to_string(), "ships".to_string(), "disasters".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the largest mammal in the world?".to_string(),
                    options: Some(vec!["African Elephant".to_string(), "Blue Whale".to_string(), "Giraffe".to_string(), "Great White Shark".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Blue Whale".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "mammals".to_string(), "records".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "In which country is the Taj Mahal located?".to_string(),
                    options: Some(vec!["Pakistan".to_string(), "India".to_string(), "Bangladesh".to_string(), "Nepal".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("India".to_string()),
            ).with_difficulty(3).with_tags(vec!["geography".to_string(), "landmarks".to_string(), "asia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the smallest continent?".to_string(),
                    options: Some(vec!["Europe".to_string(), "Antarctica".to_string(), "Australia".to_string(), "South America".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Australia".to_string()),
            ).with_difficulty(3).with_tags(vec!["geography".to_string(), "continents".to_string(), "size".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "How many bones are in the human body?".to_string(),
                    options: Some(vec!["186".to_string(), "206".to_string(), "226".to_string(), "246".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("206".to_string()),
            ).with_difficulty(4).with_tags(vec!["science".to_string(), "human_body".to_string(), "anatomy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the main language spoken in Brazil?".to_string(),
                    options: Some(vec!["Spanish".to_string(), "Portuguese".to_string(), "French".to_string(), "English".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Portuguese".to_string()),
            ).with_difficulty(3).with_tags(vec!["geography".to_string(), "languages".to_string(), "south_america".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed Times Tables content - Complete 144 questions (1x1 to 12x12)
    fn seed_times_tables_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding Times Tables content - Generating 144 questions (1x1 to 12x12)...");

        let mut questions = Vec::new();
        
        // Generate all 144 times tables (1x1 to 12x12)
        for a in 1..=12 {
            for b in 1..=12 {
                let result = a * b;
                
                // Generate distractors (wrong answers)
                let mut distractors = vec![];
                if result > 1 { distractors.push(result - 1); }
                if result > 2 { distractors.push(result - 2); }
                distractors.push(result + 1);
                distractors.push(result + 2);
                if a > 1 { distractors.push((a - 1) * b); }
                if b > 1 { distractors.push(a * (b - 1)); }
                
                // Remove duplicates and correct answer
                distractors.retain(|&x| x != result && x > 0);
                distractors.sort();
                distractors.dedup();
                
                // Select 3 distractors
                let selected_distractors: Vec<String> = if distractors.len() >= 3 {
                    vec![
                        distractors[0].to_string(),
                        distractors[distractors.len() / 2].to_string(),
                        distractors[distractors.len() - 1].to_string(),
                    ]
                } else {
                    let mut d = distractors.iter().map(|x| x.to_string()).collect::<Vec<_>>();
                    while d.len() < 3 {
                        d.push((result + d.len() as i32 + 3).to_string());
                    }
                    d
                };
                
                // Create options with correct answer
                let mut options = selected_distractors;
                options.push(result.to_string());
                
                // Determine difficulty and key stage
                let (difficulty, key_stage) = if a <= 2 || b <= 2 || a == 10 || b == 10 {
                    (1, KeyStage::KS1)
                } else if a <= 5 && b <= 5 {
                    (2, KeyStage::KS1)
                } else if a <= 10 && b <= 10 {
                    (3, KeyStage::KS2)
                } else {
                    (4, KeyStage::KS2)
                };
                
                let question = Question::new(
                    subject_id,
                    key_stage,
                    QuestionType::MultipleChoice,
                    QuestionContent {
                        text: format!("What is {} × {}?", a, b),
                        options: Some(options),
                        story: None,
                        image_url: None,
                        hotspots: None,
                        blanks: None,
                        additional_data: None,
                    },
                    Answer::Text(result.to_string()),
                ).with_difficulty(difficulty).with_tags(vec![
                    "times_tables".to_string(),
                    format!("{}x_table", a),
                    "multiplication".to_string(),
                ]);
                
                questions.push(question);
            }
        }
        
        println!("Generated {} times tables questions", questions.len());
        
        // Add all generated questions to database
        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed Flags & Capitals content - Comprehensive world geography
    fn seed_flags_capitals_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding Flags & Capitals content...");

        let questions = vec![
            // === WORLD CUP 2022 COUNTRIES WITH FLAG IMAGES ===
            
            // Argentina
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Brazil".to_string(), "Argentina".to_string(), "Uruguay".to_string(), "Chile".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ar.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Argentina".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "south_america".to_string(), "world_cup".to_string()]),

            // Australia
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["New Zealand".to_string(), "Australia".to_string(), "United Kingdom".to_string(), "Fiji".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/au.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Australia".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "oceania".to_string(), "world_cup".to_string()]),

            // Belgium
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Belgium".to_string(), "Germany".to_string(), "Netherlands".to_string(), "France".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/be.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Belgium".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Brazil
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Brazil".to_string(), "Portugal".to_string(), "Colombia".to_string(), "Ecuador".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/br.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Brazil".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "south_america".to_string(), "world_cup".to_string()]),

            // Cameroon
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Ghana".to_string(), "Cameroon".to_string(), "Senegal".to_string(), "Nigeria".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/cm.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Cameroon".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string(), "world_cup".to_string()]),

            // Canada
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["USA".to_string(), "Canada".to_string(), "United Kingdom".to_string(), "Australia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ca.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canada".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "north_america".to_string(), "world_cup".to_string()]),

            // Costa Rica
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Costa Rica".to_string(), "Nicaragua".to_string(), "Honduras".to_string(), "Guatemala".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/cr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Costa Rica".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "central_america".to_string(), "world_cup".to_string()]),

            // Croatia
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Croatia".to_string(), "Serbia".to_string(), "Slovenia".to_string(), "Czech Republic".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/hr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Croatia".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Denmark
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Sweden".to_string(), "Denmark".to_string(), "Norway".to_string(), "Finland".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/dk.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Denmark".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Ecuador
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Colombia".to_string(), "Ecuador".to_string(), "Venezuela".to_string(), "Peru".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ec.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ecuador".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "south_america".to_string(), "world_cup".to_string()]),

            // England
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Scotland".to_string(), "England".to_string(), "Wales".to_string(), "Ireland".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/gb-eng.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("England".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // France
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Netherlands".to_string(), "France".to_string(), "Russia".to_string(), "Croatia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/fr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("France".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Germany
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Belgium".to_string(), "Germany".to_string(), "Austria".to_string(), "Hungary".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/de.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Germany".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Ghana
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Ghana".to_string(), "Cameroon".to_string(), "Senegal".to_string(), "Mali".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/gh.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ghana".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string(), "world_cup".to_string()]),

            // Iran
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Iraq".to_string(), "Iran".to_string(), "Afghanistan".to_string(), "Pakistan".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ir.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Iran".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "asia".to_string(), "world_cup".to_string()]),

            // Japan
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["China".to_string(), "Japan".to_string(), "South Korea".to_string(), "Thailand".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/jp.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Japan".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "asia".to_string(), "world_cup".to_string()]),

            // Mexico
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Mexico".to_string(), "Italy".to_string(), "Ireland".to_string(), "Hungary".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/mx.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Mexico".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "north_america".to_string(), "world_cup".to_string()]),

            // Morocco
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Tunisia".to_string(), "Morocco".to_string(), "Algeria".to_string(), "Turkey".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ma.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Morocco".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "africa".to_string(), "world_cup".to_string()]),

            // Netherlands
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Netherlands".to_string(), "Luxembourg".to_string(), "France".to_string(), "Russia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/nl.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Netherlands".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Poland
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Poland".to_string(), "Indonesia".to_string(), "Monaco".to_string(), "Austria".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/pl.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Poland".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Portugal
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Spain".to_string(), "Portugal".to_string(), "Morocco".to_string(), "Brazil".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/pt.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Portugal".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Qatar
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Qatar".to_string(), "Bahrain".to_string(), "Kuwait".to_string(), "UAE".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/qa.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Qatar".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "asia".to_string(), "world_cup".to_string()]),

            // Saudi Arabia
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Saudi Arabia".to_string(), "Pakistan".to_string(), "Algeria".to_string(), "Libya".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/sa.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Saudi Arabia".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "asia".to_string(), "world_cup".to_string()]),

            // Senegal
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Mali".to_string(), "Senegal".to_string(), "Guinea".to_string(), "Cameroon".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/sn.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Senegal".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string(), "world_cup".to_string()]),

            // Serbia
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Serbia".to_string(), "Russia".to_string(), "Slovakia".to_string(), "Slovenia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/rs.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Serbia".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // South Korea
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["North Korea".to_string(), "South Korea".to_string(), "Japan".to_string(), "China".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/kr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("South Korea".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string(), "world_cup".to_string()]),

            // Spain
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Spain".to_string(), "Portugal".to_string(), "Morocco".to_string(), "Mexico".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/es.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Spain".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Switzerland
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Austria".to_string(), "Switzerland".to_string(), "Denmark".to_string(), "Turkey".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ch.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Switzerland".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            // Tunisia
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Tunisia".to_string(), "Turkey".to_string(), "Algeria".to_string(), "Morocco".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/tn.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Tunisia".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "africa".to_string(), "world_cup".to_string()]),

            // Uruguay
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Argentina".to_string(), "Uruguay".to_string(), "Paraguay".to_string(), "Greece".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/uy.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Uruguay".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "south_america".to_string(), "world_cup".to_string()]),

            // USA
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Canada".to_string(), "USA".to_string(), "Australia".to_string(), "New Zealand".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/us.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("USA".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "north_america".to_string(), "world_cup".to_string()]),

            // Wales
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Scotland".to_string(), "Wales".to_string(), "England".to_string(), "Ireland".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/gb-wls.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Wales".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "world_cup".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of the United Kingdom?".to_string(),
                    options: Some(vec!["Manchester".to_string(), "London".to_string(), "Birmingham".to_string(), "Liverpool".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("London".to_string()),
            ).with_difficulty(1).with_tags(vec!["capitals".to_string(), "united_kingdom".to_string(), "london".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with stars and stripes?".to_string(),
                    options: Some(vec!["Canada".to_string(), "Australia".to_string(), "United States".to_string(), "New Zealand".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("United States".to_string()),
            ).with_difficulty(1).with_tags(vec!["flags".to_string(), "north_america".to_string(), "usa".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of France?".to_string(),
                    options: Some(vec!["Lyon".to_string(), "Paris".to_string(), "Marseille".to_string(), "Nice".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Paris".to_string()),
            ).with_difficulty(1).with_tags(vec!["capitals".to_string(), "europe".to_string(), "france".to_string()]),

            // === KS2 FLAGS & CAPITALS (More countries and details) ===
            
            // European Capitals - KS2
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Germany?".to_string(),
                    options: Some(vec!["Munich".to_string(), "Hamburg".to_string(), "Berlin".to_string(), "Frankfurt".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Berlin".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "germany".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Italy?".to_string(),
                    options: Some(vec!["Milan".to_string(), "Rome".to_string(), "Naples".to_string(), "Venice".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Rome".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "italy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Spain?".to_string(),
                    options: Some(vec!["Barcelona".to_string(), "Madrid".to_string(), "Seville".to_string(), "Valencia".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Madrid".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "spain".to_string()]),

            // World Capitals - KS2
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Australia?".to_string(),
                    options: Some(vec!["Sydney".to_string(), "Melbourne".to_string(), "Canberra".to_string(), "Perth".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canberra".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "oceania".to_string(), "australia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Canada?".to_string(),
                    options: Some(vec!["Toronto".to_string(), "Vancouver".to_string(), "Ottawa".to_string(), "Montreal".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ottawa".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "north_america".to_string(), "canada".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Japan?".to_string(),
                    options: Some(vec!["Osaka".to_string(), "Tokyo".to_string(), "Kyoto".to_string(), "Hiroshima".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Tokyo".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "asia".to_string(), "japan".to_string()]),

            // Flag Recognition - KS2
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a red maple leaf?".to_string(),
                    options: Some(vec!["United States".to_string(), "Canada".to_string(), "Australia".to_string(), "New Zealand".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Canada".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "north_america".to_string(), "canada".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a Union Jack in the corner?".to_string(),
                    options: Some(vec!["Canada".to_string(), "Australia".to_string(), "South Africa".to_string(), "India".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Australia".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "oceania".to_string(), "australia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with black, red, and yellow horizontal stripes?".to_string(),
                    options: Some(vec!["Belgium".to_string(), "Germany".to_string(), "Netherlands".to_string(), "Austria".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Germany".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "germany".to_string()]),

            // More World Capitals - KS2 Advanced
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Egypt?".to_string(),
                    options: Some(vec!["Alexandria".to_string(), "Cairo".to_string(), "Luxor".to_string(), "Aswan".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Cairo".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "africa".to_string(), "egypt".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of Brazil?".to_string(),
                    options: Some(vec!["Rio de Janeiro".to_string(), "São Paulo".to_string(), "Brasília".to_string(), "Salvador".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Brasília".to_string()),
            ).with_difficulty(4).with_tags(vec!["capitals".to_string(), "south_america".to_string(), "brazil".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital city of India?".to_string(),
                    options: Some(vec!["Mumbai".to_string(), "New Delhi".to_string(), "Kolkata".to_string(), "Chennai".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("New Delhi".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "asia".to_string(), "india".to_string()]),

            // Flag Colors and Patterns - KS2
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with green, white, and red vertical stripes?".to_string(),
                    options: Some(vec!["Ireland".to_string(), "Italy".to_string(), "Hungary".to_string(), "Bulgaria".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Italy".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "italy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country has a flag with a white cross on a red background?".to_string(),
                    options: Some(vec!["Norway".to_string(), "Sweden".to_string(), "Denmark".to_string(), "Finland".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Denmark".to_string()),
            ).with_difficulty(4).with_tags(vec!["flags".to_string(), "europe".to_string(), "denmark".to_string()]),

            // Geography Knowledge - KS2
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which continent is Egypt located in?".to_string(),
                    options: Some(vec!["Asia".to_string(), "Africa".to_string(), "Europe".to_string(), "South America".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Africa".to_string()),
            ).with_difficulty(2).with_tags(vec!["geography".to_string(), "continents".to_string(), "africa".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which continent is Brazil located in?".to_string(),
                    options: Some(vec!["North America".to_string(), "South America".to_string(), "Africa".to_string(), "Asia".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("South America".to_string()),
            ).with_difficulty(2).with_tags(vec!["geography".to_string(), "continents".to_string(), "south_america".to_string()]),

            // === MORE FLAGS & CAPITALS FOR KS2 ===

            // Italy Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Ireland".to_string(), "Italy".to_string(), "Hungary".to_string(), "Bulgaria".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/it.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Italy".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            // Russia Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Slovakia".to_string(), "Slovenia".to_string(), "Russia".to_string(), "Croatia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/ru.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Russia".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "europe".to_string(), "asia".to_string()]),

            // China Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Vietnam".to_string(), "China".to_string(), "North Korea".to_string(), "Mongolia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/cn.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("China".to_string()),
            ).with_difficulty(2).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            // India Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Ireland".to_string(), "India".to_string(), "Italy".to_string(), "Hungary".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/in.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("India".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string()]),

            // Turkey Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Turkey".to_string(), "Tunisia".to_string(), "Pakistan".to_string(), "Algeria".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/tr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Turkey".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "asia".to_string(), "europe".to_string()]),

            // Sweden Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Finland".to_string(), "Denmark".to_string(), "Sweden".to_string(), "Norway".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/se.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Sweden".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "scandinavia".to_string()]),

            // Norway Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Iceland".to_string(), "Finland".to_string(), "Norway".to_string(), "Denmark".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/no.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Norway".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string(), "scandinavia".to_string()]),

            // Greece Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Uruguay".to_string(), "Greece".to_string(), "Israel".to_string(), "Argentina".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/gr.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Greece".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "europe".to_string()]),

            // Egypt Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Syria".to_string(), "Iraq".to_string(), "Egypt".to_string(), "Yemen".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/eg.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Egypt".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "africa".to_string()]),

            // South Africa Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Zimbabwe".to_string(), "South Africa".to_string(), "Kenya".to_string(), "Namibia".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/za.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("South Africa".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "africa".to_string()]),

            // New Zealand Flag
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which country does this flag belong to?".to_string(),
                    options: Some(vec!["Australia".to_string(), "New Zealand".to_string(), "Fiji".to_string(), "Cook Islands".to_string()]),
                    story: None,
                    image_url: Some("https://flagpedia.net/data/flags/w580/nz.png".to_string()),
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("New Zealand".to_string()),
            ).with_difficulty(3).with_tags(vec!["flags".to_string(), "oceania".to_string()]),

            // === MORE CAPITAL CITIES FOR KS2 ===

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of France?".to_string(),
                    options: Some(vec!["Lyon".to_string(), "Marseille".to_string(), "Paris".to_string(), "Nice".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Paris".to_string()),
            ).with_difficulty(1).with_tags(vec!["capitals".to_string(), "europe".to_string(), "france".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Spain?".to_string(),
                    options: Some(vec!["Barcelona".to_string(), "Madrid".to_string(), "Valencia".to_string(), "Seville".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Madrid".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "spain".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Italy?".to_string(),
                    options: Some(vec!["Milan".to_string(), "Venice".to_string(), "Rome".to_string(), "Naples".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Rome".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "italy".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Germany?".to_string(),
                    options: Some(vec!["Munich".to_string(), "Hamburg".to_string(), "Berlin".to_string(), "Frankfurt".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Berlin".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "germany".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of China?".to_string(),
                    options: Some(vec!["Shanghai".to_string(), "Beijing".to_string(), "Hong Kong".to_string(), "Guangzhou".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Beijing".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "asia".to_string(), "china".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Japan?".to_string(),
                    options: Some(vec!["Osaka".to_string(), "Kyoto".to_string(), "Tokyo".to_string(), "Yokohama".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Tokyo".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "asia".to_string(), "japan".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Canada?".to_string(),
                    options: Some(vec!["Toronto".to_string(), "Montreal".to_string(), "Ottawa".to_string(), "Vancouver".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ottawa".to_string()),
            ).with_difficulty(4).with_tags(vec!["capitals".to_string(), "north_america".to_string(), "canada".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Brazil?".to_string(),
                    options: Some(vec!["São Paulo".to_string(), "Rio de Janeiro".to_string(), "Brasília".to_string(), "Salvador".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Brasília".to_string()),
            ).with_difficulty(4).with_tags(vec!["capitals".to_string(), "south_america".to_string(), "brazil".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of India?".to_string(),
                    options: Some(vec!["Mumbai".to_string(), "Kolkata".to_string(), "New Delhi".to_string(), "Bangalore".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("New Delhi".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "asia".to_string(), "india".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Egypt?".to_string(),
                    options: Some(vec!["Alexandria".to_string(), "Cairo".to_string(), "Giza".to_string(), "Luxor".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Cairo".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "africa".to_string(), "egypt".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Russia?".to_string(),
                    options: Some(vec!["St. Petersburg".to_string(), "Moscow".to_string(), "Novosibirsk".to_string(), "Yekaterinburg".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Moscow".to_string()),
            ).with_difficulty(2).with_tags(vec!["capitals".to_string(), "europe".to_string(), "russia".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Greece?".to_string(),
                    options: Some(vec!["Thessaloniki".to_string(), "Athens".to_string(), "Patras".to_string(), "Heraklion".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Athens".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "europe".to_string(), "greece".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Turkey?".to_string(),
                    options: Some(vec!["Istanbul".to_string(), "Ankara".to_string(), "Izmir".to_string(), "Bursa".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Ankara".to_string()),
            ).with_difficulty(4).with_tags(vec!["capitals".to_string(), "asia".to_string(), "europe".to_string(), "turkey".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of Argentina?".to_string(),
                    options: Some(vec!["Córdoba".to_string(), "Buenos Aires".to_string(), "Rosario".to_string(), "Mendoza".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Buenos Aires".to_string()),
            ).with_difficulty(4).with_tags(vec!["capitals".to_string(), "south_america".to_string(), "argentina".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is the capital of South Africa?".to_string(),
                    options: Some(vec!["Johannesburg".to_string(), "Cape Town".to_string(), "Pretoria".to_string(), "Durban".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Pretoria".to_string()),
            ).with_difficulty(5).with_tags(vec!["capitals".to_string(), "africa".to_string(), "south_africa".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed interactive Mathematics content with different question types
    fn seed_interactive_mathematics_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding interactive Mathematics content...");

        let questions = vec![
            // Number ordering - Multiple Choice
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which numbers are in order from smallest to largest?".to_string(),
                    options: Some(vec![
                        "5, 4, 3, 2, 1".to_string(), 
                        "1, 2, 3, 4, 5".to_string(), 
                        "3, 1, 5, 2, 4".to_string(), 
                        "2, 4, 1, 5, 3".to_string()
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("1, 2, 3, 4, 5".to_string()),
            ).with_difficulty(2).with_tags(vec!["ordering".to_string(), "numbers".to_string()]),

            // Hotspot - Identifying shapes
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::Hotspot,
                QuestionContent {
                    text: "Click on all the triangles in the picture.".to_string(),
                    options: None,
                    story: None,
                    image_url: Some("assets/images/mathematics/shapes_collection.svg".to_string()),
                    hotspots: Some(vec![
                        crate::models::Coordinate { x: 150.0, y: 100.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 1".to_string()) },
                        crate::models::Coordinate { x: 350.0, y: 200.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 2".to_string()) },
                        crate::models::Coordinate { x: 250.0, y: 300.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 3".to_string()) },
                    ]),
                    blanks: None,
                    additional_data: None,
                },
                Answer::Coordinates(vec![
                    crate::models::Coordinate { x: 150.0, y: 100.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 1".to_string()) },
                    crate::models::Coordinate { x: 350.0, y: 200.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 2".to_string()) },
                    crate::models::Coordinate { x: 250.0, y: 300.0, width: Some(20.0), height: Some(20.0), label: Some("Triangle 3".to_string()) },
                ]),
            ).with_difficulty(3).with_tags(vec!["shapes".to_string(), "geometry".to_string(), "hotspot".to_string()]),

            // Fill in the blank - Math equations
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "Complete the equation: 7 × _ = 42".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 6,
                        expected_answer: "6".to_string(),
                        case_sensitive: false,
                        accept_alternatives: Some(vec!["six".to_string()]),
                    }]),
                    additional_data: None,
                },
                Answer::Text("6".to_string()),
            ).with_difficulty(3).with_tags(vec!["multiplication".to_string(), "fill_blank".to_string(), "times_tables".to_string()]),

            // Fractions to decimals - Multiple Choice
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 1/2 as a decimal?".to_string(),
                    options: Some(vec!["0.25".to_string(), "0.5".to_string(), "0.75".to_string(), "1.0".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0.5".to_string()),
            ).with_difficulty(3).with_tags(vec!["fractions".to_string(), "decimals".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "What is 3/4 as a decimal?".to_string(),
                    options: Some(vec!["0.25".to_string(), "0.5".to_string(), "0.75".to_string(), "1.5".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("0.75".to_string()),
            ).with_difficulty(4).with_tags(vec!["fractions".to_string(), "decimals".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed interactive Geography content
    fn seed_interactive_geography_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding interactive Geography content...");

        let questions = vec![
            // Hotspot - World map
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::Hotspot,
                QuestionContent {
                    text: "Click on the United Kingdom on the world map.".to_string(),
                    options: None,
                    story: None,
                    image_url: Some("assets/images/geography/world_map.svg".to_string()),
                    hotspots: Some(vec![
                        crate::models::Coordinate { x: 280.0, y: 150.0, width: Some(30.0), height: Some(30.0), label: Some("United Kingdom".to_string()) },
                    ]),
                    blanks: None,
                    additional_data: None,
                },
                Answer::Coordinates(vec![
                    crate::models::Coordinate { x: 280.0, y: 150.0, width: Some(30.0), height: Some(30.0), label: Some("United Kingdom".to_string()) },
                ]),
            ).with_difficulty(3).with_tags(vec!["maps".to_string(), "countries".to_string(), "hotspot".to_string()]),

            // Flag recognition - Multiple Choice (more engaging than matching)
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which ocean separates Europe from North America?".to_string(),
                    options: Some(vec![
                        "Pacific Ocean".to_string(), 
                        "Atlantic Ocean".to_string(), 
                        "Indian Ocean".to_string(), 
                        "Arctic Ocean".to_string()
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Atlantic Ocean".to_string()),
            ).with_difficulty(3).with_tags(vec!["oceans".to_string(), "geography".to_string()]),

            // Fill in the blank - Capital cities
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "The capital of Spain is _____.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 23,
                        expected_answer: "Madrid".to_string(),
                        case_sensitive: false,
                        accept_alternatives: None,
                    }]),
                    additional_data: None,
                },
                Answer::Text("Madrid".to_string()),
            ).with_difficulty(3).with_tags(vec!["capitals".to_string(), "europe".to_string(), "fill_blank".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed interactive English content
    fn seed_interactive_english_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding interactive English content...");

        let questions = vec![
            // Alphabetical order - Multiple Choice
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word comes FIRST in alphabetical order?".to_string(),
                    options: Some(vec!["dog".to_string(), "apple".to_string(), "cat".to_string(), "ball".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("apple".to_string()),
            ).with_difficulty(2).with_tags(vec!["alphabetical_order".to_string(), "vocabulary".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word comes LAST in alphabetical order?".to_string(),
                    options: Some(vec!["dog".to_string(), "apple".to_string(), "cat".to_string(), "ball".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("dog".to_string()),
            ).with_difficulty(2).with_tags(vec!["alphabetical_order".to_string(), "vocabulary".to_string()]),

            // Story Quiz with longer comprehension
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::StoryQuiz,
                QuestionContent {
                    text: "What lesson did Emma learn from her experience?".to_string(),
                    options: Some(vec![
                        "Always listen to your parents".to_string(),
                        "Practice makes perfect".to_string(),
                        "It's okay to make mistakes while learning".to_string(),
                        "Never try new things".to_string()
                    ]),
                    story: Some("Emma was nervous about her first piano recital. She had been practicing for months, but she was worried about making mistakes in front of everyone. When she sat down at the piano, her hands were shaking. She started playing and made a small error in the second measure. Instead of stopping, she took a deep breath and continued. The audience didn't seem to notice, and she finished the piece beautifully. Afterwards, her teacher told her that even professional musicians make small mistakes, and the important thing is to keep going.".to_string()),
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("It's okay to make mistakes while learning".to_string()),
            ).with_difficulty(4).with_tags(vec!["reading_comprehension".to_string(), "life_lessons".to_string(), "story_quiz".to_string()]),

            // Fill in the blank - Grammar
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "The children _____ playing in the garden yesterday.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 13,
                        expected_answer: "were".to_string(),
                        case_sensitive: false,
                        accept_alternatives: None,
                    }]),
                    additional_data: None,
                },
                Answer::Text("were".to_string()),
            ).with_difficulty(3).with_tags(vec!["grammar".to_string(), "past_tense".to_string(), "fill_blank".to_string()]),

            // Fill in the blank - Everyday actions (KS1)
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "We went to the park and ____ a picnic.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 24,
                        expected_answer: "had".to_string(),
                        case_sensitive: false,
                        accept_alternatives: None,
                    }]),
                    additional_data: None,
                },
                Answer::Text("had".to_string()),
            ).with_difficulty(2).with_tags(vec!["everyday_language".to_string(), "fill_blank".to_string(), "ks1".to_string()]),

            // Multiple Choice - Rhyming words (KS1)
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which word rhymes with 'star'?".to_string(),
                    options: Some(vec![
                        "Car".to_string(),
                        "Snow".to_string(),
                        "Book".to_string(),
                        "Tree".to_string(),
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Car".to_string()),
            ).with_difficulty(1).with_tags(vec!["phonics".to_string(), "rhyming".to_string(), "multiple_choice".to_string()]),

            // Story Quiz - Sharing and empathy (KS1)
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::StoryQuiz,
                QuestionContent {
                    text: "Why did Mia give the balloon to her friend?".to_string(),
                    options: Some(vec![
                        "She did not want the balloon anymore".to_string(),
                        "Her friend was feeling sad".to_string(),
                        "She found another toy".to_string(),
                        "The balloon floated away".to_string(),
                    ]),
                    story: Some("Mia found a bright red balloon at the fair. She held it tightly while she walked with her friend Noah. When Mia noticed that Noah looked disappointed about losing his own balloon, she smiled and placed the string in his hand. Noah cheered up immediately, and the two friends enjoyed the rest of the fair together.".to_string()),
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Her friend was feeling sad".to_string()),
            ).with_difficulty(2).with_tags(vec!["reading_comprehension".to_string(), "friendship".to_string(), "story_quiz".to_string()]),

            // Multiple Choice - Semicolon usage (KS2)
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which sentence uses a semicolon correctly?".to_string(),
                    options: Some(vec![
                        "I wanted to go outside; but it was raining.".to_string(),
                        "The sun was shining; we decided to have lunch outside.".to_string(),
                        "We bought apples; and oranges from the market.".to_string(),
                        "She practised the piano; because she had a recital.".to_string(),
                    ]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("The sun was shining; we decided to have lunch outside.".to_string()),
            ).with_difficulty(4).with_tags(vec!["punctuation".to_string(), "semicolons".to_string(), "multiple_choice".to_string()]),

            // Story Quiz - Interpreting informational text (KS2)
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::StoryQuiz,
                QuestionContent {
                    text: "What helped the school garden become successful?".to_string(),
                    options: Some(vec![
                        "Students watered the plants once a week".to_string(),
                        "The class kept a schedule and recorded observations".to_string(),
                        "Teachers bought vegetables from a shop".to_string(),
                        "The garden was planted in winter".to_string(),
                    ]),
                    story: Some("Year 6 decided to start a school garden so they could learn about healthy food. They created a rota to make sure the plants were watered every day and kept a journal to track how each plant grew. Pupils measured the height of the vegetables weekly and noted which plants needed more sunshine. By the end of the term, they harvested enough vegetables to cook a soup for the whole class.".to_string()),
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("The class kept a schedule and recorded observations".to_string()),
            ).with_difficulty(3).with_tags(vec!["reading_comprehension".to_string(), "non_fiction".to_string(), "study_skills".to_string()]),

            // Fill in the blank - Academic vocabulary (KS2)
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "The scientist recorded her results in a detailed _____".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 49,
                        expected_answer: "journal".to_string(),
                        case_sensitive: false,
                        accept_alternatives: Some(vec!["logbook".to_string()]),
                    }]),
                    additional_data: None,
                },
                Answer::Text("journal".to_string()),
            ).with_difficulty(3).with_tags(vec!["vocabulary".to_string(), "academic_language".to_string(), "fill_blank".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Seed interactive Science content
    fn seed_interactive_science_content(&self, subject_id: u32) -> AppResult<()> {
        println!("Seeding interactive Science content...");

        let questions = vec![
            // Hotspot - Human body parts
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::Hotspot,
                QuestionContent {
                    text: "Click on the heart in the human body diagram.".to_string(),
                    options: None,
                    story: None,
                    image_url: Some("assets/images/science/human_body.svg".to_string()),
                    hotspots: Some(vec![
                        crate::models::Coordinate { x: 200.0, y: 180.0, width: Some(40.0), height: Some(40.0), label: Some("Heart".to_string()) },
                    ]),
                    blanks: None,
                    additional_data: None,
                },
                Answer::Coordinates(vec![
                    crate::models::Coordinate { x: 200.0, y: 180.0, width: Some(40.0), height: Some(40.0), label: Some("Heart".to_string()) },
                ]),
            ).with_difficulty(2).with_tags(vec!["human_body".to_string(), "organs".to_string(), "hotspot".to_string()]),

            // Animal classification - Multiple Choice
            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which of these animals is a mammal?".to_string(),
                    options: Some(vec!["Eagle".to_string(), "Robin".to_string(), "Dog".to_string(), "Penguin".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Dog".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "classification".to_string()]),

            Question::new(
                subject_id,
                KeyStage::KS2,
                QuestionType::MultipleChoice,
                QuestionContent {
                    text: "Which of these animals is a bird?".to_string(),
                    options: Some(vec!["Cat".to_string(), "Dog".to_string(), "Robin".to_string(), "Dolphin".to_string()]),
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: None,
                    additional_data: None,
                },
                Answer::Text("Robin".to_string()),
            ).with_difficulty(2).with_tags(vec!["animals".to_string(), "classification".to_string()]),

            // Fill in the blank - Plant parts
            Question::new(
                subject_id,
                KeyStage::KS1,
                QuestionType::FillBlank,
                QuestionContent {
                    text: "Plants absorb water through their _____.".to_string(),
                    options: None,
                    story: None,
                    image_url: None,
                    hotspots: None,
                    blanks: Some(vec![BlankConfig {
                        position: 33,
                        expected_answer: "roots".to_string(),
                        case_sensitive: false,
                        accept_alternatives: None,
                    }]),
                    additional_data: None,
                },
                Answer::Text("roots".to_string()),
            ).with_difficulty(2).with_tags(vec!["plants".to_string(), "biology".to_string(), "fill_blank".to_string()]),
        ];

        for question in questions {
            self.add_question(question)?;
        }

        Ok(())
    }

    /// Check if content has already been seeded
    pub fn is_content_seeded(&self) -> AppResult<bool> {
        let stats = self.get_content_statistics()?;
        Ok(stats.total_questions > 0)
    }

    /// Seed content only if it hasn't been seeded already
    pub fn seed_if_empty(&self) -> AppResult<()> {
        let is_seeded = self.is_content_seeded()?;
        
        if !is_seeded {
            println!("Database is empty, seeding with comprehensive educational content...");
            self.seed_all_content()?;
        } else {
            println!("Content already exists, checking for missing subjects...");
            self.seed_missing_subjects()?;
        }
        
        Ok(())
    }

    /// Seed any missing subjects that weren't in the original database
    pub fn seed_missing_subjects(&self) -> AppResult<()> {
        let subjects = self.get_subjects()?;
        let mut subject_map = HashMap::new();
        for subject in subjects {
            subject_map.insert(subject.name.clone(), subject.id.unwrap());
        }

        // Check if new subjects exist and seed them if missing
        if let Some(&times_tables_id) = subject_map.get("times_tables") {
            let stats = self.get_content_statistics()?;
            let current_count = stats.questions_by_subject.get("times_tables").unwrap_or(&0);
            
            // Force reseed if we have fewer than 28 questions (to include new KS1 questions)
            if *current_count < 144 {
                println!("Reseeding Times Tables content (current: {}, target: 144)...", current_count);
                
                // Delete existing times tables questions first
                self.db_manager.execute(|conn| {
                    conn.execute("DELETE FROM questions WHERE subject_id = ?1", [times_tables_id])?;
                    Ok(())
                })?;
                
                // Reseed with updated content
                self.seed_times_tables_content(times_tables_id)?;
            }
        }

        if let Some(&flags_capitals_id) = subject_map.get("flags_capitals") {
            let stats = self.get_content_statistics()?;
            let current_count = stats.questions_by_subject.get("flags_capitals").unwrap_or(&0);
            
            // Force reseed if we have fewer than 32 questions (World Cup countries)
            if *current_count < 32 {
                println!("Reseeding Flags & Capitals content (current: {}, target: 32+)...", current_count);
                
                // Delete existing flags & capitals questions first
                self.db_manager.execute(|conn| {
                    conn.execute("DELETE FROM questions WHERE subject_id = ?1", [flags_capitals_id])?;
                    Ok(())
                })?;
                
                // Reseed with updated content
                self.seed_flags_capitals_content(flags_capitals_id)?;
            }
        }

        // Check if English content has drag-drop questions (from old version) and remove them
        if let Some(&english_id) = subject_map.get("english") {
            let has_drag_drop = self.db_manager.execute(|conn| {
                let mut stmt = conn.prepare(
                    "SELECT COUNT(*) FROM questions WHERE subject_id = ?1 AND question_type = 'drag_drop'"
                )?;
                let count: u32 = stmt.query_row([english_id], |row| row.get(0))?;
                Ok(count > 0)
            })?;
            
            if has_drag_drop {
                println!("⚠️  Detected old drag-drop questions in English content. Removing and reseeding...");
                
                // Delete all English questions (both new and old format)
                self.db_manager.execute(|conn| {
                    conn.execute("DELETE FROM questions WHERE subject_id = ?1", [english_id])?;
                    Ok(())
                })?;
                
                // Reseed English content with updated questions (no drag-drop)
                self.seed_english_content(english_id)?;
                self.seed_interactive_english_content(english_id)?;
            }
        }

        Ok(())
    }

    // Helper methods
    fn get_subjects(&self) -> AppResult<Vec<crate::models::Subject>> {
        Ok(self.db_manager.execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, name, display_name, icon_path, color_scheme, description FROM subjects ORDER BY name"
            )?;
            
            let subject_iter = stmt.query_map([], |row| {
                Ok(crate::models::Subject {
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

    fn add_question(&self, question: Question) -> AppResult<u32> {
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
            
            tx.execute(
                "INSERT INTO questions (subject_id, key_stage, question_type, content, correct_answer, difficulty_level, tags, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
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
                        AssetType::Image => "image",
                        AssetType::Audio => "audio",
                        AssetType::Animation => "animation",
                    };
                    
                    tx.execute(
                        "INSERT INTO assets (question_id, asset_type, file_path, alt_text, file_size, created_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                        rusqlite::params![
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
            
            let mut questions_by_subject = HashMap::new();
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
}

/// Content statistics structure
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ContentStatistics {
    pub total_questions: u32,
    pub total_subjects: u32,
    pub total_assets: u32,
    pub questions_by_subject: HashMap<String, u32>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::DatabaseService;
    use tempfile::tempdir;

    fn create_test_seeder() -> (ContentSeeder, tempfile::TempDir) {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        let db_service = DatabaseService::new(&db_path).unwrap();
        db_service.initialize().unwrap();
        
        let seeder = ContentSeeder::new(db_service.manager());
        
        (seeder, temp_dir)
    }

    #[test]
    fn test_seed_all_content() {
        let (seeder, _temp_dir) = create_test_seeder();
        
        // Should succeed without errors
        seeder.seed_all_content().unwrap();
        
        // Check that content was added
        let stats = seeder.get_content_statistics().unwrap();
        assert!(stats.total_questions > 0);
        assert_eq!(stats.total_subjects, 5); // Default subjects
        
        // Check that all subjects have questions
        for subject_name in ["mathematics", "geography", "english", "science", "general_knowledge"] {
            assert!(stats.questions_by_subject.get(subject_name).unwrap_or(&0) > &0);
        }
    }

    #[test]
    fn test_seed_if_empty() {
        let (seeder, _temp_dir) = create_test_seeder();
        
        // First call should seed content
        seeder.seed_if_empty().unwrap();
        let stats1 = seeder.get_content_statistics().unwrap();
        assert!(stats1.total_questions > 0);
        
        // Second call should not add more content
        seeder.seed_if_empty().unwrap();
        let stats2 = seeder.get_content_statistics().unwrap();
        assert_eq!(stats1.total_questions, stats2.total_questions);
    }
}
