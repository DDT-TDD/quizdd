import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentService } from '../contentService'
import { mockTauriApi, mockSubject, mockQuestion, mockAnswerResult } from '../../test/mocks'

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

describe('ContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSubjects', () => {
    it('fetches subjects from Tauri API', async () => {
      mockTauriApi.getSubjects.mockResolvedValue([mockSubject])
      
      const subjects = await ContentService.getSubjects()
      
      expect(mockTauriApi.getSubjects).toHaveBeenCalled()
      expect(subjects).toEqual([mockSubject])
    })

    it('handles API errors gracefully', async () => {
      mockTauriApi.getSubjects.mockRejectedValue(new Error('API Error'))
      
      await expect(ContentService.getSubjects()).rejects.toThrow('API Error')
    })
  })

  describe('getQuestions', () => {
    it('fetches questions with correct parameters', async () => {
      mockTauriApi.getQuestions.mockResolvedValue([mockQuestion])
      
      const request = {
        subject: 'Mathematics',
        key_stage: 'KS1' as const,
        count: 10
      }
      
      const questions = await ContentService.getQuestions(request)
      
      expect(mockTauriApi.getQuestions).toHaveBeenCalledWith(request)
      expect(questions).toEqual([mockQuestion])
    })

    it('validates parameters', async () => {
      await expect(
        ContentService.getQuestions({
          subject: '',
          key_stage: 'KS1',
          count: 10
        })
      ).rejects.toThrow('Subject is required')
      
      await expect(
        ContentService.getQuestions({
          subject: 'Mathematics',
          key_stage: 'KS1',
          count: 0
        })
      ).rejects.toThrow('Question count must be greater than 0')
    })
  })

  describe('validateAnswer', () => {
    it('validates answer and returns result', async () => {
      mockTauriApi.validateAnswer.mockResolvedValue(mockAnswerResult)
      
      const result = await ContentService.validateAnswer(1, '4')
      
      expect(mockTauriApi.validateAnswer).toHaveBeenCalledWith(1, '4')
      expect(result).toEqual(mockAnswerResult)
    })

    it('handles incorrect answers', async () => {
      const incorrectResult = { ...mockAnswerResult, is_correct: false, points: 0 }
      mockTauriApi.validateAnswer.mockResolvedValue(incorrectResult)
      
      const result = await ContentService.validateAnswer(1, '3')
      
      expect(result.is_correct).toBe(false)
      expect(result.points).toBe(0)
    })

    it('validates question ID', async () => {
      await expect(
        ContentService.validateAnswer(0, '4')
      ).rejects.toThrow('Invalid question ID')
    })
  })
})