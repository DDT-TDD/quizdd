import { vi } from 'vitest'
import { 
  Question, 
  Profile, 
  Subject, 
  CustomMix, 
  Progress,
  AnswerResult,
  QuizSession,
  Score,
  Achievement,
  Streak,
  SubjectProgress,
  MixConfig,
  QuizConfig,
  UpdateInfo,
  ParentalChallenge
} from '../types/api'

export const mockQuestion: Question = {
  id: 1,
  subject_id: 1,
  key_stage: 'KS1',
  question_type: 'multiple_choice',
  content: {
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
  },
  correct_answer: '4',
  difficulty_level: 1,
  tags: ['addition', 'basic'],
}

export const mockProfile: Profile = {
  id: 1,
  name: 'Test Child',
  avatar: 'avatar1',
  theme_preference: 'default',
}

export const mockSubjectProgress: SubjectProgress = {
  subject: 'Mathematics',
  key_stage: 'KS1',
  questions_answered: 10,
  correct_answers: 8,
  accuracy_percentage: 80,
  time_spent_seconds: 300,
  last_activity: new Date().toISOString(),
}

export const mockProgress: Progress = {
  subject_progress: {
    Mathematics: mockSubjectProgress,
  },
  total_questions_answered: 10,
  total_correct_answers: 8,
  achievements: [],
  streaks: [],
}

export const mockSubject: Subject = {
  id: 1,
  name: 'Mathematics',
  display_name: 'Mathematics',
  icon_path: '/icons/math.svg',
  color_scheme: 'blue',
}

export const mockMixConfig: MixConfig = {
  subjects: ['Mathematics'],
  key_stages: ['KS1'],
  question_count: 10,
  difficulty_range: [1, 3],
  randomize_order: true,
  show_immediate_feedback: true,
  allow_review: false,
}

export const mockCustomMix: CustomMix = {
  id: 1,
  name: 'Math Practice',
  created_by: 1,
  config: mockMixConfig,
}

export const mockAnswerResult: AnswerResult = {
  question_id: 1,
  is_correct: true,
  points: 1,
  correct_answer: '4',
  explanation: 'Correct! 2 + 2 = 4',
  time_taken: 5,
}

export const mockQuizConfig: QuizConfig = {
  subject: 'Mathematics',
  key_stage: 'KS1',
  question_count: 10,
  difficulty_range: [1, 3],
  time_limit_seconds: 300,
  randomize_questions: true,
  randomize_answers: true,
}

export const mockQuizSession: QuizSession = {
  id: 1,
  profile_id: 1,
  config: mockQuizConfig,
  questions: [mockQuestion],
  answers: [mockAnswerResult],
  current_question_index: 0,
  started_at: new Date().toISOString(),
  total_time_seconds: 0,
  is_paused: false,
}

export const mockScore: Score = {
  total_questions: 10,
  correct_answers: 8,
  accuracy_percentage: 80,
  total_points: 8,
  time_bonus: 2,
  streak_bonus: 1,
  final_score: 11,
  performance_level: 'Good',
  achievements: ['accuracy_80'],
}

export const mockUpdateInfo: UpdateInfo = {
  version: '1.1.0',
  description: 'New content pack with additional questions',
  download_url: 'https://example.com/update.zip',
  signature: 'signature_hash',
  size: 1024000,
  checksum: 'checksum_hash',
  required: false,
}

export const mockParentalChallenge: ParentalChallenge = {
  id: 'challenge_123',
  question: 'What is 7 + 5?',
  expected_answer: 12,
  expires_at: Date.now() + 300000, // 5 minutes from now
}

export const mockTauriInvoke = vi.fn()

// Mock Tauri API functions
export const mockTauriApi = {
  // Quiz Engine Operations
  getQuestions: vi.fn().mockResolvedValue([mockQuestion]),
  validateAnswer: vi.fn().mockResolvedValue(mockAnswerResult),
  startQuizSession: vi.fn().mockResolvedValue(mockQuizSession),
  submitAnswer: vi.fn().mockResolvedValue(mockAnswerResult),
  getCurrentQuestion: vi.fn().mockResolvedValue(mockQuestion),
  calculateScore: vi.fn().mockResolvedValue(mockScore),
  pauseQuiz: vi.fn().mockResolvedValue(undefined),
  resumeQuiz: vi.fn().mockResolvedValue(undefined),

  // Profile Management Operations
  createProfile: vi.fn().mockResolvedValue(mockProfile),
  getProfileById: vi.fn().mockResolvedValue(mockProfile),
  getAllProfiles: vi.fn().mockResolvedValue([mockProfile]),
  updateProfile: vi.fn().mockResolvedValue(mockProfile),
  deleteProfile: vi.fn().mockResolvedValue(undefined),
  getProgress: vi.fn().mockResolvedValue(mockProgress),
  updateProgress: vi.fn().mockResolvedValue(undefined),

  // Content Management Operations
  getSubjects: vi.fn().mockResolvedValue([mockSubject]),
  getQuestionsBySubject: vi.fn().mockResolvedValue([mockQuestion]),
  getQuestionById: vi.fn().mockResolvedValue(mockQuestion),
  addQuestion: vi.fn().mockResolvedValue(1),
  updateQuestion: vi.fn().mockResolvedValue(undefined),
  deleteQuestion: vi.fn().mockResolvedValue(undefined),
  getContentStatistics: vi.fn().mockResolvedValue({
    total_questions: 100,
    total_subjects: 5,
    total_assets: 50,
    questions_by_subject: { Mathematics: 20, English: 25, Science: 30, Geography: 15, 'General Knowledge': 10 }
  }),
  loadContentPack: vi.fn().mockResolvedValue(undefined),
  verifyContentSignature: vi.fn().mockResolvedValue(true),

  // Content Seeding Operations
  seedAllContent: vi.fn().mockResolvedValue(undefined),
  isContentSeeded: vi.fn().mockResolvedValue(true),
  seedIfEmpty: vi.fn().mockResolvedValue(undefined),
  getSeederStatistics: vi.fn().mockResolvedValue({
    total_questions: 100,
    total_subjects: 5,
    total_assets: 50,
    questions_by_subject: { Mathematics: 20, English: 25, Science: 30, Geography: 15, 'General Knowledge': 10 }
  }),

  // Custom Mix Operations
  createCustomMix: vi.fn().mockResolvedValue(mockCustomMix),
  getCustomMixById: vi.fn().mockResolvedValue(mockCustomMix),
  getAllCustomMixes: vi.fn().mockResolvedValue([mockCustomMix]),
  getCustomMixesByProfile: vi.fn().mockResolvedValue([mockCustomMix]),
  updateCustomMix: vi.fn().mockResolvedValue(mockCustomMix),
  deleteCustomMix: vi.fn().mockResolvedValue(undefined),
  getAvailableQuestionCount: vi.fn().mockResolvedValue(50),
  validateMixFeasibility: vi.fn().mockResolvedValue(undefined),

  // Security Operations
  validateParentalAccess: vi.fn().mockResolvedValue(true),
  generateParentalChallenge: vi.fn().mockResolvedValue(mockParentalChallenge),
  validateParentalFeatureAccess: vi.fn().mockResolvedValue(true),
  generateParentalSessionToken: vi.fn().mockResolvedValue('session_token_123'),
  getQuizProgress: vi.fn().mockResolvedValue({
    session_id: 1,
    current_question_index: 0,
    total_questions: 10,
    answered_questions: 0,
    is_completed: false,
    time_elapsed: 0,
    is_paused: false,
  }),
  verifyUpdateSignature: vi.fn().mockResolvedValue(true),
  encryptSensitiveData: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  decryptSensitiveData: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  verifyContentPackage: vi.fn().mockResolvedValue(true),

  // Update Service Operations
  checkForUpdates: vi.fn().mockResolvedValue([mockUpdateInfo]),
  downloadAndInstallUpdate: vi.fn().mockResolvedValue(undefined),
  rollbackToBackup: vi.fn().mockResolvedValue(undefined),
  getCurrentVersion: vi.fn().mockResolvedValue('1.0.0'),
  listBackups: vi.fn().mockResolvedValue(['backup_1.0.0']),

  // Database Operations
  getDatabaseStats: vi.fn().mockResolvedValue('Database: 100 questions, 5 subjects'),
  getDatabaseVersion: vi.fn().mockResolvedValue(1),
}