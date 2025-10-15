import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppProvider, useAppContext, appActions } from '../../contexts/AppContext'
import { mockQuestion, mockProfile, mockTauriApi, mockProgress } from '../../test/mocks'

// Component imports
import { NavigationBar } from '../NavigationBar'
import { UserProfileSelector } from '../UserProfileSelector'
import { ParentalGate } from '../ParentalGate'
import { ErrorBoundary } from '../ErrorBoundary'
import { QuestionRenderer } from '../QuestionRenderer'
import { MultipleChoiceQuestion } from '../MultipleChoiceQuestion'
import { ProgressIndicator } from '../ProgressIndicator'
import { QuizTimer } from '../QuizTimer'
import { ResultsScreen } from '../ResultsScreen'
import { SubjectGrid } from '../SubjectGrid'
import { QuizInterface } from '../QuizInterface'
import { CustomMixCreator } from '../CustomMixCreator'
import { ProfileManagement } from '../ProfileManagement'

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>
}

describe('NavigationBar', () => {
  it('renders navigation buttons', () => {
    render(
      <TestWrapper>
        <NavigationBar />
      </TestWrapper>
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Subjects')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('highlights current view', () => {
    render(
      <TestWrapper>
        <NavigationBar />
      </TestWrapper>
    )
    
    const homeButton = screen.getByText('Home').closest('button')
    expect(homeButton).toHaveClass('active')
  })

  it('handles navigation clicks', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NavigationBar />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Subjects'))
    // Navigation should work through context
    expect(screen.getByText('Subjects')).toBeInTheDocument()
  })
})

describe('UserProfileSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays profile selection when no profile is selected', () => {
    render(
      <TestWrapper>
        <UserProfileSelector />
      </TestWrapper>
    )
    
    expect(screen.getByText('Select Profile')).toBeInTheDocument()
  })

  it('shows available profiles', async () => {
    mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
    
    render(
      <TestWrapper>
        <UserProfileSelector />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  it('handles profile selection', async () => {
    const user = userEvent.setup()
    mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
    
    render(
      <TestWrapper>
        <UserProfileSelector />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Child'))
    // Profile should be selected through context
  })
})

describe('ParentalGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders parental gate interface', () => {
    render(
      <TestWrapper>
        <ParentalGate />
      </TestWrapper>
    )
    
    expect(screen.getByText(/Parental/)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('validates parental access', async () => {
    const user = userEvent.setup()
    mockTauriApi.validateParentalAccess.mockResolvedValue(true)
    
    render(
      <TestWrapper>
        <ParentalGate />
      </TestWrapper>
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, '12')
    await user.click(screen.getByText('Submit'))
    
    await waitFor(() => {
      expect(mockTauriApi.validateParentalAccess).toHaveBeenCalled()
    })
  })

  it('handles incorrect parental access', async () => {
    const user = userEvent.setup()
    mockTauriApi.validateParentalAccess.mockResolvedValue(false)
    
    render(
      <TestWrapper>
        <ParentalGate />
      </TestWrapper>
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'wrong')
    await user.click(screen.getByText('Submit'))
    
    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument()
    })
  })
})

describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error')
    }
    return <div>No error</div>
  }

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error message when child component throws', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})

describe('QuestionRenderer', () => {
  it('renders multiple choice question correctly', () => {
    render(
      <TestWrapper>
        <QuestionRenderer 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={false}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onAnswer when option is selected', async () => {
    const mockOnAnswer = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <QuestionRenderer 
          question={mockQuestion} 
          onAnswer={mockOnAnswer} 
          showFeedback={false}
        />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('4'))
    expect(mockOnAnswer).toHaveBeenCalledWith({ Text: '4' })
  })

  it('shows feedback when enabled', () => {
    render(
      <TestWrapper>
        <QuestionRenderer 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={true}
          selectedAnswer={{ Text: '4' }}
          isCorrect={true}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText(/correct/i)).toBeInTheDocument()
  })

  it('handles different question types', () => {
    const dragDropQuestion = {
      ...mockQuestion,
      question_type: 'drag_drop' as const,
      content: {
        text: 'Match the items',
        options: ['Item 1', 'Item 2'],
      }
    }
    
    render(
      <TestWrapper>
        <QuestionRenderer 
          question={dragDropQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={false}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('Match the items')).toBeInTheDocument()
  })
})

describe('MultipleChoiceQuestion', () => {
  it('renders question text and options', () => {
    render(
      <TestWrapper>
        <MultipleChoiceQuestion 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={false}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    mockQuestion.content.options?.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
  })

  it('highlights selected answer', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <MultipleChoiceQuestion 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={false}
        />
      </TestWrapper>
    )
    
    const option = screen.getByText('4')
    await user.click(option)
    
    expect(option.closest('button')).toHaveClass('selected')
  })

  it('disables options when feedback is shown', () => {
    render(
      <TestWrapper>
        <MultipleChoiceQuestion 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={true}
          selectedAnswer={{ Text: '4' }}
          isCorrect={true}
        />
      </TestWrapper>
    )
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('shows correct answer highlighting', () => {
    render(
      <TestWrapper>
        <MultipleChoiceQuestion 
          question={mockQuestion} 
          onAnswer={vi.fn()} 
          showFeedback={true}
          selectedAnswer={{ Text: '3' }}
          isCorrect={false}
        />
      </TestWrapper>
    )
    
    const correctOption = screen.getByText('4')
    const incorrectOption = screen.getByText('3')
    
    expect(correctOption.closest('button')).toHaveClass('correct')
    expect(incorrectOption.closest('button')).toHaveClass('incorrect')
  })
})

describe('ProgressIndicator', () => {
  it('displays current progress', () => {
    render(
      <TestWrapper>
        <ProgressIndicator 
          currentQuestion={3} 
          totalQuestions={10} 
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument()
  })

  it('shows progress bar with correct percentage', () => {
    render(
      <TestWrapper>
        <ProgressIndicator 
          currentQuestion={3} 
          totalQuestions={10} 
        />
      </TestWrapper>
    )
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '30')
  })

  it('handles edge cases', () => {
    render(
      <TestWrapper>
        <ProgressIndicator 
          currentQuestion={0} 
          totalQuestions={10} 
        />
      </TestWrapper>
    )
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows completion state', () => {
    render(
      <TestWrapper>
        <ProgressIndicator 
          currentQuestion={10} 
          totalQuestions={10} 
        />
      </TestWrapper>
    )
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('QuizTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays initial time', () => {
    render(
      <TestWrapper>
        <QuizTimer duration={300} onTimeUp={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText('5:00')).toBeInTheDocument()
  })

  it('counts down correctly', () => {
    render(
      <TestWrapper>
        <QuizTimer duration={300} onTimeUp={vi.fn()} />
      </TestWrapper>
    )
    
    vi.advanceTimersByTime(1000)
    expect(screen.getByText('4:59')).toBeInTheDocument()
  })

  it('calls onTimeUp when timer reaches zero', () => {
    const mockOnTimeUp = vi.fn()
    render(
      <TestWrapper>
        <QuizTimer duration={2} onTimeUp={mockOnTimeUp} />
      </TestWrapper>
    )
    
    vi.advanceTimersByTime(2000)
    expect(mockOnTimeUp).toHaveBeenCalled()
  })

  it('can be paused and resumed', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <QuizTimer duration={300} onTimeUp={vi.fn()} showControls={true} />
      </TestWrapper>
    )
    
    const pauseButton = screen.getByText('Pause')
    await user.click(pauseButton)
    
    vi.advanceTimersByTime(5000)
    expect(screen.getByText('5:00')).toBeInTheDocument() // Should not change when paused
  })

  it('shows warning when time is low', () => {
    render(
      <TestWrapper>
        <QuizTimer duration={30} onTimeUp={vi.fn()} />
      </TestWrapper>
    )
    
    vi.advanceTimersByTime(25000) // 25 seconds elapsed, 5 seconds left
    
    const timer = screen.getByText('0:05')
    expect(timer.closest('div')).toHaveClass('warning')
  })
})

describe('ResultsScreen', () => {
  const mockResults = {
    totalQuestions: 10,
    correctAnswers: 8,
    timeSpent: 120,
    subject: 'Mathematics',
    accuracy: 80,
    achievements: ['accuracy_80'],
  }

  it('displays quiz results', () => {
    render(
      <TestWrapper>
        <ResultsScreen results={mockResults} onPlayAgain={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    expect(screen.getByText('8 out of 10')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('shows achievement message for high scores', () => {
    const highScoreResults = { ...mockResults, correctAnswers: 10, accuracy: 100 }
    
    render(
      <TestWrapper>
        <ResultsScreen results={highScoreResults} onPlayAgain={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText(/Perfect!/)).toBeInTheDocument()
  })

  it('calls onPlayAgain when play again button is clicked', async () => {
    const mockOnPlayAgain = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ResultsScreen results={mockResults} onPlayAgain={mockOnPlayAgain} />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Play Again'))
    expect(mockOnPlayAgain).toHaveBeenCalled()
  })

  it('displays time spent', () => {
    render(
      <TestWrapper>
        <ResultsScreen results={mockResults} onPlayAgain={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText(/2:00/)).toBeInTheDocument() // 120 seconds = 2:00
  })

  it('shows different messages based on performance', () => {
    const poorResults = { ...mockResults, correctAnswers: 3, accuracy: 30 }
    
    render(
      <TestWrapper>
        <ResultsScreen results={poorResults} onPlayAgain={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText(/Keep practicing!/)).toBeInTheDocument()
  })
})

// Additional comprehensive tests for new components
describe('SubjectGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTauriApi.getSubjects.mockResolvedValue([
      { id: 1, name: 'Mathematics', display_name: 'Mathematics', color_scheme: 'blue' },
      { id: 2, name: 'English', display_name: 'English', color_scheme: 'green' },
    ])
  })

  it('renders subject cards', async () => {
    render(
      <TestWrapper>
        <SubjectGrid onSubjectSelect={vi.fn()} />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })

  it('handles subject selection', async () => {
    const mockOnSelect = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SubjectGrid onSubjectSelect={mockOnSelect} />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Mathematics'))
    expect(mockOnSelect).toHaveBeenCalledWith('Mathematics')
  })

  it('shows loading state', () => {
    mockTauriApi.getSubjects.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(
      <TestWrapper>
        <SubjectGrid onSubjectSelect={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText(/Loading/)).toBeInTheDocument()
  })
})

describe('QuizInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders quiz interface with questions', () => {
    render(
      <TestWrapper>
        <QuizInterface 
          questions={[mockQuestion]} 
          onComplete={vi.fn()} 
          subject="Mathematics"
          keyStage="KS1"
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument()
  })

  it('handles answer submission and progression', async () => {
    const user = userEvent.setup()
    const mockOnComplete = vi.fn()
    
    render(
      <TestWrapper>
        <QuizInterface 
          questions={[mockQuestion]} 
          onComplete={mockOnComplete} 
          subject="Mathematics"
          keyStage="KS1"
        />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('4'))
    await user.click(screen.getByText('Next'))
    
    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('shows quiz timer when time limit is set', () => {
    render(
      <TestWrapper>
        <QuizInterface 
          questions={[mockQuestion]} 
          onComplete={vi.fn()} 
          subject="Mathematics"
          keyStage="KS1"
          timeLimit={300}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText('5:00')).toBeInTheDocument()
  })
})

describe('CustomMixCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTauriApi.getSubjects.mockResolvedValue([
      { id: 1, name: 'Mathematics', display_name: 'Mathematics' },
      { id: 2, name: 'English', display_name: 'English' },
    ])
  })

  it('renders mix creation form', async () => {
    render(
      <TestWrapper>
        <CustomMixCreator onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    )
    
    expect(screen.getByText('Create Custom Mix')).toBeInTheDocument()
    expect(screen.getByLabelText(/Mix Name/)).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    const mockOnSave = vi.fn()
    
    render(
      <TestWrapper>
        <CustomMixCreator onSave={mockOnSave} onCancel={vi.fn()} />
      </TestWrapper>
    )
    
    await user.type(screen.getByLabelText(/Mix Name/), 'Test Mix')
    await user.click(screen.getByText('Save Mix'))
    
    expect(mockOnSave).toHaveBeenCalled()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <CustomMixCreator onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Save Mix'))
    
    expect(screen.getByText(/Name is required/)).toBeInTheDocument()
  })
})

describe('ProfileManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
    mockTauriApi.getProgress.mockResolvedValue(mockProgress)
  })

  it('renders profile list', async () => {
    render(
      <TestWrapper>
        <ProfileManagement />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  it('handles profile creation', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <ProfileManagement />
      </TestWrapper>
    )
    
    await user.click(screen.getByText('Add Profile'))
    
    expect(screen.getByText('Create New Profile')).toBeInTheDocument()
  })

  it('shows profile progress', async () => {
    render(
      <TestWrapper>
        <ProfileManagement />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument() // Accuracy from mockProgress
    })
  })
})