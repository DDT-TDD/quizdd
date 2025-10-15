use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: Option<u32>,
    pub name: String,
    pub avatar: String,
    pub created_at: Option<DateTime<Utc>>,
    pub theme_preference: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProfileRequest {
    pub name: String,
    pub avatar: String,
    pub theme_preference: Option<String>,
}

impl Profile {
    pub fn new(name: String, avatar: String) -> Self {
        Self {
            id: None,
            name,
            avatar,
            created_at: None,
            theme_preference: "default".to_string(),
        }
    }

    pub fn with_theme(name: String, avatar: String, theme: String) -> Self {
        Self {
            id: None,
            name,
            avatar,
            created_at: None,
            theme_preference: theme,
        }
    }
}