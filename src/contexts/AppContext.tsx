import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Profile, QuizConfig, Score, QuizSession } from '../types/api'

// Settings interface
export interface AppSettings {
  theme: 'default' | 'dark' | 'high-contrast'
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  soundEnabled: boolean
  animationsEnabled: boolean
  highContrastMode: boolean
  reducedMotion: boolean
  autoSave: boolean
  parentalControlsEnabled: boolean
}

// State interface
export interface AppState {
  // User and Profile Management
  currentProfile: Profile | null
  profiles: Profile[]
  
  // Theme and UI
  theme: 'default' | 'dark' | 'high-contrast'
  
  // Settings
  settings: AppSettings
  
  // Quiz State
  currentQuiz: {
    isActive: boolean
    subject?: string
    keyStage?: string
    questions: any[]
    currentQuestionIndex: number
    answers: Record<number, any>
    startTime?: Date
    timeLimit?: number
  }
  
  // Quiz Configuration
  quizConfig: QuizConfig | null
  
  // Navigation
  currentView: 'home' | 'subjects' | 'quiz' | 'results' | 'profile' | 'settings' | 'custom-mix'

  // Last quiz outcome
  lastScore: Score | null
  lastSession: QuizSession | null
  
  // Loading and Error States
  isLoading: boolean
  error: string | null
  
  // Parental Controls
  parentalGateActive: boolean
}

// Action types
export type AppAction =
  | { type: 'SET_CURRENT_PROFILE'; payload: Profile | null }
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'START_QUIZ'; payload: { subject: string; keyStage: string; questions: any[] } }
  | { type: 'END_QUIZ' }
  | { type: 'SET_CURRENT_QUESTION'; payload: number }
  | { type: 'SUBMIT_ANSWER'; payload: { questionIndex: number; answer: any } }
  | { type: 'SET_QUIZ_CONFIG'; payload: QuizConfig }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_PARENTAL_GATE'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'SET_LAST_RESULT'; payload: { score: Score | null; session: QuizSession | null } }

// Initial state
const initialState: AppState = {
  currentProfile: null,
  profiles: [],
  theme: 'default',
  settings: {
    theme: 'default',
    fontSize: 'medium',
    soundEnabled: true,
    animationsEnabled: true,
    highContrastMode: false,
    reducedMotion: false,
    autoSave: true,
    parentalControlsEnabled: true
  },
  currentQuiz: {
    isActive: false,
    questions: [],
    currentQuestionIndex: 0,
    answers: {}
  },
  quizConfig: null,
  currentView: 'subjects', // Start with subjects view to show subject selection
  isLoading: false, // Start with loading false
  error: null,
  parentalGateActive: false,
  lastScore: null,
  lastSession: null
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_PROFILE':
      return {
        ...state,
        currentProfile: action.payload
      }
    
    case 'SET_PROFILES':
      return {
        ...state,
        profiles: action.payload
      }
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        settings: {
          ...state.settings,
          theme: action.payload
        }
      }
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      }
    
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload
      }
    
    case 'START_QUIZ':
      return {
        ...state,
        currentQuiz: {
          isActive: true,
          subject: action.payload.subject,
          keyStage: action.payload.keyStage,
          questions: action.payload.questions,
          currentQuestionIndex: 0,
          answers: {},
          startTime: new Date()
        },
        currentView: 'quiz'
      }
    
    case 'END_QUIZ':
      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          isActive: false
        },
        currentView: 'results'
      }
    
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          currentQuestionIndex: action.payload
        }
      }
    
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          answers: {
            ...state.currentQuiz.answers,
            [action.payload.questionIndex]: action.payload.answer
          }
        }
      }
    
    case 'SET_QUIZ_CONFIG':
      return {
        ...state,
        quizConfig: action.payload
      }
    
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case 'TOGGLE_PARENTAL_GATE':
      return {
        ...state,
        parentalGateActive: action.payload
      }

    case 'SET_LAST_RESULT':
      return {
        ...state,
        lastScore: action.payload.score,
        lastSession: action.payload.session
      }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  console.log('🔍 Frontend: AppProvider initializing...')
  const [state, dispatch] = useReducer(appReducer, initialState)
  console.log('🔍 Frontend: AppProvider initial state:', { isLoading: state.isLoading, currentView: state.currentView })
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Action creators for common operations
export const appActions = {
  setCurrentProfile: (profile: Profile | null): AppAction => ({
    type: 'SET_CURRENT_PROFILE',
    payload: profile
  }),
  
  setProfiles: (profiles: Profile[]): AppAction => ({
    type: 'SET_PROFILES',
    payload: profiles
  }),
  
  setTheme: (theme: AppState['theme']): AppAction => ({
    type: 'SET_THEME',
    payload: theme
  }),
  
  startQuiz: (subject: string, keyStage: string, questions: any[]): AppAction => ({
    type: 'START_QUIZ',
    payload: { subject, keyStage, questions }
  }),
  
  endQuiz: (): AppAction => ({
    type: 'END_QUIZ'
  }),
  
  setCurrentQuestion: (index: number): AppAction => ({
    type: 'SET_CURRENT_QUESTION',
    payload: index
  }),
  
  submitAnswer: (questionIndex: number, answer: any): AppAction => ({
    type: 'SUBMIT_ANSWER',
    payload: { questionIndex, answer }
  }),
  
  setCurrentView: (view: AppState['currentView']): AppAction => ({
    type: 'SET_CURRENT_VIEW',
    payload: view
  }),
  
  setLoading: (loading: boolean): AppAction => ({
    type: 'SET_LOADING',
    payload: loading
  }),
  
  setError: (error: string | null): AppAction => ({
    type: 'SET_ERROR',
    payload: error
  }),
  
  toggleParentalGate: (active: boolean): AppAction => ({
    type: 'TOGGLE_PARENTAL_GATE',
    payload: active
  }),

  setLastResult: (score: Score | null, session: QuizSession | null): AppAction => ({
    type: 'SET_LAST_RESULT',
    payload: { score, session }
  }),
  
  setQuizConfig: (config: QuizConfig): AppAction => ({
    type: 'SET_QUIZ_CONFIG',
    payload: config
  }),
  
  updateSettings: (settings: Partial<AppSettings>): AppAction => ({
    type: 'UPDATE_SETTINGS',
    payload: settings
  }),
  
  setSettings: (settings: AppSettings): AppAction => ({
    type: 'SET_SETTINGS',
    payload: settings
  }),
  
  resetState: (): AppAction => ({
    type: 'RESET_STATE'
  })
}