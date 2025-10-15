import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { 
  QuizSession, 
  QuizConfig, 
  Question, 
  Answer, 
  AnswerResult, 
  Score,
  QuizProgress
} from '../types/api'

export class QuizService {
  static async startQuizSession(profileId: number, config: QuizConfig): Promise<QuizSession> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    this.validateQuizConfig(config)
    
    return await tauriAPI.startQuizSession(profileId, config)
  }

  static async getCurrentQuestion(sessionId: number): Promise<Question | null> {
    if (sessionId <= 0) {
      throw new Error('Invalid session ID')
    }
    
    return await tauriAPI.getCurrentQuestion(sessionId)
  }

  static async submitAnswer(sessionId: number, answer: Answer, timeTaken: number): Promise<AnswerResult> {
    if (sessionId <= 0) {
      throw new Error('Invalid session ID')
    }
    
    if (timeTaken < 0) {
      throw new Error('Time taken must be positive')
    }
    
    return await tauriAPI.submitAnswer(sessionId, answer, timeTaken)
  }

  static async calculateScore(quizSession: QuizSession): Promise<Score> {
    if (!quizSession.questions || quizSession.questions.length === 0) {
      throw new Error('Quiz session must have questions')
    }
    
    return await tauriAPI.calculateScore(quizSession)
  }

  static async pauseQuiz(sessionId: number): Promise<void> {
    if (sessionId <= 0) {
      throw new Error('Invalid session ID')
    }
    
    return await tauriAPI.pauseQuiz(sessionId)
  }

  static async resumeQuiz(sessionId: number): Promise<void> {
    if (sessionId <= 0) {
      throw new Error('Invalid session ID')
    }
    
    return await tauriAPI.resumeQuiz(sessionId)
  }

  static async getQuizProgress(sessionId: number): Promise<QuizProgress> {
    if (sessionId <= 0) {
      throw new Error('Invalid session ID')
    }
    
    return await tauriAPI.getQuizProgress(sessionId)
  }

  static validateQuizConfig(config: QuizConfig): void {
    if (!config.subject.trim()) {
      throw new Error('Subject is required')
    }
    
    if (config.question_count <= 0) {
      throw new Error('Question count must be greater than 0')
    }
    
    if (config.difficulty_range && config.difficulty_range[0] > config.difficulty_range[1]) {
      throw new Error('Invalid difficulty range')
    }
    
    if (config.time_limit_seconds !== undefined && config.time_limit_seconds < 0) {
      throw new Error('Time limit must be positive')
    }
  }
}