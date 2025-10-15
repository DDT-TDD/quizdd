import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { offlineService } from './offlineService'
import { offlineErrorHandler } from './offlineErrorHandler'
import type { 
  Subject, 
  Question, 
  KeyStage, 
  ContentStatistics,
  GetQuestionsRequest 
} from '../types/api'

/**
 * Content Service for managing quiz content and subjects
 * Provides a higher-level interface over the Tauri API for content operations
 */
export class ContentService {
  
  /**
   * Get all available subjects from the database with offline fallback
   */
  async getSubjects(): Promise<Subject[]> {
    try {
      // Try offline service first (includes caching and fallbacks)
      return await offlineService.getSubjects()
    } catch (error) {
      console.error('ContentService: Failed to get subjects:', error)
      
      // Use offline error handler for fallback strategies
      return await offlineErrorHandler.handleError<Subject[]>(
        'getSubjects',
        error as Error
      )
    }
  }

  /**
   * Get questions for a specific subject with filtering options and offline support
   */
  async getQuestionsBySubject(
    subjectName: string,
    keyStage?: KeyStage,
    difficultyRange?: [number, number],
    limit?: number
  ): Promise<Question[]> {
    try {
      // Try offline service first (includes caching and fallbacks)
      return await offlineService.getQuestions(
        subjectName,
        keyStage,
        difficultyRange,
        limit || 10
      )
    } catch (error) {
      console.error('ContentService: Failed to get questions by subject:', error)
      
      // Use offline error handler for fallback strategies
      return await offlineErrorHandler.handleError<Question[]>(
        'getQuestions',
        error as Error,
        { subject: subjectName, keyStage, difficultyRange, count: limit }
      )
    }
  }

  /**
   * Get questions using the standardized request format with offline support
   */
  async getQuestions(request: GetQuestionsRequest): Promise<Question[]> {
    try {
      // Use offline service for better caching and fallback support
      return await offlineService.getQuestions(
        request.subject,
        request.key_stage,
        request.difficulty_range,
        request.count
      )
    } catch (error) {
      console.error('ContentService: Failed to get questions:', error)
      
      // Use offline error handler for fallback strategies
      return await offlineErrorHandler.handleError<Question[]>(
        'getQuestions',
        error as Error,
        request
      )
    }
  }

  /**
   * Get a specific question by ID
   */
  async getQuestionById(questionId: number): Promise<Question> {
    try {
      return await tauriAPI.getQuestionById(questionId)
    } catch (error) {
      console.error('ContentService: Failed to get question by ID:', error)
      throw new Error('Failed to load question. Please try again.')
    }
  }

  /**
   * Get content statistics for dashboard/admin purposes
   */
  async getContentStatistics(): Promise<ContentStatistics> {
    try {
      return await tauriAPI.getContentStatistics()
    } catch (error) {
      console.error('ContentService: Failed to get content statistics:', error)
      throw new Error('Failed to load content statistics.')
    }
  }

  /**
   * Get questions filtered by difficulty level
   */
  async getQuestionsByDifficulty(
    subjectName: string,
    keyStage: KeyStage,
    minDifficulty: number,
    maxDifficulty: number,
    limit?: number
  ): Promise<Question[]> {
    try {
      return await this.getQuestionsBySubject(
        subjectName,
        keyStage,
        [minDifficulty, maxDifficulty],
        limit
      )
    } catch (error) {
      console.error('ContentService: Failed to get questions by difficulty:', error)
      throw new Error('Failed to load questions with specified difficulty. Please try again.')
    }
  }

  /**
   * Get a random selection of questions for a quiz
   */
  async getRandomQuestions(
    subjectName: string,
    keyStage: KeyStage,
    count: number,
    difficultyRange?: [number, number]
  ): Promise<Question[]> {
    try {
      const request: GetQuestionsRequest = {
        subject: subjectName,
        key_stage: keyStage,
        count,
        difficulty_range: difficultyRange
      }
      
      return await this.getQuestions(request)
    } catch (error) {
      console.error('ContentService: Failed to get random questions:', error)
      throw new Error('Failed to generate quiz questions. Please try again.')
    }
  }

  /**
   * Check if a subject has questions available for a given key stage
   */
  async hasQuestionsForSubject(
    subjectName: string,
    keyStage: KeyStage
  ): Promise<boolean> {
    try {
      const questions = await this.getQuestionsBySubject(subjectName, keyStage, undefined, 1)
      return questions.length > 0
    } catch (error) {
      console.error('ContentService: Failed to check questions availability:', error)
      return false
    }
  }

  /**
   * Get available difficulty levels for a subject and key stage
   */
  async getAvailableDifficultyLevels(
    subjectName: string,
    keyStage: KeyStage
  ): Promise<number[]> {
    try {
      // Get all questions for the subject/key stage
      const questions = await this.getQuestionsBySubject(subjectName, keyStage)
      
      // Extract unique difficulty levels
      const difficultyLevels = [...new Set(questions.map(q => q.difficulty_level))]
      
      // Sort in ascending order
      return difficultyLevels.sort((a, b) => a - b)
    } catch (error) {
      console.error('ContentService: Failed to get difficulty levels:', error)
      return [1, 2, 3] // Default difficulty levels
    }
  }

  /**
   * Get question count for a subject and key stage
   */
  async getQuestionCount(
    subjectName: string,
    keyStage?: KeyStage,
    difficultyRange?: [number, number]
  ): Promise<number> {
    try {
      const questions = await this.getQuestionsBySubject(
        subjectName,
        keyStage,
        difficultyRange
      )
      return questions.length
    } catch (error) {
      console.error('ContentService: Failed to get question count:', error)
      return 0
    }
  }

  /**
   * Validate that enough questions are available for a quiz configuration
   */
  async validateQuizConfiguration(
    subjectName: string,
    keyStage: KeyStage,
    requestedCount: number,
    difficultyRange?: [number, number]
  ): Promise<{ valid: boolean; availableCount: number; message?: string }> {
    try {
      const availableCount = await this.getQuestionCount(
        subjectName,
        keyStage,
        difficultyRange
      )

      if (availableCount === 0) {
        return {
          valid: false,
          availableCount: 0,
          message: `No questions available for ${subjectName} (${keyStage})`
        }
      }

      if (availableCount < requestedCount) {
        return {
          valid: false,
          availableCount,
          message: `Only ${availableCount} questions available, but ${requestedCount} requested`
        }
      }

      return {
        valid: true,
        availableCount
      }
    } catch (error) {
      console.error('ContentService: Failed to validate quiz configuration:', error)
      return {
        valid: false,
        availableCount: 0,
        message: 'Failed to validate quiz configuration'
      }
    }
  }

  /**
   * Get subject information by name
   */
  async getSubjectByName(subjectName: string): Promise<Subject | null> {
    try {
      const subjects = await this.getSubjects()
      return subjects.find(s => s.name === subjectName) || null
    } catch (error) {
      console.error('ContentService: Failed to get subject by name:', error)
      return null
    }
  }

  /**
   * Get subjects that have questions available for a specific key stage
   */
  async getSubjectsWithContent(keyStage: KeyStage): Promise<Subject[]> {
    try {
      const subjects = await this.getSubjects()
      const subjectsWithContent: Subject[] = []

      // Check each subject for available content
      for (const subject of subjects) {
        const hasContent = await this.hasQuestionsForSubject(subject.name, keyStage)
        if (hasContent) {
          subjectsWithContent.push(subject)
        }
      }

      return subjectsWithContent
    } catch (error) {
      console.error('ContentService: Failed to get subjects with content:', error)
      return []
    }
  }
}

// Singleton instance
export const contentService = new ContentService()

// Helper functions for common operations
export const ContentHelpers = {
  /**
   * Format difficulty level for display
   */
  formatDifficultyLevel: (level: number): string => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Expert'
    }
    return labels[level as keyof typeof labels] || `Level ${level}`
  },

  /**
   * Get difficulty color for UI
   */
  getDifficultyColor: (level: number): string => {
    const colors = {
      1: '#27AE60', // Green
      2: '#2ECC71', // Light Green
      3: '#F39C12', // Orange
      4: '#E67E22', // Dark Orange
      5: '#E74C3C'  // Red
    }
    return colors[level as keyof typeof colors] || '#95A5A6'
  },

  /**
   * Get subject icon emoji
   */
  getSubjectIcon: (subjectName: string): string => {
    const iconMap: Record<string, string> = {
      mathematics: '🔢',
      geography: '🌍',
      english: '📚',
      science: '🔬',
      'general-knowledge': '🧠',
      general_knowledge: '🧠',
      times_tables: '✖️',
      flags_capitals: '🏁'
    }
    return iconMap[subjectName.toLowerCase()] || '📖'
  },

  /**
   * Get subject color class name
   */
  getSubjectColorClass: (subjectName: string): string => {
    const colorMap: Record<string, string> = {
      mathematics: 'math-color',
      geography: 'geography-color',
      english: 'english-color',
      science: 'science-color',
      'general-knowledge': 'general-color',
      general_knowledge: 'general-color',
      times_tables: 'times-tables-color',
      flags_capitals: 'flags-capitals-color'
    }
    return colorMap[subjectName.toLowerCase()] || 'default-color'
  }
}

export default contentService