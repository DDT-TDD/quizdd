import React, { useEffect } from 'react'
import { AppProvider, useAppContext } from './contexts/AppContext'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import OfflineStatus from './components/OfflineStatus'
import { contentSeeder } from './services/contentSeeder'
import { audioService } from './services/audioService'
import styles from './App.module.css'

// Theme manager component
function ThemeManager() {
  const { state } = useAppContext()
  
  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', state.theme)
  }, [state.theme])

  return null
}

// Loading component
function LoadingScreen() {
  console.log('🔍 Frontend: LoadingScreen rendered')
  
  const [debugInfo, setDebugInfo] = React.useState<string[]>([])
  
  React.useEffect(() => {
    const logs: string[] = []
    logs.push(`Time: ${new Date().toLocaleTimeString()}`)
    logs.push(`Tauri: ${typeof window.__TAURI_INVOKE__}`)
    logs.push(`Location: ${window.location.href}`)
    setDebugInfo(logs)
  }, [])
  
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
      </div>
      <h2 className={styles.loadingText}>Loading QuiZDD...</h2>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        borderRadius: '5px',
        zIndex: 9999
      }}>
        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>🔍 DEBUG INFO:</div>
        {debugInfo.map((info, i) => (
          <div key={i}>{info}</div>
        ))}
        <div style={{marginTop: '10px', color: '#ff0'}}>
          Check browser console (F12) for detailed logs
        </div>
      </div>
    </div>
  )
}

// Error fallback component
function AppErrorFallback() {
  return (
    <div className={styles.errorFallback}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>😔</div>
        <h1>Something went wrong with QuiZDD</h1>
        <p>Please restart the application to continue learning!</p>
        <button 
          className={styles.restartButton}
          onClick={() => window.location.reload()}
        >
          Restart App
        </button>
      </div>
    </div>
  )
}

// Main app content
function AppContent() {
  const { state, dispatch } = useAppContext()

  // Initialize app with content seeding and profile loading
  useEffect(() => {
    console.log('🔍 Frontend: AppContent useEffect starting...')
    console.log('🔍 Frontend: Current loading state:', state.isLoading)
    
    // Set loading to false immediately to show the app
    console.log('🔍 Frontend: Setting loading to false...')
    dispatch({ type: 'SET_LOADING', payload: false })
    console.log('✅ Frontend: Loading set to false, app should be visible now')
    
    // Initialize content and profiles in background after app is shown
    setTimeout(async () => {
      try {
        console.log('🔍 Frontend: Starting background initialization...')
        
        // Use the fixed API wrapper that works with window.__TAURI_INVOKE__
        const { fixedTauriAPI } = await import('./api/tauri-fixed')
        console.log('🔍 Frontend: Fixed Tauri API imported')
        
        // Seed content only if database is empty (not on every startup)
        try {
          await contentSeeder.seedIfEmpty()
        } catch (seedError) {
          console.warn('⚠️ Frontend: Content seeding check failed:', seedError)
        }
        
        // Then load profiles
        console.log('🔍 Frontend: Loading profiles...')
        const profiles = await fixedTauriAPI.getAllProfiles()
        console.log('✅ Frontend: Profiles loaded successfully:', profiles)
        
        dispatch({ type: 'SET_PROFILES', payload: profiles })
        console.log('✅ Frontend: Profiles dispatched to state')
        
        if (profiles && profiles.length > 0) {
          dispatch({ type: 'SET_CURRENT_PROFILE', payload: profiles[0] })
          console.log('✅ Frontend: Current profile set:', profiles[0].name)
        }

        // Initialize audio service (start background music if enabled)
        try {
          if (audioService.getSettings().backgroundMusicEnabled) {
            audioService.playBackgroundMusic().catch(e => {
              console.log('Background music autoplay blocked by browser or files missing:', e)
              // Don't crash the app - audio is optional
            })
          }
        } catch (error) {
          console.warn('Audio service initialization failed:', error)
          // Continue without audio - it's not critical for app functionality
        }
      } catch (error) {
        console.error('❌ Frontend: Background initialization failed:', error)
        console.error('❌ Frontend: Error details:', error instanceof Error ? error.stack : 'Unknown error')
        // Don't show error, let user interact with app
      }
    }, 100) // Initialize after 100ms
  }, [dispatch])

  console.log('🔍 Frontend: AppContent render - isLoading:', state.isLoading, 'error:', state.error)

  // Debug overlay removed for production - no longer needed

  if (state.isLoading) {
    console.log('🔍 Frontend: Showing LoadingScreen')
    return <LoadingScreen />
  }

  if (state.error) {
    console.log('🔍 Frontend: Showing error screen for:', state.error)
    return (
      <div className={styles.errorFallback}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Initialization Error</h1>
          <p>{state.error}</p>
          <button 
            className={styles.restartButton}
            onClick={() => window.location.reload()}
          >
            Restart App
          </button>
        </div>
      </div>
    )
  }

  console.log('🔍 Frontend: Showing main app interface')
  
  return (
    <div className={styles.app}>
      <ThemeManager />
      {/* Show offline status when there are issues */}
      {state.error && (
        <OfflineStatus compact={true} />
      )}
      <AppShell />
    </div>
  )
}

// Root App component
function App() {
  console.log('🚀 APP.TSX: App component rendering...')
  
  return (
    <ErrorBoundary 
      fallback={<AppErrorFallback />}
      onError={(error, errorInfo) => {
        // Log critical app errors
        console.error('❌ APP.TSX: Critical app error:', error, errorInfo)
        // In a real app, this could send error reports to a logging service
      }}
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  )
}

console.log('✅ APP.TSX: App component defined and exported')
export default App