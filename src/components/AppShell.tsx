import React from 'react'
import { useAppContext } from '../contexts/AppContext'
import { NavigationBar } from './NavigationBar'
import { UserProfileSelector } from './UserProfileSelector'
import { ParentalGate } from './ParentalGate'
import { Router } from './Router'
import TransitionWrapper from './TransitionWrapper'
import styles from './AppShell.module.css'

interface AppShellProps {
  children?: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  console.log('🚀 APPSHELL: Component rendering...')
  const { state } = useAppContext()
  console.log('🔍 APPSHELL: State:', { 
    currentView: state.currentView, 
    parentalGateActive: state.parentalGateActive,
    profilesCount: state.profiles.length,
    currentProfile: state.currentProfile?.name
  })

  // Show parental gate if active
  if (state.parentalGateActive) {
    console.log('🔍 APPSHELL: Showing parental gate')
    return (
      <div className={styles.appShell}>
        <TransitionWrapper type="fade" duration={300}>
          <ParentalGate />
        </TransitionWrapper>
      </div>
    )
  }

  console.log('🔍 APPSHELL: Rendering main shell')
  return (
    <div className={styles.appShell}>
      {/* Header with navigation and profile selector */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <h1 className={styles.logo}>
              <span className={styles.logoIcon}>🎯</span>
              QuiZDD
            </h1>
          </div>
          
          <div className={styles.profileSection}>
            <UserProfileSelector />
          </div>
        </div>
        
        <NavigationBar />
      </header>

      {/* Main content area */}
      <main className={styles.main}>
        <TransitionWrapper type="fade" duration={300}>
          <div className={styles.content}>
            {children || <Router />}
          </div>
        </TransitionWrapper>
      </main>

      {/* Footer for additional info */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Keep learning and having fun! 🌟
          </p>
        </div>
      </footer>
    </div>
  )
}