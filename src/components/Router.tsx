// Router component for handling navigation between different app sections
import { useState, useEffect } from 'react'
import { useAppContext, AppState } from '../contexts/AppContext'
import { Score, QuizSession } from '../types/api'
import { ErrorBoundary, QuizErrorBoundary } from './ErrorBoundary'
import { QuizInterface } from './QuizInterface'
import { ResultsScreen } from './ResultsScreen'
import { SubjectGrid } from './SubjectGrid'
import { CustomMixSelector } from './CustomMixSelector'
import { CustomMixCreator } from './CustomMixCreator'
import { CustomMixManager } from './CustomMixManager'
import { SettingsPanel } from './SettingsPanel'

// Placeholder components for different views
// These will be implemented in later tasks
const HomeView = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>🏠 Welcome to QuiZDD!</h1>
    <p>Select your profile to get started</p>
  </div>
)

const SubjectsView = () => <SubjectGrid />

// Quiz View with actual QuizInterface component
const QuizView = () => {
  const { state, dispatch } = useAppContext()
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load quiz questions when component mounts
  useEffect(() => {
    const loadQuizSession = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get quiz config from state or use default
        const config = state.quizConfig || {
          subject: 'Mathematics',
          key_stage: 'KS1' as const,
          question_count: 10,
          time_limit_seconds: 300,
          randomize_questions: true,
          randomize_answers: true
        }

        if (!state.currentProfile) {
          throw new Error('Please select a profile first')
        }

        // Use the proper Tauri API to start a quiz session
        const { fixedTauriAPI } = await import('../api/tauri-fixed')
        const session = await fixedTauriAPI.startQuizSession(state.currentProfile.id!, config)

        setQuizSession(session)
      } catch (err) {
        console.error('Failed to load quiz session:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuizSession()
  }, [state.quizConfig, state.currentProfile])

  const handleQuizComplete = (score: Score, completedSession: QuizSession) => {
    dispatch({
      type: 'SET_LAST_RESULT',
      payload: { score, session: completedSession }
    })
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'results' })
  }

  const handleQuizExit = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Quiz...</h2>
        <p>Preparing your questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Quiz Loading Error</h2>
        <p>{error}</p>
        <button onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })}>
          Back to Subjects
        </button>
      </div>
    )
  }

  if (!quizSession) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No Quiz Session</h2>
        <p>Unable to create quiz session</p>
        <button onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })}>
          Back to Subjects
        </button>
      </div>
    )
  }

  return (
    <QuizInterface
      session={quizSession}
      onQuizComplete={handleQuizComplete}
      onQuizExit={handleQuizExit}
    />
  )
}

// Results View with actual ResultsScreen component
const ResultsView = () => {
  const { state, dispatch } = useAppContext()

  if (!state.lastScore || !state.lastSession) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No Results Available</h2>
        <p>Start a quiz to see your results here.</p>
        <button onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })}>
          Back to Subjects
        </button>
      </div>
    )
  }

  const resumePreviousConfig = () => {
    if (state.lastSession) {
      dispatch({ type: 'SET_QUIZ_CONFIG', payload: state.lastSession.config })
    }
    dispatch({ type: 'SET_LAST_RESULT', payload: { score: null, session: null } })
  }

  const handleRestart = () => {
    resumePreviousConfig()
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'quiz' })
  }

  const handleContinue = () => {
    resumePreviousConfig()
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'quiz' })
  }

  const handleExit = () => {
    dispatch({ type: 'SET_LAST_RESULT', payload: { score: null, session: null } })
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'subjects' })
  }

  return (
    <ResultsScreen
      score={state.lastScore}
      session={state.lastSession}
      onContinue={handleContinue}
      onRestart={handleRestart}
      onExit={handleExit}
    />
  )
}

const ProfileView = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>👤 Your Profile</h1>
    <p>View your progress and achievements</p>
  </div>
)

const SettingsView = () => {
  return <SettingsPanel />
}

const CustomMixView = () => {
  const { state } = useAppContext()
  const [showManager, setShowManager] = useState(false)
  const [showCreator, setShowCreator] = useState(false)

  const handleMixSelected = (mix: any) => {
    // TODO: Start quiz with selected mix
    console.log('Selected mix:', mix)
  }

  if (showManager) {
    return (
      <CustomMixManager
        onClose={() => setShowManager(false)}
        currentProfileId={state.currentProfile?.id || 1}
      />
    )
  }

  if (showCreator) {
    return (
      <CustomMixCreator
        onMixCreated={() => setShowCreator(false)}
        onCancel={() => setShowCreator(false)}
        currentProfileId={state.currentProfile?.id || 1}
      />
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🎨 Custom Quiz Mixes</h1>
        <button 
          onClick={() => setShowManager(true)}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Manage Mixes
        </button>
      </div>
      <CustomMixSelector
        onMixSelected={handleMixSelected}
        onCreateNew={() => setShowCreator(true)}
        currentProfileId={state.currentProfile?.id || 1}
        showCreateButton={false}
      />
    </div>
  )
}

// Main router component
export function Router() {
  const { state } = useAppContext()
  const { currentView } = state

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <ErrorBoundary>
            <HomeView />
          </ErrorBoundary>
        )
      
      case 'subjects':
        return (
          <ErrorBoundary>
            <SubjectsView />
          </ErrorBoundary>
        )
      
      case 'quiz':
        return (
          <QuizErrorBoundary onQuizError={() => {
            // This would navigate back to home - will be implemented with navigation actions
            console.log('Quiz error occurred, should navigate to home')
          }}>
            <QuizView />
          </QuizErrorBoundary>
        )
      
      case 'results':
        return (
          <ErrorBoundary>
            <ResultsView />
          </ErrorBoundary>
        )
      
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileView />
          </ErrorBoundary>
        )
      
      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsView />
          </ErrorBoundary>
        )
      
      case 'custom-mix':
        return (
          <ErrorBoundary>
            <CustomMixView />
          </ErrorBoundary>
        )
      
      default:
        return (
          <ErrorBoundary>
            <HomeView />
          </ErrorBoundary>
        )
    }
  }

  return (
    <main role="main">
      {renderView()}
    </main>
  )
}

// Navigation helper hook
export function useNavigation() {
  const { dispatch } = useAppContext()

  const navigateTo = (view: AppState['currentView']) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view })
  }

  const goHome = () => navigateTo('home')
  const goToSubjects = () => navigateTo('subjects')
  const goToQuiz = () => navigateTo('quiz')
  const goToResults = () => navigateTo('results')
  const goToProfile = () => navigateTo('profile')
  const goToSettings = () => navigateTo('settings')
  const goToCustomMix = () => navigateTo('custom-mix')

  return {
    navigateTo,
    goHome,
    goToSubjects,
    goToQuiz,
    goToResults,
    goToProfile,
    goToSettings,
    goToCustomMix
  }
}