// Tauri API implementation using invoke functions for frontend-backend communication

import { invoke } from '@tauri-apps/api/core';
import type {
  TauriAPI,
  Question,
  Answer,
  AnswerResult,
  QuizSession,
  QuizConfig,
  Score,
  GetQuestionsRequest,
  Profile,
  CreateProfileRequest,
  ProfileUpdateRequest,
  Progress,
  QuizResult,
  Subject,
  ContentStatistics,
  ContentPack,
  CustomMix,
  CreateMixRequest,
  UpdateMixRequest,
  MixConfig,
  // ParentalChallenge,
  // QuizProgress,
} from '../types/api';

/**
 * Tauri API implementation that bridges frontend and backend communication
 * All methods use Tauri's invoke function to call Rust commands
 */
export class TauriAPIImpl implements TauriAPI {
  
  // ============================================================================
  // QUIZ ENGINE OPERATIONS
  // ============================================================================

  async getQuestions(request: GetQuestionsRequest): Promise<Question[]> {
    try {
      return await invoke('get_questions', { request });
    } catch (error) {
      throw new Error(`Failed to get questions: ${error}`);
    }
  }

  async validateAnswer(questionId: number, submittedAnswer: Answer): Promise<AnswerResult> {
    try {
      return await invoke('validate_answer', { 
        questionId, 
        submittedAnswer 
      });
    } catch (error) {
      throw new Error(`Failed to validate answer: ${error}`);
    }
  }

  async startQuizSession(profileId: number, config: QuizConfig): Promise<QuizSession> {
    try {
      return await invoke('start_quiz_session', { 
        profileId, 
        config 
      });
    } catch (error) {
      throw new Error(`Failed to start quiz session: ${error}`);
    }
  }

  async submitAnswer(sessionId: number, answer: Answer, timeTakenSeconds: number): Promise<AnswerResult> {
    try {
      return await invoke('submit_answer', { 
        sessionId, 
        answer, 
        timeTakenSeconds 
      });
    } catch (error) {
      throw new Error(`Failed to submit answer: ${error}`);
    }
  }

  async getCurrentQuestion(sessionId: number): Promise<Question | null> {
    try {
      return await invoke('get_current_question', { sessionId });
    } catch (error) {
      throw new Error(`Failed to get current question: ${error}`);
    }
  }

  async calculateScore(quizSession: QuizSession): Promise<Score> {
    try {
      return await invoke('calculate_score', { quizSession });
    } catch (error) {
      throw new Error(`Failed to calculate score: ${error}`);
    }
  }

  async pauseQuiz(sessionId: number): Promise<void> {
    try {
      await invoke('pause_quiz', { sessionId });
    } catch (error) {
      throw new Error(`Failed to pause quiz: ${error}`);
    }
  }

  async resumeQuiz(sessionId: number): Promise<void> {
    try {
      await invoke('resume_quiz', { sessionId });
    } catch (error) {
      throw new Error(`Failed to resume quiz: ${error}`);
    }
  }

  // ============================================================================
  // PROFILE MANAGEMENT OPERATIONS
  // ============================================================================

  async createProfile(name: string, avatar: string): Promise<Profile>
  async createProfile(request: CreateProfileRequest): Promise<Profile>
  async createProfile(nameOrRequest: string | CreateProfileRequest, avatar?: string): Promise<Profile> {
    try {
      const request = typeof nameOrRequest === 'string' 
        ? { name: nameOrRequest, avatar: avatar! }
        : nameOrRequest;
      console.log('🔍 Frontend: Calling create_profile with:', request);
      const result = await invoke('create_profile', { request });
      console.log('✅ Frontend: create_profile returned:', result);
      return result;
    } catch (error) {
      console.error('❌ Frontend: create_profile failed:', error);
      throw new Error(`Failed to create profile: ${error}`);
    }
  }

  async getProfileById(profileId: number): Promise<Profile> {
    try {
      return await invoke('get_profile_by_id', { profileId });
    } catch (error) {
      throw new Error(`Failed to get profile: ${error}`);
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      console.log('🔍 Frontend: Calling get_all_profiles...');
      const result = await invoke('get_all_profiles');
      console.log('✅ Frontend: get_all_profiles returned:', result);
      return result;
    } catch (error) {
      console.error('❌ Frontend: get_all_profiles failed:', error);
      throw new Error(`Failed to get all profiles: ${error}`);
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.getProfiles();
  }

  async updateProfile(profileId: number, updates: ProfileUpdateRequest): Promise<Profile> {
    try {
      return await invoke('update_profile', { profileId, updates });
    } catch (error) {
      throw new Error(`Failed to update profile: ${error}`);
    }
  }

  async deleteProfile(profileId: number): Promise<void> {
    try {
      await invoke('delete_profile', { profileId });
    } catch (error) {
      throw new Error(`Failed to delete profile: ${error}`);
    }
  }

  async getProgress(profileId: number): Promise<Progress> {
    try {
      return await invoke('get_progress', { profileId });
    } catch (error) {
      throw new Error(`Failed to get progress: ${error}`);
    }
  }

  async updateProgress(profileId: number, quizResult: QuizResult): Promise<void> {
    try {
      await invoke('update_progress', { profileId, quizResult });
    } catch (error) {
      throw new Error(`Failed to update progress: ${error}`);
    }
  }

  // ============================================================================
  // CONTENT MANAGEMENT OPERATIONS
  // ============================================================================

  async getSubjects(): Promise<Subject[]> {
    try {
      return await invoke('get_subjects');
    } catch (error) {
      throw new Error(`Failed to get subjects: ${error}`);
    }
  }

  async getQuestionsBySubject(
    subjectName: string,
    keyStage?: 'KS1' | 'KS2',
    difficultyRange?: [number, number],
    limit?: number
  ): Promise<Question[]> {
    try {
      return await invoke('get_questions_by_subject', {
        subjectName,
        keyStage,
        difficultyRange,
        limit,
      });
    } catch (error) {
      throw new Error(`Failed to get questions by subject: ${error}`);
    }
  }

  async getQuestionById(questionId: number): Promise<Question> {
    try {
      return await invoke('get_question_by_id', { questionId });
    } catch (error) {
      throw new Error(`Failed to get question by ID: ${error}`);
    }
  }

  async addQuestion(question: Question): Promise<number> {
    try {
      return await invoke('add_question', { question });
    } catch (error) {
      throw new Error(`Failed to add question: ${error}`);
    }
  }

  async updateQuestion(questionId: number, question: Question): Promise<void> {
    try {
      await invoke('update_question', { questionId, question });
    } catch (error) {
      throw new Error(`Failed to update question: ${error}`);
    }
  }

  async deleteQuestion(questionId: number): Promise<void> {
    try {
      await invoke('delete_question', { questionId });
    } catch (error) {
      throw new Error(`Failed to delete question: ${error}`);
    }
  }

  async getContentStatistics(): Promise<ContentStatistics> {
    try {
      return await invoke('get_content_statistics');
    } catch (error) {
      throw new Error(`Failed to get content statistics: ${error}`);
    }
  }

  async loadContentPack(packPath: string): Promise<void> {
    try {
      await invoke('load_content_pack', { packPath });
    } catch (error) {
      throw new Error(`Failed to load content pack: ${error}`);
    }
  }

  async verifyContentSignature(pack: ContentPack): Promise<boolean> {
    try {
      return await invoke('verify_content_signature', { pack });
    } catch (error) {
      throw new Error(`Failed to verify content signature: ${error}`);
    }
  }

  // ============================================================================
  // CONTENT SEEDING OPERATIONS
  // ============================================================================

  async seedAllContent(): Promise<void> {
    try {
      await invoke('seed_all_content');
    } catch (error) {
      throw new Error(`Failed to seed content: ${error}`);
    }
  }

  async isContentSeeded(): Promise<boolean> {
    try {
      return await invoke('is_content_seeded');
    } catch (error) {
      throw new Error(`Failed to check if content is seeded: ${error}`);
    }
  }

  async seedIfEmpty(): Promise<void> {
    try {
      await invoke('seed_if_empty');
    } catch (error) {
      throw new Error(`Failed to seed content if empty: ${error}`);
    }
  }

  async getSeederStatistics(): Promise<ContentStatistics> {
    try {
      return await invoke('get_seeder_statistics');
    } catch (error) {
      throw new Error(`Failed to get seeder statistics: ${error}`);
    }
  }

  // ============================================================================
  // CUSTOM MIX OPERATIONS
  // ============================================================================

  async createCustomMix(request: CreateMixRequest): Promise<CustomMix> {
    try {
      return await invoke('create_custom_mix', { request });
    } catch (error) {
      throw new Error(`Failed to create custom mix: ${error}`);
    }
  }

  async getCustomMixById(mixId: number): Promise<CustomMix> {
    try {
      return await invoke('get_custom_mix_by_id', { mixId });
    } catch (error) {
      throw new Error(`Failed to get custom mix: ${error}`);
    }
  }

  async getAllCustomMixes(): Promise<CustomMix[]> {
    try {
      return await invoke('get_all_custom_mixes');
    } catch (error) {
      throw new Error(`Failed to get all custom mixes: ${error}`);
    }
  }

  async getCustomMixesByProfile(profileId: number): Promise<CustomMix[]> {
    try {
      return await invoke('get_custom_mixes_by_profile', { profileId });
    } catch (error) {
      throw new Error(`Failed to get custom mixes by profile: ${error}`);
    }
  }

  async updateCustomMix(mixId: number, updates: UpdateMixRequest): Promise<CustomMix> {
    try {
      return await invoke('update_custom_mix', { mixId, updates });
    } catch (error) {
      throw new Error(`Failed to update custom mix: ${error}`);
    }
  }

  async deleteCustomMix(mixId: number): Promise<void> {
    try {
      await invoke('delete_custom_mix', { mixId });
    } catch (error) {
      throw new Error(`Failed to delete custom mix: ${error}`);
    }
  }

  async getAvailableQuestionCount(config: MixConfig): Promise<number> {
    try {
      return await invoke('get_available_question_count', { config });
    } catch (error) {
      throw new Error(`Failed to get available question count: ${error}`);
    }
  }

  async validateMixFeasibility(config: MixConfig): Promise<void> {
    try {
      await invoke('validate_mix_feasibility', { config });
    } catch (error) {
      throw new Error(`Failed to validate mix feasibility: ${error}`);
    }
  }

  // ============================================================================
  // SECURITY OPERATIONS
  // ============================================================================

  async validateParentalAccess(challenge: string, input: string): Promise<boolean> {
    try {
      return await invoke('validate_parental_access', { challenge, input });
    } catch (error) {
      throw new Error(`Failed to validate parental access: ${error}`);
    }
  }

  async generateParentalChallenge(): Promise<any> {
    try {
      return await invoke('generate_parental_challenge');
    } catch (error) {
      throw new Error(`Failed to generate parental challenge: ${error}`);
    }
  }

  async validateParentalFeatureAccess(feature: string, sessionToken: string): Promise<boolean> {
    try {
      return await invoke('validate_parental_feature_access', { feature, sessionToken });
    } catch (error) {
      throw new Error(`Failed to validate parental feature access: ${error}`);
    }
  }

  async generateParentalSessionToken(): Promise<string> {
    try {
      return await invoke('generate_parental_session_token');
    } catch (error) {
      throw new Error(`Failed to generate parental session token: ${error}`);
    }
  }

  async getQuizProgress(sessionId: number): Promise<any> {
    try {
      return await invoke('get_quiz_progress', { sessionId });
    } catch (error) {
      throw new Error(`Failed to get quiz progress: ${error}`);
    }
  }

  async verifyUpdateSignature(updateData: Uint8Array, signature: Uint8Array): Promise<boolean> {
    try {
      return await invoke('verify_update_signature', {
        updateData: Array.from(updateData),
        signature: Array.from(signature),
      });
    } catch (error) {
      throw new Error(`Failed to verify update signature: ${error}`);
    }
  }

  async encryptSensitiveData(data: Uint8Array): Promise<Uint8Array> {
    try {
      const result: number[] = await invoke('encrypt_sensitive_data', {
        data: Array.from(data),
      });
      return new Uint8Array(result);
    } catch (error) {
      throw new Error(`Failed to encrypt sensitive data: ${error}`);
    }
  }

  async decryptSensitiveData(encryptedData: Uint8Array): Promise<Uint8Array> {
    try {
      const result: number[] = await invoke('decrypt_sensitive_data', {
        encryptedData: Array.from(encryptedData),
      });
      return new Uint8Array(result);
    } catch (error) {
      throw new Error(`Failed to decrypt sensitive data: ${error}`);
    }
  }

  async verifyContentPackage(packageData: Uint8Array, expectedHash: string): Promise<boolean> {
    try {
      return await invoke('verify_content_package', {
        packageData: Array.from(packageData),
        expectedHash,
      });
    } catch (error) {
      throw new Error(`Failed to verify content package: ${error}`);
    }
  }

  // ============================================================================
  // SETTINGS OPERATIONS
  // ============================================================================

  async saveSettings(settings: any): Promise<void> {
    try {
      await invoke('save_settings', { settings });
    } catch (error) {
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  async loadSettings(): Promise<any> {
    try {
      return await invoke('load_settings');
    } catch (error) {
      throw new Error(`Failed to load settings: ${error}`);
    }
  }

  async resetSettings(): Promise<any> {
    try {
      return await invoke('reset_settings');
    } catch (error) {
      throw new Error(`Failed to reset settings: ${error}`);
    }
  }

  async updateSetting(key: string, value: any): Promise<any> {
    try {
      return await invoke('update_setting', { key, value });
    } catch (error) {
      throw new Error(`Failed to update setting: ${error}`);
    }
  }

  // ============================================================================
  // DATABASE OPERATIONS (for debugging/monitoring)
  // ============================================================================

  async getDatabaseStats(): Promise<string> {
    try {
      return await invoke('get_database_stats');
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error}`);
    }
  }

  async getDatabaseVersion(): Promise<number> {
    try {
      return await invoke('get_database_version');
    } catch (error) {
      throw new Error(`Failed to get database version: ${error}`);
    }
  }

  // ============================================================================
  // UPDATE SERVICE OPERATIONS
  // ============================================================================

  async checkForUpdates(): Promise<any[]> {
    try {
      return await invoke('check_for_updates');
    } catch (error) {
      throw new Error(`Failed to check for updates: ${error}`);
    }
  }

  async downloadAndInstallUpdate(updateInfo: any): Promise<void> {
    try {
      await invoke('download_and_install_update', { updateInfo });
    } catch (error) {
      throw new Error(`Failed to download and install update: ${error}`);
    }
  }

  async rollbackToBackup(): Promise<void> {
    try {
      await invoke('rollback_to_backup');
    } catch (error) {
      throw new Error(`Failed to rollback to backup: ${error}`);
    }
  }

  async getCurrentVersion(): Promise<string> {
    try {
      return await invoke('get_current_version');
    } catch (error) {
      throw new Error(`Failed to get current version: ${error}`);
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      return await invoke('list_backups');
    } catch (error) {
      throw new Error(`Failed to list backups: ${error}`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE AND HELPER FUNCTIONS
// ============================================================================

/**
 * Singleton instance of the Tauri API
 */
export const tauriAPI = new TauriAPIImpl();

/**
 * Helper function to handle API errors consistently
 */
export function handleAPIError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown API error occurred');
}

/**
 * Helper function to create Answer objects with proper typing
 */
export const AnswerHelpers = {
  text: (value: string): Answer => ({ Text: value }),
  multiple: (values: string[]): Answer => ({ Multiple: values }),
  coordinates: (coords: Array<{ x: number; y: number; width?: number; height?: number; label?: string }>): Answer => ({ 
    Coordinates: coords 
  }),
  mapping: (mapping: Record<string, string>): Answer => ({ Mapping: mapping }),
};

/**
 * Helper function to extract text from Answer union type
 */
export function getAnswerText(answer: Answer): string {
  if ('Text' in answer) {
    return answer.Text;
  }
  if ('Multiple' in answer) {
    return answer.Multiple.join(', ');
  }
  if ('Coordinates' in answer) {
    return `${answer.Coordinates.length} coordinate(s)`;
  }
  if ('Mapping' in answer) {
    return Object.entries(answer.Mapping).map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  return 'Unknown answer type';
}

/**
 * Type guard to check if an answer is a text answer
 */
export function isTextAnswer(answer: Answer): answer is { Text: string } {
  return 'Text' in answer;
}

/**
 * Type guard to check if an answer is a multiple choice answer
 */
export function isMultipleAnswer(answer: Answer): answer is { Multiple: string[] } {
  return 'Multiple' in answer;
}

/**
 * Type guard to check if an answer is a coordinates answer
 */
export function isCoordinatesAnswer(answer: Answer): answer is { Coordinates: Array<{ x: number; y: number; width?: number; height?: number; label?: string }> } {
  return 'Coordinates' in answer;
}

/**
 * Type guard to check if an answer is a mapping answer
 */
export function isMappingAnswer(answer: Answer): answer is { Mapping: Record<string, string> } {
  return 'Mapping' in answer;
}

export default tauriAPI;