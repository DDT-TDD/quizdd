use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use super::KeyStage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomMix {
    pub id: Option<u32>,
    pub name: String,
    pub created_by: u32,
    pub config: MixConfig,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MixConfig {
    pub subjects: Vec<String>,
    pub key_stages: Vec<KeyStage>,
    pub question_count: u32,
    pub time_limit: Option<u32>, // in seconds
    pub difficulty_range: (u8, u8), // min, max difficulty (1-5)
    pub question_types: Option<Vec<String>>, // filter by question types
    pub randomize_order: bool,
    pub show_immediate_feedback: bool,
    pub allow_review: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMixRequest {
    pub name: String,
    pub created_by: u32,
    pub config: MixConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateMixRequest {
    pub name: Option<String>,
    pub config: Option<MixConfig>,
}

impl CustomMix {
    pub fn new(name: String, created_by: u32, config: MixConfig) -> Self {
        Self {
            id: None,
            name,
            created_by,
            config,
            created_at: None,
            updated_at: None,
        }
    }
}

impl MixConfig {
    pub fn new(subjects: Vec<String>, key_stages: Vec<KeyStage>, question_count: u32) -> Self {
        Self {
            subjects,
            key_stages,
            question_count,
            time_limit: None,
            difficulty_range: (1, 5),
            question_types: None,
            randomize_order: true,
            show_immediate_feedback: true,
            allow_review: true,
        }
    }

    pub fn with_time_limit(mut self, seconds: u32) -> Self {
        self.time_limit = Some(seconds);
        self
    }

    pub fn with_difficulty_range(mut self, min: u8, max: u8) -> Self {
        self.difficulty_range = (min.clamp(1, 5), max.clamp(1, 5));
        self
    }

    pub fn with_question_types(mut self, types: Vec<String>) -> Self {
        self.question_types = Some(types);
        self
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.subjects.is_empty() {
            return Err("At least one subject must be selected".to_string());
        }

        if self.key_stages.is_empty() {
            return Err("At least one key stage must be selected".to_string());
        }

        if self.question_count == 0 {
            return Err("Question count must be greater than 0".to_string());
        }

        if self.question_count > 100 {
            return Err("Question count cannot exceed 100".to_string());
        }

        if self.difficulty_range.0 > self.difficulty_range.1 {
            return Err("Minimum difficulty cannot be greater than maximum difficulty".to_string());
        }

        if let Some(time_limit) = self.time_limit {
            if time_limit < 60 {
                return Err("Time limit must be at least 60 seconds".to_string());
            }
            if time_limit > 3600 {
                return Err("Time limit cannot exceed 1 hour".to_string());
            }
        }

        Ok(())
    }
}