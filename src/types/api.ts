// TypeScript interfaces matching Rust structs for frontend-backend communication

// ============================================================================
// CORE TYPES
// ============================================================================

export type KeyStage = 'KS1' | 'KS2';

export type QuestionType = 
  | 'multiple_choice'
  | 'drag_drop'
  | 'hotspot'
  | 'fill_blank'
  | 'story_quiz';

export type AssetType = 'image' | 'audio' | 'animation';

export type PerformanceLevel = 
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'NeedsImprovement'
  | 'Poor';

// ============================================================================
// QUESTION TYPES
// ============================================================================

export interface Coordinate {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
}

export interface BlankConfig {
  position: number;
  expected_answer: string;
  case_sensitive: boolean;
  accept_alternatives?: string[];
}

export interface QuestionContent {
  text: string;
  options?: string[];
  story?: string;
  image_url?: string;
  hotspots?: Coordinate[];
  blanks?: BlankConfig[];
  additional_data?: Record<string, any>;
}

export type Answer = 
  | string
  | string[]
  | Coordinate[]
  | Record<string, string>;

export interface Asset {
  id?: number;
  question_id: number;
  asset_type: AssetType;
  file_path: string;
  alt_text?: string;
  file_size?: number;
  created_at?: string;
}

export interface Question {
  id?: number;
  subject_id: number;
  key_stage: KeyStage;
  question_type: QuestionType;
  content: QuestionContent;
  correct_answer: Answer;
  difficulty_level: number;
  tags: string[];
  assets?: Asset[];
  created_at?: string;
}

export interface Subject {
  id?: number;
  name: string;
  display_name: string;
  icon_path?: string;
  color_scheme?: string;
  description?: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface Profile {
  id?: number;
  name: string;
  avatar: string;
  created_at?: string;
  theme_preference: string;
}

export interface CreateProfileRequest {
  name: string;
  avatar: string;
  theme_preference?: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  avatar?: string;
  theme_preference?: string;
}

export interface SubjectProgress {
  subject: string;
  key_stage: string;
  questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  last_activity: string;
}

export interface Progress {
  subject_progress: Record<string, SubjectProgress>;
  total_questions_answered: number;
  total_correct_answers: number;
  achievements: Achievement[];
  streaks: Streak[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: AchievementCategory;
}

export type AchievementCategory = 
  | 'accuracy'
  | 'streak'
  | 'completion'
  | 'time'
  | 'subject_mastery';

export interface Streak {
  streak_type: StreakType;
  current_count: number;
  best_count: number;
  started_at?: string;
  last_updated: string;
}

export type StreakType = 
  | 'daily_activity'
  | 'correct_answers'
  | 'perfect_quizzes';

export interface QuizResult {
  subject: string;
  key_stage: string;
  questions_answered: number;
  correct_answers: number;
  time_spent_seconds: number;
}

// ============================================================================
// QUIZ ENGINE TYPES
// ============================================================================

export interface QuizConfig {
  subject: string;
  key_stage: KeyStage;
  question_count: number;
  difficulty_range?: [number, number];
  time_limit_seconds?: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
}

export interface AnswerResult {
  question_id: number;
  is_correct: boolean;
  points: number;
  correct_answer: Answer;
  explanation?: string;
  time_taken?: number;
}

export interface QuizSession {
  id?: number;
  profile_id: number;
  config: QuizConfig;
  questions: Question[];
  answers: AnswerResult[];
  current_question_index: number;
  started_at: string;
  completed_at?: string;
  total_time_seconds: number;
  is_paused: boolean;
  pause_time?: string;
}

export interface Score {
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  total_points: number;
  time_bonus: number;
  streak_bonus: number;
  final_score: number;
  performance_level: PerformanceLevel;
  achievements: string[];
}

export interface GetQuestionsRequest {
  subject: string;
  key_stage: KeyStage;
  count: number;
  difficulty_range?: [number, number];
}

// ============================================================================
// CONTENT MANAGEMENT TYPES
// ============================================================================

export interface ContentPack {
  version: string;
  name: string;
  description?: string;
  subjects: Subject[];
  questions: ContentPackQuestion[];
  signature?: string;
}

export interface ContentPackQuestion {
  subject_name: string;
  key_stage: KeyStage;
  question_type: QuestionType;
  content: QuestionContent;
  correct_answer: Answer;
  difficulty_level: number;
  tags: string[];
  assets?: Asset[];
}

export interface ContentStatistics {
  total_questions: number;
  total_subjects: number;
  total_assets: number;
  questions_by_subject: Record<string, number>;
}

// ============================================================================
// CUSTOM MIX TYPES
// ============================================================================

export interface CustomMix {
  id?: number;
  name: string;
  created_by: number;
  config: MixConfig;
  created_at?: string;
  updated_at?: string;
}

export interface MixConfig {
  subjects: string[];
  key_stages: KeyStage[];
  question_count: number;
  time_limit?: number;
  difficulty_range: [number, number];
  question_types?: string[];
  randomize_order: boolean;
  show_immediate_feedback: boolean;
  allow_review: boolean;
}

export interface CreateMixRequest {
  name: string;
  created_by: number;
  config: MixConfig;
}

export interface UpdateMixRequest {
  name?: string;
  config?: MixConfig;
}

// ============================================================================
// SECURITY TYPES
// ============================================================================

export interface ParentalChallenge {
  id: string;
  question: string;
  expected_answer: number;
  expires_at: number;
}

export interface QuizProgress {
  session_id: number;
  current_question_index: number;
  total_questions: number;
  answered_questions: number;
  is_completed: boolean;
  time_elapsed: number;
  is_paused: boolean;
}

// ============================================================================
// UPDATE SERVICE TYPES
// ============================================================================

export interface UpdateInfo {
  version: string;
  description: string;
  download_url: string;
  signature: string;
  size: number;
  checksum: string;
  required: boolean;
}

export interface ContentPackage {
  version: string;
  content: number[];
  signature: number[];
  metadata: PackageMetadata;
}

export interface PackageMetadata {
  subjects: string[];
  key_stages: string[];
  question_count: number;
  created_at: string;
  author: string;
}

export interface UpdateConfig {
  repository_urls: string[];
  auto_check: boolean;
  check_interval_hours: number;
  backup_retention_days: number;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string;
  category: string;
  is_recoverable: boolean;
}

// ============================================================================
// TAURI API INTERFACE
// ============================================================================

export interface TauriAPI {
  // Quiz Engine Operations
  getQuestions(request: GetQuestionsRequest): Promise<Question[]>;
  validateAnswer(questionId: number, submittedAnswer: Answer): Promise<AnswerResult>;
  startQuizSession(profileId: number, config: QuizConfig): Promise<QuizSession>;
  submitAnswer(sessionId: number, answer: Answer, timeTookenSeconds: number): Promise<AnswerResult>;
  getCurrentQuestion(sessionId: number): Promise<Question | null>;
  calculateScore(quizSession: QuizSession): Promise<Score>;
  pauseQuiz(sessionId: number): Promise<void>;
  resumeQuiz(sessionId: number): Promise<void>;

  // Profile Management Operations
  createProfile(request: CreateProfileRequest): Promise<Profile>;
  getProfileById(profileId: number): Promise<Profile>;
  getAllProfiles(): Promise<Profile[]>;
  updateProfile(profileId: number, updates: ProfileUpdateRequest): Promise<Profile>;
  deleteProfile(profileId: number): Promise<void>;
  getProgress(profileId: number): Promise<Progress>;
  updateProgress(profileId: number, quizResult: QuizResult): Promise<void>;

  // Content Management Operations
  getSubjects(): Promise<Subject[]>;
  getQuestionsBySubject(
    subjectName: string,
    keyStage?: KeyStage,
    difficultyRange?: [number, number],
    limit?: number
  ): Promise<Question[]>;
  getQuestionById(questionId: number): Promise<Question>;
  addQuestion(question: Question): Promise<number>;
  updateQuestion(questionId: number, question: Question): Promise<void>;
  deleteQuestion(questionId: number): Promise<void>;
  getContentStatistics(): Promise<ContentStatistics>;
  loadContentPack(packPath: string): Promise<void>;
  verifyContentSignature(pack: ContentPack): Promise<boolean>;

  // Content Seeding Operations
  seedAllContent(): Promise<void>;
  isContentSeeded(): Promise<boolean>;
  seedIfEmpty(): Promise<void>;
  getSeederStatistics(): Promise<ContentStatistics>;

  // Custom Mix Operations
  createCustomMix(request: CreateMixRequest): Promise<CustomMix>;
  getCustomMixById(mixId: number): Promise<CustomMix>;
  getAllCustomMixes(): Promise<CustomMix[]>;
  getCustomMixesByProfile(profileId: number): Promise<CustomMix[]>;
  updateCustomMix(mixId: number, updates: UpdateMixRequest): Promise<CustomMix>;
  deleteCustomMix(mixId: number): Promise<void>;
  getAvailableQuestionCount(config: MixConfig): Promise<number>;
  validateMixFeasibility(config: MixConfig): Promise<void>;

  // Security Operations
  validateParentalAccess(challenge: string, input: string): Promise<boolean>;
  generateParentalChallenge(): Promise<ParentalChallenge>;
  validateParentalFeatureAccess(feature: string, sessionToken: string): Promise<boolean>;
  generateParentalSessionToken(): Promise<string>;
  getQuizProgress(sessionId: number): Promise<QuizProgress>;
  verifyUpdateSignature(updateData: Uint8Array, signature: Uint8Array): Promise<boolean>;
  encryptSensitiveData(data: Uint8Array): Promise<Uint8Array>;
  decryptSensitiveData(encryptedData: Uint8Array): Promise<Uint8Array>;
  verifyContentPackage(packageData: Uint8Array, expectedHash: string): Promise<boolean>;

  // Update Service Operations
  checkForUpdates(): Promise<UpdateInfo[]>;
  downloadAndInstallUpdate(updateInfo: UpdateInfo): Promise<void>;
  rollbackToBackup(): Promise<void>;
  getCurrentVersion(): Promise<string>;
  listBackups(): Promise<string[]>;

  // Database Operations (for debugging/monitoring)
  getDatabaseStats(): Promise<string>;
  getDatabaseVersion(): Promise<number>;
}