use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use super::KeyStage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Progress {
    pub subject_progress: HashMap<String, SubjectProgress>,
    pub total_questions_answered: u32,
    pub total_correct_answers: u32,
    pub achievements: Vec<Achievement>,
    pub streaks: Vec<Streak>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectProgress {
    pub subject: String,
    pub key_stage: String,
    pub questions_answered: u32,
    pub correct_answers: u32,
    pub accuracy_percentage: u8,
    pub time_spent_seconds: u32,
    pub last_activity: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressRecord {
    pub id: Option<u32>,
    pub profile_id: u32,
    pub subject: String,
    pub key_stage: KeyStage,
    pub questions_answered: u32,
    pub correct_answers: u32,
    pub total_time_spent: u32, // in seconds
    pub last_activity: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressSummary {
    pub profile_id: u32,
    pub subject_progress: HashMap<String, SubjectProgress>,
    pub total_questions_answered: u32,
    pub total_correct_answers: u32,
    pub overall_accuracy: f64,
    pub achievements: Vec<Achievement>,
    pub streaks: Vec<Streak>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyStageProgress {
    pub key_stage: KeyStage,
    pub questions_answered: u32,
    pub correct_answers: u32,
    pub accuracy: f64,
    pub time_spent: u32,
    pub difficulty_breakdown: HashMap<u8, DifficultyProgress>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DifficultyProgress {
    pub difficulty_level: u8,
    pub questions_answered: u32,
    pub correct_answers: u32,
    pub accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub earned_at: DateTime<Utc>,
    pub category: AchievementCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AchievementCategory {
    #[serde(rename = "accuracy")]
    Accuracy,
    #[serde(rename = "streak")]
    Streak,
    #[serde(rename = "completion")]
    Completion,
    #[serde(rename = "time")]
    Time,
    #[serde(rename = "subject_mastery")]
    SubjectMastery,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Streak {
    pub streak_type: StreakType,
    pub current_count: u32,
    pub best_count: u32,
    pub started_at: Option<DateTime<Utc>>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StreakType {
    #[serde(rename = "daily_activity")]
    DailyActivity,
    #[serde(rename = "correct_answers")]
    CorrectAnswers,
    #[serde(rename = "perfect_quizzes")]
    PerfectQuizzes,
}

impl Progress {
    pub fn new() -> Self {
        Self {
            subject_progress: HashMap::new(),
            total_questions_answered: 0,
            total_correct_answers: 0,
            achievements: Vec::new(),
            streaks: Vec::new(),
        }
    }
}

impl ProgressRecord {
    pub fn new(profile_id: u32, subject: String, key_stage: KeyStage) -> Self {
        Self {
            id: None,
            profile_id,
            subject,
            key_stage,
            questions_answered: 0,
            correct_answers: 0,
            total_time_spent: 0,
            last_activity: None,
        }
    }

    pub fn accuracy(&self) -> f64 {
        if self.questions_answered == 0 {
            0.0
        } else {
            (self.correct_answers as f64 / self.questions_answered as f64) * 100.0
        }
    }

    pub fn update_with_result(&mut self, correct: bool, time_spent: u32) {
        self.questions_answered += 1;
        if correct {
            self.correct_answers += 1;
        }
        self.total_time_spent += time_spent;
        self.last_activity = Some(Utc::now());
    }
}