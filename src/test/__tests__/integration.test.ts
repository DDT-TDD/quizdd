import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../contexts/AppContext'
import { App } from '../../App'
import { mockTauriApi, mockQuestion, mockProfile, mockSubject, mockProgress } from '../mocks'

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock responses
    mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
    mockTauriApi.getSubjects.mockResolvedValue([mockSubject])
    mockTauriApi.getQuestions.mockResolvedValue([mockQuestion])
    mockTauriApi.getProgress.mockResolvedValue(mockProgress)
    mockTauriApi.isContentSeeded.mockResolvedValue(true)
  })

  describe('Complete Quiz Flow', () => {
    it('completes a full quiz session from start to finish', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // 1. Select profile
      await waitFor(() => {
        expect(screen.getByText('Test Child')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Test Child'))

      // 2. Navigate to subjects
      await user.click(screen.getByText('Subjects'))
      
      // 3. Select subject
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Mathematics'))

      // 4. Start quiz
      await user.click(screen.getByText('Start Quiz'))

      // 5. Answer question
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })
      await user.click(screen.getByText('4'))
      await user.click(screen.getByText('Next'))

      // 6. View results
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
      })

      // Verify API calls were made in correct order
      expect(mockTauriApi.getAllProfiles).toHaveBeenCalled()
      expect(mockTauriApi.getSubjects).toHaveBeenCalled()
      expect(mockTauriApi.getQuestions).toHaveBeenCalled()
      expect(mockTauriApi.validateAnswer).toHaveBeenCalled()
    })

    it('handles quiz with multiple questions', async () => {
      const user = userEvent.setup()
      const multipleQuestions = [
        mockQuestion,
        { ...mockQuestion, id: 2, content: { ...mockQuestion.content, text: 'What is 3 + 3?' } },
        { ...mockQuestion, id: 3, content: { ...mockQuestion.content, text: 'What is 4 + 4?' } }
      ]
      
      mockTauriApi.getQuestions.mockResolvedValue(multipleQuestions)
      
      render(<App />)

      // Navigate to quiz
      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Subjects'))
      await user.click(screen.getByText('Mathematics'))
      await user.click(screen.getByText('Start Quiz'))

      // Answer first question
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
      
      await user.click(screen.getByText('4'))
      await user.click(screen.getByText('Next'))

      // Answer second question
      await waitFor(() => {
        expect(screen.getByText('What is 3 + 3?')).toBeInTheDocument()
      })
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument()
      
      await user.click(screen.getByText('6'))
      await user.click(screen.getByText('Next'))

      // Answer third question
      await waitFor(() => {
        expect(screen.getByText('What is 4 + 4?')).toBeInTheDocument()
      })
      expect(screen.getByText('Question 3 of 3')).toBeInTheDocument()
      
      await user.click(screen.getByText('8'))
      await user.click(screen.getByText('Finish'))

      // View results
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
      })
    })
  })

  describe('Profile Management Flow', () => {
    it('creates and switches between profiles', async () => {
      const user = userEvent.setup()
      const newProfile = { ...mockProfile, id: 2, name: 'Second Child' }
      
      mockTauriApi.createProfile.mockResolvedValue(newProfile)
      mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile, newProfile])
      
      render(<App />)

      // Navigate to profile management
      await user.click(screen.getByText('Profile'))
      await user.click(screen.getByText('Manage Profiles'))

      // Create new profile
      await user.click(screen.getByText('Add Profile'))
      await user.type(screen.getByLabelText(/Name/), 'Second Child')
      await user.click(screen.getByText('avatar2'))
      await user.click(screen.getByText('Create Profile'))

      // Verify profile was created
      await waitFor(() => {
        expect(screen.getByText('Second Child')).toBeInTheDocument()
      })

      // Switch to new profile
      await user.click(screen.getByText('Second Child'))
      
      expect(mockTauriApi.createProfile).toHaveBeenCalledWith({
        name: 'Second Child',
        avatar: 'avatar2',
        theme_preference: 'default'
      })
    })

    it('displays profile progress correctly', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // Navigate to profile
      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Profile'))

      // Check progress display
      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument() // Accuracy from mockProgress
        expect(screen.getByText('10')).toBeInTheDocument() // Total questions
      })
    })
  })

  describe('Custom Mix Flow', () => {
    it('creates and uses custom mix', async () => {
      const user = userEvent.setup()
      const customMix = {
        id: 1,
        name: 'My Custom Mix',
        created_by: 1,
        config: {
          subjects: ['Mathematics'],
          key_stages: ['KS1'],
          question_count: 5,
          difficulty_range: [1, 2],
          randomize_order: true,
          show_immediate_feedback: true,
          allow_review: false,
        }
      }
      
      mockTauriApi.createCustomMix.mockResolvedValue(customMix)
      mockTauriApi.getAllCustomMixes.mockResolvedValue([customMix])
      
      render(<App />)

      // Access parental controls (requires parental gate)
      await user.click(screen.getByText('Settings'))
      await user.click(screen.getByText('Custom Mixes'))
      
      // Pass parental gate
      await user.type(screen.getByRole('textbox'), '12') // Assuming 7+5=12
      await user.click(screen.getByText('Submit'))

      // Create custom mix
      await user.click(screen.getByText('Create Mix'))
      await user.type(screen.getByLabelText(/Mix Name/), 'My Custom Mix')
      await user.click(screen.getByText('Mathematics'))
      await user.click(screen.getByText('KS1'))
      await user.click(screen.getByText('Save Mix'))

      // Use custom mix
      await waitFor(() => {
        expect(screen.getByText('My Custom Mix')).toBeInTheDocument()
      })
      await user.click(screen.getByText('My Custom Mix'))
      await user.click(screen.getByText('Start Quiz'))

      // Verify quiz starts with custom mix
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock API error
      mockTauriApi.getSubjects.mockRejectedValue(new Error('Network error'))
      
      render(<App />)

      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Subjects'))

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })

      // Should allow retry
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('recovers from temporary failures', async () => {
      const user = userEvent.setup()
      
      // First call fails, second succeeds
      mockTauriApi.getSubjects
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValue([mockSubject])
      
      render(<App />)

      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Subjects'))

      // Should show error first
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })

      // Retry should work
      await user.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      })
    })
  })

  describe('Offline Functionality', () => {
    it('works when offline', async () => {
      const user = userEvent.setup()
      
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })
      
      render(<App />)

      // Should still work with cached data
      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Subjects'))
      
      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument()
      })

      // Should show offline indicator
      expect(screen.getByText(/offline/i)).toBeInTheDocument()
    })

    it('syncs data when coming back online', async () => {
      const user = userEvent.setup()
      
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })
      
      render(<App />)

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
      })
      
      // Trigger online event
      window.dispatchEvent(new Event('online'))

      // Should sync data
      await waitFor(() => {
        expect(mockTauriApi.getAllProfiles).toHaveBeenCalled()
      })
    })
  })

  describe('Data Persistence', () => {
    it('persists quiz progress across sessions', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // Start quiz
      await user.click(screen.getByText('Test Child'))
      await user.click(screen.getByText('Subjects'))
      await user.click(screen.getByText('Mathematics'))
      await user.click(screen.getByText('Start Quiz'))

      // Answer question
      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      })
      await user.click(screen.getByText('4'))
      await user.click(screen.getByText('Next'))

      // Verify progress was saved
      expect(mockTauriApi.updateProgress).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          subject: 'Mathematics',
          questions_answered: 1,
          correct_answers: 1,
        })
      )
    })

    it('maintains theme preferences', async () => {
      const user = userEvent.setup()
      
      render(<App />)

      // Change theme
      await user.click(screen.getByText('Settings'))
      await user.click(screen.getByText('Dark Theme'))

      // Verify theme was applied
      expect(document.documentElement).toHaveClass('dark-theme')

      // Verify theme was saved
      expect(mockTauriApi.updateProfile).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          theme_preference: 'dark'
        })
      )
    })
  })
})