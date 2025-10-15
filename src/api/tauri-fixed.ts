// Fixed Tauri API implementation using window.__TAURI_INVOKE__ directly
// This bypasses the broken @tauri-apps/api/core import issue

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
} from '../types/api';

// Declare the global Tauri invoke function
declare global {
  interface Window {
    __TAURI_INVOKE__: (command: string, args?: any) => Promise<any>;
  }
}

/**
 * Get the Tauri invoke function, with fallback handling
 */
function getInvokeFunction(): (command: string, args?: any) => Promise<any> {
  // First try the direct window.__TAURI_INVOKE__
  if (typeof window !== 'undefined' && window.__TAURI_INVOKE__) {
    console.log('🔍 Using window.__TAURI_INVOKE__ for API calls');
    return window.__TAURI_INVOKE__;
  }
  
  // Fallback: try to import the API (this will likely fail but worth trying)
  console.warn('⚠️ window.__TAURI_INVOKE__ not available, API calls will fail');
  throw new Error('Tauri invoke function not available');
}

/**
 * Fixed Tauri API implementation that works around the import issues
 */
export class FixedTauriAPIImpl implements TauriAPI {
  private invoke: (command: string, args?: any) => Promise<any>;
  
  constructor() {
    this.invoke = getInvokeFunction();
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
      const result = await this.invoke('create_profile', { request });
      console.log('✅ Frontend: create_profile returned:', result);
      return result;
    } catch (error) {
      console.error('❌ Frontend: create_profile failed:', error);
      throw new Error(`Failed to create profile: ${error}`);
    }
  }

  async getProfileById(profileId: number): Promise<Profile> {
    try {
      return await this.invoke('get_profile_by_id', { profileId });
    } catch (error) {
      throw new Error(`Failed to get profile: ${error}`);
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      console.log('🔍 Frontend: Calling get_all_profiles...');
      const result = await this.invoke('get_all_profiles');
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
      return await this.invoke('update_profile', { profileId, updates });
    } catch (error) {
      throw new Error(`Failed to update profile: ${error}`);
    }
  }

  async deleteProfile(profileId: number): Promise<void> {
    try {
      await this.invoke('delete_profile', { profileId });
    } catch (error) {
      throw new Error(`Failed to delete profile: ${error}`);
    }
  }

  async getProgress(profileId: number): Promise<Progress> {
    try {
      return await this.invoke('get_progress', { profileId });
    } catch (error) {
      throw new Error(`Failed to get progress: ${error}`);
    }
  }

  async updateProgress(profileId: number, quizResult: QuizResult): Promise<void> {
    try {
      await this.invoke('update_progress', { profileId, quizResult });
    } catch (error) {
      throw new Error(`Failed to update progress: ${error}`);
    }
  }

  // ============================================================================
  // QUIZ ENGINE OPERATIONS
  // ============================================================================

  async getQuestions(request: GetQuestionsRequest): Promise<Question[]> {
    try {
      return await this.invoke('get_questions', { request });
    } catch (error) {
      throw new Error(`Failed to get questions: ${error}`);
    }
  }

  async validateAnswer(questionId: number, submittedAnswer: Answer): Promise<AnswerResult> {
    try {
      return await this.invoke('validate_answer', { 
        questionId, 
        submittedAnswer 
      });
    } catch (error) {
      throw new Error(`Failed to validate answer: ${error}`);
    }
  }

  async startQuizSession(profileId: number, config: QuizConfig): Promise<QuizSession> {
    try {
      return await this.invoke('start_quiz_session', { 
        profileId, 
        config 
      });
    } catch (error) {
      throw new Error(`Failed to start quiz session: ${error}`);
    }
  }

  async submitAnswer(sessionId: number, answer: Answer, timeTakenSeconds: number): Promise<AnswerResult> {
    try {
      return await this.invoke('submit_answer', { 
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
      return await this.invoke('get_current_question', { sessionId });
    } catch (error) {
      throw new Error(`Failed to get current question: ${error}`);
    }
  }

  async calculateScore(quizSession: QuizSession): Promise<Score> {
    try {
      return await this.invoke('calculate_score', { quizSession });
    } catch (error) {
      throw new Error(`Failed to calculate score: ${error}`);
    }
  }

  async pauseQuiz(sessionId: number): Promise<void> {
    try {
      await this.invoke('pause_quiz', { sessionId });
    } catch (error) {
      throw new Error(`Failed to pause quiz: ${error}`);
    }
  }

  async resumeQuiz(sessionId: number): Promise<void> {
    try {
      await this.invoke('resume_quiz', { sessionId });
    } catch (error) {
      throw new Error(`Failed to resume quiz: ${error}`);
    }
  }

  // ============================================================================
  // CONTENT MANAGEMENT OPERATIONS
  // ============================================================================

  async getSubjects(): Promise<Subject[]> {
    try {
      return await this.invoke('get_subjects');
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
      return await this.invoke('get_questions_by_subject', {
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
      return await this.invoke('get_question_by_id', { questionId });
    } catch (error) {
      throw new Error(`Failed to get question by ID: ${error}`);
    }
  }

  async addQuestion(question: Question): Promise<number> {
    try {
      return await this.invoke('add_question', { question });
    } catch (error) {
      throw new Error(`Failed to add question: ${error}`);
    }
  }

  async updateQuestion(questionId: number, question: Question): Promise<void> {
    try {
      await this.invoke('update_question', { questionId, question });
    } catch (error) {
      throw new Error(`Failed to update question: ${error}`);
    }
  }

  async deleteQuestion(questionId: number): Promise<void> {
    try {
      await this.invoke('delete_question', { questionId });
    } catch (error) {
      throw new Error(`Failed to delete question: ${error}`);
    }
  }

  async getContentStatistics(): Promise<ContentStatistics> {
    try {
      return await this.invoke('get_content_statistics');
    } catch (error) {
      throw new Error(`Failed to get content statistics: ${error}`);
    }
  }

  async loadContentPack(packPath: string): Promise<void> {
    try {
      await this.invoke('load_content_pack', { packPath });
    } catch (error) {
      throw new Error(`Failed to load content pack: ${error}`);
    }
  }

  async verifyContentSignature(pack: ContentPack): Promise<boolean> {
    try {
      return await this.invoke('verify_content_signature', { pack });
    } catch (error) {
      throw new Error(`Failed to verify content signature: ${error}`);
    }
  }

  // ============================================================================
  // CONTENT SEEDING OPERATIONS
  // ============================================================================

  async seedAllContent(): Promise<void> {
    try {
      await this.invoke('seed_all_content');
    } catch (error) {
      throw new Error(`Failed to seed content: ${error}`);
    }
  }

  async isContentSeeded(): Promise<boolean> {
    try {
      return await this.invoke('is_content_seeded');
    } catch (error) {
      throw new Error(`Failed to check if content is seeded: ${error}`);
    }
  }

  async resetAndReseedDatabase(): Promise<void> {
    try {
      await this.invoke('reset_and_reseed_database');
    } catch (error) {
      throw new Error(`Failed to reset and reseed database: ${error}`);
    }
  }

  async seedIfEmpty(): Promise<void> {
    try {
      await this.invoke('seed_if_empty');
    } catch (error) {
      throw new Error(`Failed to seed content if empty: ${error}`);
    }
  }

  async getSeederStatistics(): Promise<ContentStatistics> {
    try {
      return await this.invoke('get_seeder_statistics');
    } catch (error) {
      throw new Error(`Failed to get seeder statistics: ${error}`);
    }
  }

  // ============================================================================
  // CUSTOM MIX OPERATIONS
  // ============================================================================

  async createCustomMix(request: CreateMixRequest): Promise<CustomMix> {
    try {
      return await this.invoke('create_custom_mix', { request });
    } catch (error) {
      throw new Error(`Failed to create custom mix: ${error}`);
    }
  }

  async getCustomMixById(mixId: number): Promise<CustomMix> {
    try {
      return await this.invoke('get_custom_mix_by_id', { mixId });
    } catch (error) {
      throw new Error(`Failed to get custom mix: ${error}`);
    }
  }

  async getAllCustomMixes(): Promise<CustomMix[]> {
    try {
      return await this.invoke('get_all_custom_mixes');
    } catch (error) {
      throw new Error(`Failed to get all custom mixes: ${error}`);
    }
  }

  async getCustomMixesByProfile(profileId: number): Promise<CustomMix[]> {
    try {
      return await this.invoke('get_custom_mixes_by_profile', { profileId });
    } catch (error) {
      throw new Error(`Failed to get custom mixes by profile: ${error}`);
    }
  }

  async updateCustomMix(mixId: number, updates: UpdateMixRequest): Promise<CustomMix> {
    try {
      return await this.invoke('update_custom_mix', { mixId, updates });
    } catch (error) {
      throw new Error(`Failed to update custom mix: ${error}`);
    }
  }

  async deleteCustomMix(mixId: number): Promise<void> {
    try {
      await this.invoke('delete_custom_mix', { mixId });
    } catch (error) {
      throw new Error(`Failed to delete custom mix: ${error}`);
    }
  }

  async getAvailableQuestionCount(config: MixConfig): Promise<number> {
    try {
      return await this.invoke('get_available_question_count', { config });
    } catch (error) {
      throw new Error(`Failed to get available question count: ${error}`);
    }
  }

  async validateMixFeasibility(config: MixConfig): Promise<void> {
    try {
      await this.invoke('validate_mix_feasibility', { config });
    } catch (error) {
      throw new Error(`Failed to validate mix feasibility: ${error}`);
    }
  }

  // ============================================================================
  // SECURITY OPERATIONS
  // ============================================================================

  async validateParentalAccess(challenge: string, input: string): Promise<boolean> {
    try {
      return await this.invoke('validate_parental_access', { challenge, input });
    } catch (error) {
      throw new Error(`Failed to validate parental access: ${error}`);
    }
  }

  async generateParentalChallenge(): Promise<any> {
    try {
      return await this.invoke('generate_parental_challenge');
    } catch (error) {
      throw new Error(`Failed to generate parental challenge: ${error}`);
    }
  }

  async validateParentalFeatureAccess(feature: string, sessionToken: string): Promise<boolean> {
    try {
      return await this.invoke('validate_parental_feature_access', { feature, sessionToken });
    } catch (error) {
      throw new Error(`Failed to validate parental feature access: ${error}`);
    }
  }

  async generateParentalSessionToken(): Promise<string> {
    try {
      return await this.invoke('generate_parental_session_token');
    } catch (error) {
      throw new Error(`Failed to generate parental session token: ${error}`);
    }
  }

  async getQuizProgress(sessionId: number): Promise<any> {
    try {
      return await this.invoke('get_quiz_progress', { sessionId });
    } catch (error) {
      throw new Error(`Failed to get quiz progress: ${error}`);
    }
  }

  async verifyUpdateSignature(updateData: Uint8Array, signature: Uint8Array): Promise<boolean> {
    try {
      return await this.invoke('verify_update_signature', {
        updateData: Array.from(updateData),
        signature: Array.from(signature),
      });
    } catch (error) {
      throw new Error(`Failed to verify update signature: ${error}`);
    }
  }

  async encryptSensitiveData(data: Uint8Array): Promise<Uint8Array> {
    try {
      const result: number[] = await this.invoke('encrypt_sensitive_data', {
        data: Array.from(data),
      });
      return new Uint8Array(result);
    } catch (error) {
      throw new Error(`Failed to encrypt sensitive data: ${error}`);
    }
  }

  async decryptSensitiveData(encryptedData: Uint8Array): Promise<Uint8Array> {
    try {
      const result: number[] = await this.invoke('decrypt_sensitive_data', {
        encryptedData: Array.from(encryptedData),
      });
      return new Uint8Array(result);
    } catch (error) {
      throw new Error(`Failed to decrypt sensitive data: ${error}`);
    }
  }

  async verifyContentPackage(packageData: Uint8Array, expectedHash: string): Promise<boolean> {
    try {
      return await this.invoke('verify_content_package', {
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
      await this.invoke('save_settings', { settings });
    } catch (error) {
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  async loadSettings(): Promise<any> {
    try {
      return await this.invoke('load_settings');
    } catch (error) {
      throw new Error(`Failed to load settings: ${error}`);
    }
  }

  async resetSettings(): Promise<any> {
    try {
      return await this.invoke('reset_settings');
    } catch (error) {
      throw new Error(`Failed to reset settings: ${error}`);
    }
  }

  async updateSetting(key: string, value: any): Promise<any> {
    try {
      return await this.invoke('update_setting', { key, value });
    } catch (error) {
      throw new Error(`Failed to update setting: ${error}`);
    }
  }

  // ============================================================================
  // DATABASE OPERATIONS (for debugging/monitoring)
  // ============================================================================

  async getDatabaseStats(): Promise<string> {
    try {
      return await this.invoke('get_database_stats');
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error}`);
    }
  }

  async getDatabaseVersion(): Promise<number> {
    try {
      return await this.invoke('get_database_version');
    } catch (error) {
      throw new Error(`Failed to get database version: ${error}`);
    }
  }

  // ============================================================================
  // UPDATE SERVICE OPERATIONS
  // ============================================================================

  async checkForUpdates(): Promise<any[]> {
    try {
      return await this.invoke('check_for_updates');
    } catch (error) {
      throw new Error(`Failed to check for updates: ${error}`);
    }
  }

  async downloadAndInstallUpdate(updateInfo: any): Promise<void> {
    try {
      await this.invoke('download_and_install_update', { updateInfo });
    } catch (error) {
      throw new Error(`Failed to download and install update: ${error}`);
    }
  }

  async rollbackToBackup(): Promise<void> {
    try {
      await this.invoke('rollback_to_backup');
    } catch (error) {
      throw new Error(`Failed to rollback to backup: ${error}`);
    }
  }

  async getCurrentVersion(): Promise<string> {
    try {
      return await this.invoke('get_current_version');
    } catch (error) {
      throw new Error(`Failed to get current version: ${error}`);
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      return await this.invoke('list_backups');
    } catch (error) {
      throw new Error(`Failed to list backups: ${error}`);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

/**
 * Singleton instance of the fixed Tauri API
 */
export const fixedTauriAPI = new FixedTauriAPIImpl();

export default fixedTauriAPI;