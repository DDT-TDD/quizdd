import { invoke } from '@tauri-apps/api/core';

export interface ParentalChallenge {
  id: string;
  question: string;
  expected_answer: number;
  expires_at: number;
}

export class SecurityService {
  /**
   * Generate a new parental access challenge
   */
  static async generateParentalChallenge(): Promise<ParentalChallenge> {
    try {
      return await invoke<ParentalChallenge>('generate_parental_challenge');
    } catch (error) {
      console.error('Failed to generate parental challenge:', error);
      throw new Error(`Challenge generation failed: ${error}`);
    }
  }

  /**
   * Validate parental access with challenge response
   */
  static async validateParentalAccess(challenge: string, input: string): Promise<boolean> {
    try {
      return await invoke<boolean>('validate_parental_access', { challenge, input });
    } catch (error) {
      console.error('Failed to validate parental access:', error);
      throw new Error(`Access validation failed: ${error}`);
    }
  }

  /**
   * Validate parental feature access with session token
   */
  static async validateParentalFeatureAccess(feature: string, sessionToken: string): Promise<boolean> {
    try {
      return await invoke<boolean>('validate_parental_feature_access', { 
        feature, 
        sessionToken 
      });
    } catch (error) {
      console.error('Failed to validate parental feature access:', error);
      throw new Error(`Feature access validation failed: ${error}`);
    }
  }

  /**
   * Generate a parental session token
   */
  static async generateParentalSessionToken(): Promise<string> {
    try {
      return await invoke<string>('generate_parental_session_token');
    } catch (error) {
      console.error('Failed to generate parental session token:', error);
      throw new Error(`Session token generation failed: ${error}`);
    }
  }

  /**
   * Verify update signature
   */
  static async verifyUpdateSignature(updateData: number[], signature: number[]): Promise<boolean> {
    try {
      return await invoke<boolean>('verify_update_signature', { 
        updateData, 
        signature 
      });
    } catch (error) {
      console.error('Failed to verify update signature:', error);
      throw new Error(`Signature verification failed: ${error}`);
    }
  }

  /**
   * Encrypt sensitive data
   */
  static async encryptSensitiveData(data: number[]): Promise<number[]> {
    try {
      return await invoke<number[]>('encrypt_sensitive_data', { data });
    } catch (error) {
      console.error('Failed to encrypt sensitive data:', error);
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decryptSensitiveData(encryptedData: number[]): Promise<number[]> {
    try {
      return await invoke<number[]>('decrypt_sensitive_data', { encryptedData });
    } catch (error) {
      console.error('Failed to decrypt sensitive data:', error);
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Verify content package integrity
   */
  static async verifyContentPackage(packageData: number[], expectedHash: string): Promise<boolean> {
    try {
      return await invoke<boolean>('verify_content_package', { 
        packageData, 
        expectedHash 
      });
    } catch (error) {
      console.error('Failed to verify content package:', error);
      throw new Error(`Content verification failed: ${error}`);
    }
  }

  /**
   * Check if a challenge has expired
   */
  static isChallengeExpired(challenge: ParentalChallenge): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > challenge.expires_at;
  }

  /**
   * Format challenge question for display
   */
  static formatChallengeQuestion(question: string): string {
    // Ensure the question ends with a question mark
    return question.endsWith('?') ? question : `${question}?`;
  }

  /**
   * Validate answer format (should be a number)
   */
  static isValidAnswerFormat(answer: string): boolean {
    const trimmed = answer.trim();
    return /^\d+$/.test(trimmed) && !isNaN(parseInt(trimmed, 10));
  }

  /**
   * Get challenge difficulty level based on the numbers involved
   */
  static getChallengeDifficulty(question: string): 'easy' | 'medium' | 'hard' {
    // Extract numbers from the question
    const numbers = question.match(/\d+/g)?.map(Number) || [];
    
    if (numbers.length === 0) return 'medium';
    
    const maxNumber = Math.max(...numbers);
    
    if (maxNumber <= 20) return 'easy';
    if (maxNumber <= 100) return 'medium';
    return 'hard';
  }

  /**
   * Generate a hint for the challenge (for accessibility)
   */
  static generateChallengeHint(question: string): string {
    if (question.includes('+')) {
      return 'Add the two numbers together';
    } else if (question.includes('-')) {
      return 'Subtract the second number from the first';
    } else if (question.includes('×') || question.includes('*')) {
      return 'Multiply the two numbers';
    } else if (question.includes('÷') || question.includes('/')) {
      return 'Divide the first number by the second';
    }
    return 'Solve the math problem';
  }

  /**
   * Store session token securely (in memory for this session)
   */
  private static sessionToken: string | null = null;
  private static sessionExpiry: number | null = null;

  static setSessionToken(token: string, expiryMinutes: number = 60): void {
    this.sessionToken = token;
    this.sessionExpiry = Date.now() + (expiryMinutes * 60 * 1000);
  }

  static getSessionToken(): string | null {
    if (this.sessionExpiry && Date.now() > this.sessionExpiry) {
      this.clearSessionToken();
      return null;
    }
    return this.sessionToken;
  }

  static clearSessionToken(): void {
    this.sessionToken = null;
    this.sessionExpiry = null;
  }

  static isSessionValid(): boolean {
    return this.getSessionToken() !== null;
  }

  /**
   * Check if a feature requires parental access
   */
  static requiresParentalAccess(feature: string): boolean {
    const parentalFeatures = [
      'custom_mix_creation',
      'settings',
      'content_updates',
      'profile_management',
      'update_management',
    ];
    
    return parentalFeatures.includes(feature);
  }

  /**
   * Get user-friendly feature names
   */
  static getFeatureName(feature: string): string {
    const featureNames: Record<string, string> = {
      'custom_mix_creation': 'Custom Quiz Creation',
      'settings': 'App Settings',
      'content_updates': 'Content Updates',
      'profile_management': 'Profile Management',
      'update_management': 'Update Management',
    };
    
    return featureNames[feature] || feature;
  }
}

export default SecurityService;