-- Educational Quiz App Database Schema
-- SQLite database for storing user profiles, progress, content, and quiz data

-- User profiles and authentication
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    theme_preference TEXT DEFAULT 'default'
);

-- User progress tracking per subject and key stage
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    key_stage TEXT NOT NULL,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, subject, key_stage)
);

-- Subject definitions and metadata
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    icon_path TEXT,
    color_scheme TEXT,
    description TEXT
);

-- Question content and metadata
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    key_stage TEXT NOT NULL CHECK (key_stage IN ('KS1', 'KS2')),
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'drag_drop', 'hotspot', 'fill_blank', 'story_quiz')),
    content TEXT NOT NULL, -- JSON blob containing question data
    correct_answer TEXT NOT NULL, -- JSON blob containing correct answer data
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assets associated with questions (images, audio, etc.)
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'audio', 'animation')),
    file_path TEXT NOT NULL,
    alt_text TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Custom quiz mixes created by parents
CREATE TABLE IF NOT EXISTS custom_mixes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    config TEXT NOT NULL, -- JSON configuration containing subjects, key stages, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quiz session tracking and results
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mix_id INTEGER REFERENCES custom_mixes(id) ON DELETE SET NULL,
    subject_filter TEXT, -- JSON array of subjects if not using a mix
    key_stage_filter TEXT, -- JSON array of key stages if not using a mix
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    session_data TEXT -- JSON blob for additional session metadata
);

-- Individual question attempts within quiz sessions
CREATE TABLE IF NOT EXISTS question_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL, -- JSON blob containing user's answer
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER, -- in seconds
    attempt_order INTEGER NOT NULL, -- order within the session
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table for tracking user accomplishments
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('accuracy', 'streak', 'completion', 'time', 'subject_mastery')),
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, achievement_id)
);

-- Indexes for performance optimization - ENHANCED FOR SPEED
CREATE INDEX IF NOT EXISTS idx_progress_profile_subject ON progress(profile_id, subject, key_stage);
CREATE INDEX IF NOT EXISTS idx_questions_subject_stage ON questions(subject_id, key_stage);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_profile ON quiz_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_session ON question_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_assets_question ON assets(question_id);
CREATE INDEX IF NOT EXISTS idx_achievements_profile ON achievements(profile_id);

-- PERFORMANCE OPTIMIZATION: Additional composite indexes for fast question retrieval
CREATE INDEX IF NOT EXISTS idx_questions_composite_fast ON questions(subject_id, key_stage, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_type_difficulty ON questions(question_type, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- PERFORMANCE OPTIMIZATION: Indexes for quiz session queries
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed ON quiz_sessions(profile_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_recent ON quiz_sessions(started_at DESC);

-- PERFORMANCE OPTIMIZATION: Indexes for progress tracking
CREATE INDEX IF NOT EXISTS idx_progress_last_activity ON progress(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_progress_performance ON progress(profile_id, correct_answers, questions_answered);

-- PERFORMANCE OPTIMIZATION: Indexes for question attempts analysis
CREATE INDEX IF NOT EXISTS idx_question_attempts_performance ON question_attempts(question_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_question_attempts_timing ON question_attempts(session_id, attempt_order);

-- PERFORMANCE OPTIMIZATION: Subject name lookup optimization
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- PERFORMANCE OPTIMIZATION: Achievement category lookup
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category, earned_at DESC);

-- Insert default subjects
INSERT OR IGNORE INTO subjects (name, display_name, icon_path, color_scheme, description) VALUES
('mathematics', 'Mathematics', 'icons/math.svg', '#4CAF50', 'Numbers, arithmetic, shapes, and problem solving'),
('geography', 'Geography', 'icons/geography.svg', '#2196F3', 'World knowledge, flags, maps, and places'),
('english', 'English', 'icons/english.svg', '#FF9800', 'Spelling, vocabulary, grammar, and reading'),
('science', 'Science', 'icons/science.svg', '#9C27B0', 'Plants, animals, human body, and natural world'),
('general_knowledge', 'General Knowledge', 'icons/general.svg', '#F44336', 'History, culture, and interesting facts'),
('times_tables', 'Times Tables', 'icons/times-tables.svg', '#E91E63', 'Multiplication tables and mental arithmetic practice'),
('flags_capitals', 'Flags & Capitals', 'icons/flags.svg', '#00BCD4', 'World flags, capital cities, and country knowledge');