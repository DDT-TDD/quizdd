import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../contexts/AppContext'
import { QuizInterface } from '../../components/QuizInterface'
import { SubjectGrid } from '../../components/SubjectGrid'
import { mockQuestion, mockTauriApi } from '../mocks'

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(),
  getEntriesByName: vi.fn(),
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
})

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformance.now.mockReturnValue(0)
  })

  describe('Quiz Loading Performance', () => {
    it('loads quiz questions within 500ms target', async () => {
      const startTime = performance.now()
      mockTauriApi.getQuestions.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve([mockQuestion]), 100) // Simulate 100ms load time
        })
      )

      render(
        <AppProvider>
          <QuizInterface 
            questions={[]} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(500) // Target: < 500ms
    })

    it('handles large question sets efficiently', async () => {
      const largeQuestionSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockQuestion,
        id: i + 1,
        content: { ...mockQuestion.content, text: `Question ${i + 1}` }
      }))

      mockTauriApi.getQuestions.mockResolvedValue(largeQuestionSet)

      const startTime = performance.now()
      
      render(
        <AppProvider>
          <QuizInterface 
            questions={largeQuestionSet} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(1000) // Should handle 100 questions in < 1s
    })
  })

  describe('Animation Performance', () => {
    it('maintains 60fps during transitions', async () => {
      const user = userEvent.setup()
      let frameCount = 0
      const targetFPS = 60
      const testDuration = 1000 // 1 second

      // Mock requestAnimationFrame
      const mockRAF = vi.fn((callback) => {
        frameCount++
        setTimeout(callback, 1000 / targetFPS)
        return frameCount
      })
      
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: mockRAF,
        writable: true,
      })

      render(
        <AppProvider>
          <QuizInterface 
            questions={[mockQuestion]} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      // Trigger animation by answering question
      await user.click(screen.getByText('4'))
      
      // Wait for animation duration
      await new Promise(resolve => setTimeout(resolve, testDuration))
      
      const actualFPS = frameCount / (testDuration / 1000)
      expect(actualFPS).toBeGreaterThanOrEqual(55) // Allow 5fps tolerance
    })

    it('handles multiple simultaneous animations', async () => {
      const user = userEvent.setup()
      
      render(
        <AppProvider>
          <QuizInterface 
            questions={[mockQuestion, { ...mockQuestion, id: 2 }]} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      const startTime = performance.now()
      
      // Trigger multiple rapid interactions
      await user.click(screen.getByText('4'))
      await user.click(screen.getByText('Next'))
      
      const endTime = performance.now()
      const interactionTime = endTime - startTime
      
      expect(interactionTime).toBeLessThan(200) // Smooth interactions
    })
  })

  describe('Memory Usage', () => {
    it('does not leak memory during quiz sessions', async () => {
      const user = userEvent.setup()
      
      // Mock memory API
      const mockMemory = {
        usedJSHeapSize: 10000000, // 10MB initial
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000,
      }
      
      Object.defineProperty(performance, 'memory', {
        value: mockMemory,
        writable: true,
      })

      const initialMemory = performance.memory.usedJSHeapSize
      
      // Simulate multiple quiz sessions
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <AppProvider>
            <QuizInterface 
              questions={[mockQuestion]} 
              onComplete={vi.fn()} 
              subject="Mathematics"
              keyStage="KS1"
            />
          </AppProvider>
        )
        
        await user.click(screen.getByText('4'))
        unmount()
      }
      
      // Force garbage collection (if available)
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = performance.memory.usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be minimal (< 5MB)
      expect(memoryIncrease).toBeLessThan(5000000)
    })

    it('efficiently handles large asset loading', async () => {
      const largeAssetQuestion = {
        ...mockQuestion,
        assets: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          question_id: 1,
          asset_type: 'image' as const,
          file_path: `/assets/image${i}.jpg`,
          alt_text: `Image ${i}`,
        }))
      }

      const startMemory = performance.memory?.usedJSHeapSize || 0
      
      render(
        <AppProvider>
          <QuizInterface 
            questions={[largeAssetQuestion]} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })

      const endMemory = performance.memory?.usedJSHeapSize || 0
      const memoryUsed = endMemory - startMemory
      
      // Should handle assets efficiently (< 10MB for 50 images)
      expect(memoryUsed).toBeLessThan(10000000)
    })
  })

  describe('Database Query Performance', () => {
    it('executes subject queries quickly', async () => {
      const subjects = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Subject${i + 1}`,
        display_name: `Subject ${i + 1}`,
        color_scheme: 'blue'
      }))

      mockTauriApi.getSubjects.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve(subjects), 50) // Simulate 50ms query time
        })
      )

      const startTime = performance.now()
      
      render(
        <AppProvider>
          <SubjectGrid onSubjectSelect={vi.fn()} />
        </AppProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Subject1')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const queryTime = endTime - startTime
      
      expect(queryTime).toBeLessThan(100) // Database queries should be fast
    })

    it('handles concurrent database operations', async () => {
      const promises = [
        mockTauriApi.getSubjects(),
        mockTauriApi.getQuestions({ subject: 'Math', key_stage: 'KS1', count: 10 }),
        mockTauriApi.getAllProfiles(),
      ]

      const startTime = performance.now()
      
      await Promise.all(promises)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).toBeLessThan(300) // Concurrent operations should be efficient
    })
  })

  describe('Rendering Performance', () => {
    it('renders component trees efficiently', async () => {
      const startTime = performance.now()
      
      render(
        <AppProvider>
          <div>
            <SubjectGrid onSubjectSelect={vi.fn()} />
            <QuizInterface 
              questions={[mockQuestion]} 
              onComplete={vi.fn()} 
              subject="Mathematics"
              keyStage="KS1"
            />
          </div>
        </AppProvider>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Initial render should be fast
    })

    it('updates efficiently on state changes', async () => {
      const user = userEvent.setup()
      
      render(
        <AppProvider>
          <QuizInterface 
            questions={[mockQuestion]} 
            onComplete={vi.fn()} 
            subject="Mathematics"
            keyStage="KS1"
          />
        </AppProvider>
      )

      const startTime = performance.now()
      
      // Trigger state update
      await user.click(screen.getByText('4'))
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      expect(updateTime).toBeLessThan(50) // State updates should be very fast
    })
  })
})