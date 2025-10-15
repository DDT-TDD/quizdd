use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum KeyStage {
    KS1,
    KS2,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum QuestionType {
    #[serde(rename = "multiple_choice")]
    MultipleChoice,
    #[serde(rename = "drag_drop")]
    DragDrop,
    #[serde(rename = "hotspot")]
    Hotspot,
    #[serde(rename = "fill_blank")]
    FillBlank,
    #[serde(rename = "story_quiz")]
    StoryQuiz,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: Option<u32>,
    pub subject_id: u32,
    pub key_stage: KeyStage,
    pub question_type: QuestionType,
    pub content: QuestionContent,
    pub correct_answer: Answer,
    pub difficulty_level: u8,
    pub tags: Vec<String>,
    pub assets: Option<Vec<Asset>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestionContent {
    pub text: String,
    pub options: Option<Vec<String>>,
    pub story: Option<String>,
    pub image_url: Option<String>,
    pub hotspots: Option<Vec<Coordinate>>,
    pub blanks: Option<Vec<BlankConfig>>,
    pub additional_data: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coordinate {
    pub x: f64,
    pub y: f64,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlankConfig {
    pub position: usize,
    pub expected_answer: String,
    pub case_sensitive: bool,
    pub accept_alternatives: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Answer {
    Text(String),
    Multiple(Vec<String>),
    Coordinates(Vec<Coordinate>),
    Mapping(HashMap<String, String>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: Option<u32>,
    pub question_id: u32,
    pub asset_type: AssetType,
    pub file_path: String,
    pub alt_text: Option<String>,
    pub file_size: Option<u64>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AssetType {
    #[serde(rename = "image")]
    Image,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "animation")]
    Animation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    pub id: Option<u32>,
    pub name: String,
    pub display_name: String,
    pub icon_path: Option<String>,
    pub color_scheme: Option<String>,
    pub description: Option<String>,
}

impl Question {
    pub fn new(
        subject_id: u32,
        key_stage: KeyStage,
        question_type: QuestionType,
        content: QuestionContent,
        correct_answer: Answer,
    ) -> Self {
        Self {
            id: None,
            subject_id,
            key_stage,
            question_type,
            content,
            correct_answer,
            difficulty_level: 1,
            tags: Vec::new(),
            assets: None,
            created_at: None,
        }
    }

    pub fn with_difficulty(mut self, level: u8) -> Self {
        self.difficulty_level = level.clamp(1, 5);
        self
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }
}