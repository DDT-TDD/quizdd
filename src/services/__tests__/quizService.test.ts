import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuizService } from '../quizService'
import { 
  mockTauriApi, 
  mockQuizSession, 
  mockQuizConfig, 
  mockQuestion, 
  mockAnswerResult,
  mockScore 
} from '../../test/mocks'

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

describe('QuizService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startQuizSession', () => {
    it('starts a new quiz session', async () => {
      mockTauriApi.startQuizSession.mockResolvedValue(mockQuizSession)
      
      const session = await QuizService.startQuizSession(1, mockQuizConfig)
      
      expect(mockTauriApi.startQuizSession).toHaveBeenCalledWith(1, mockQuizConfig)
      expect(session).toEqual(mockQuizSession)
    })

    it('validates profile ID', async () => {
      await expect(
        QuizService.startQuizSession(0, mockQuizConfig)
      ).rejects.toThrow('Invalid profile ID')
    })

    it('validates quiz configuration', async () => {
      const invalidConfig = { ...mockQuizConfig, question_count: 0 }
      
      await expect(
        QuizService.startQuizSession(1, invalidConfig)
      ).rejects.toThrow('Question count must be greater than 0')
    })
  })

  describe('getCurrentQuestion', () => {
    it('gets current question from session', async () => {
      mockTauriApi.getCurrentQuestion.mockResolvedValue(mockQuestion)
      
      const question = await QuizService.getCurrentQuestion(1)
      
      expect(mockTauriApi.getCurrentQuestion).toHaveBeenCalledWith(1)
      expect(question).toEqual(mockQuestion)
    })

    it('handles session not found', async () => {
      mockTauriApi.getCurrentQuestion.mockResolvedValue(null)
      
      const question = await QuizService.getCurrentQuestion(999)
      
      expect(question).toBeNull()
    })
  })

  describe('submitAnswer', () => {
    it('submits answer and returns result', async () => {
      mockTauriApi.submitAnswer.mockResolvedValue(mockAnswerResult)
      
      const result = await QuizService.submitAnswer(1, '4', 5)
      
      expect(mockTauriApi.submitAnswer).toHaveBeenCalledWith(1, '4', 5)
      expect(result).toEqual(mockAnswerResult)
    })

    it('validates session ID', async () => {
      await expect(
        QuizService.submitAnswer(0, '4', 5)
      ).rejects.toThrow('Invalid session ID')
    })

    it('validates time taken', async () => {
      await expect(
        QuizService.submitAnswer(1, '4', -1)
      ).rejects.toThrow('Time taken must be positive')
    })
  })

  describe('calculateScore', () => {
    it('calculates quiz score', async () => {
      mockTauriApi.calculateScore.mockResolvedValue(mockScore)
      
      const score = await QuizService.calculateScore(mockQuizSession)
      
      expect(mockTauriApi.calculateScore).toHaveBeenCalledWith(mockQuizSession)
      expect(score).toEqual(mockScore)
    })

    it('validates quiz session', async () => {
      await expect(
        QuizService.calculateScore({ ...mockQuizSession, questions: [] })
      ).rejects.toThrow('Quiz session must have questions')
    })
  })

  describe('pauseQuiz', () => {
    it('pauses quiz session', async () => {
      mockTauriApi.pauseQuiz.mockResolvedValue(undefined)
      
      await QuizService.pauseQuiz(1)
      
      expect(mockTauriApi.pauseQuiz).toHaveBeenCalledWith(1)
    })

    it('validates session ID for pause', async () => {
      await expect(
        QuizService.pauseQuiz(0)
      ).rejects.toThrow('Invalid session ID')
    })
  })

  describe('resumeQuiz', () => {
    it('resumes quiz session', async () => {
      mockTauriApi.resumeQuiz.mockResolvedValue(undefined)
      
      await QuizService.resumeQuiz(1)
      
      expect(mockTauriApi.resumeQuiz).toHaveBeenCalledWith(1)
    })

    it('validates session ID for resume', async () => {
      await expect(
        QuizService.resumeQuiz(0)
      ).rejects.toThrow('Invalid session ID')
    })
  })

  describe('getQuizProgress', () => {
    it('gets quiz progress', async () => {
      const mockProgress = {
        session_id: 1,
        current_question_index: 2,
        total_questions: 10,
        answered_questions: 2,
        is_completed: false,
        time_elapsed: 60,
        is_paused: false,
      }
      
      mockTauriApi.getQuizProgress.mockResolvedValue(mockProgress)
      
      const progress = await QuizService.getQuizProgress(1)
      
      expect(mockTauriApi.getQuizProgress).toHaveBeenCalledWith(1)
      expect(progress).toEqual(mockProgress)
    })
  })

  describe('validateQuizConfig', () => {
    it('validates valid quiz configuration', () => {
      expect(() => QuizService.validateQuizConfig(mockQuizConfig)).not.toThrow()
    })

    it('validates subject requirement', () => {
      const invalidConfig = { ...mockQuizConfig, subject: '' }
      
      expect(() => QuizService.validateQuizConfig(invalidConfig))
        .toThrow('Subject is required')
    })

    it('validates question count', () => {
      const invalidConfig = { ...mockQuizConfig, question_count: 0 }
      
      expect(() => QuizService.validateQuizConfig(invalidConfig))
        .toThrow('Question count must be greater than 0')
    })

    it('validates difficulty range', () => {
      const invalidConfig = { 
        ...mockQuizConfig, 
        difficulty_range: [5, 1] as [number, number] 
      }
      
      expect(() => QuizService.validateQuizConfig(invalidConfig))
        .toThrow('Invalid difficulty range')
    })

    it('validates time limit', () => {
      const invalidConfig = { ...mockQuizConfig, time_limit_seconds: -1 }
      
      expect(() => QuizService.validateQuizConfig(invalidConfig))
        .toThrow('Time limit must be positive')
    })
  })
})