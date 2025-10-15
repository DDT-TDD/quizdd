use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use super::{Answer, KeyStage};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizSession {
    pub id: Option<u32>,
    pub profile_id: u32,
    pub mix_id: Option<u32>,
    pub subject_filter: Option<Vec<String>>,
    pub key_stage_filter: Option<Vec<KeyStage>>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub total_questions: u32,
    pub correct_answers: u32,
    pub time_spent: u32, // in seconds
    pub session_data: Option<SessionData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub question_order: Vec<u32>, // question IDs in order presented
    pub current_question_index: usize,
    pub time_per_question: HashMap<u32, u32>, // question_id -> time_spent
    pub user_answers: HashMap<u32, Answer>, // question_id -> user_answer
    pub feedback_shown: HashMap<u32, bool>, // question_id -> feedback_shown
    pub paused_at: Option<DateTime<Utc>>,
    pub pause_duration: u32, // total pause time in seconds
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestionAttempt {
    pub id: Option<u32>,
    pub session_id: u32,
    pub question_id: u32,
    pub user_answer: Answer,
    pub is_correct: bool,
    pub time_taken: Option<u32>, // in seconds
    pub attempt_order: u32,
    pub attempted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizResult {
    pub session: QuizSession,
    pub attempts: Vec<QuestionAttempt>,
    pub score_percentage: f64,
    pub time_per_question_avg: f64,
    pub accuracy_by_subject: HashMap<String, f64>,
    pub accuracy_by_difficulty: HashMap<u8, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartQuizRequest {
    pub profile_id: u32,
    pub mix_id: Option<u32>,
    pub subject_filter: Option<Vec<String>>,
    pub key_stage_filter: Option<Vec<KeyStage>>,
    pub question_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmitAnswerRequest {
    pub session_id: u32,
    pub question_id: u32,
    pub user_answer: Answer,
    pub time_taken: Option<u32>,
}

impl QuizSession {
    pub fn new(
        profile_id: u32,
        total_questions: u32,
        mix_id: Option<u32>,
        subject_filter: Option<Vec<String>>,
        key_stage_filter: Option<Vec<KeyStage>>,
    ) -> Self {
        Self {
            id: None,
            profile_id,
            mix_id,
            subject_filter,
            key_stage_filter,
            started_at: None,
            completed_at: None,
            total_questions,
            correct_answers: 0,
            time_spent: 0,
            session_data: Some(SessionData::new()),
        }
    }

    pub fn is_completed(&self) -> bool {
        self.completed_at.is_some()
    }

    pub fn score_percentage(&self) -> f64 {
        if self.total_questions == 0 {
            0.0
        } else {
            (self.correct_answers as f64 / self.total_questions as f64) * 100.0
        }
    }

    pub fn complete(&mut self) {
        self.completed_at = Some(Utc::now());
    }
}

impl SessionData {
    pub fn new() -> Self {
        Self {
            question_order: Vec::new(),
            current_question_index: 0,
            time_per_question: HashMap::new(),
            user_answers: HashMap::new(),
            feedback_shown: HashMap::new(),
            paused_at: None,
            pause_duration: 0,
        }
    }

    pub fn set_question_order(&mut self, question_ids: Vec<u32>) {
        self.question_order = question_ids;
        self.current_question_index = 0;
    }

    pub fn current_question_id(&self) -> Option<u32> {
        self.question_order.get(self.current_question_index).copied()
    }

    pub fn next_question(&mut self) -> Option<u32> {
        if self.current_question_index + 1 < self.question_order.len() {
            self.current_question_index += 1;
            self.current_question_id()
        } else {
            None
        }
    }

    pub fn record_answer(&mut self, question_id: u32, answer: Answer, time_taken: u32) {
        self.user_answers.insert(question_id, answer);
        self.time_per_question.insert(question_id, time_taken);
    }

    pub fn pause(&mut self) {
        self.paused_at = Some(Utc::now());
    }

    pub fn resume(&mut self) {
        if let Some(paused_at) = self.paused_at.take() {
            let pause_duration = Utc::now().signed_duration_since(paused_at);
            self.pause_duration += pause_duration.num_seconds() as u32;
        }
    }
}

impl QuestionAttempt {
    pub fn new(
        session_id: u32,
        question_id: u32,
        user_answer: Answer,
        is_correct: bool,
        attempt_order: u32,
    ) -> Self {
        Self {
            id: None,
            session_id,
            question_id,
            user_answer,
            is_correct,
            time_taken: None,
            attempt_order,
            attempted_at: None,
        }
    }

    pub fn with_time(mut self, time_taken: u32) -> Self {
        self.time_taken = Some(time_taken);
        self
    }
}