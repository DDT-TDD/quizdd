import { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { ProfileDashboard } from './ProfileDashboard'
import { UserProfileSelector } from './UserProfileSelector'
import styles from './ProfileManagement.module.css'

export function ProfileManagement() {
  const { state } = useAppContext()
  const { currentProfile } = state
  const [showDashboard, setShowDashboard] = useState(false)

  if (!currentProfile) {
    return (
      <div className={styles.profileManagement}>
        <div className={styles.noProfileState}>
          <div className={styles.noProfileIcon}>👤</div>
          <h2>No Profile Selected</h2>
          <p>Please select or create a profile to view progress and achievements.</p>
          <div className={styles.profileSelectorWrapper}>
            <UserProfileSelector />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profileManagement}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Profile & Progress</h1>
          <p>Track your learning journey and achievements</p>
        </div>
        <div className={styles.headerActions}>
          <UserProfileSelector />
          <button
            className={styles.dashboardToggle}
            onClick={() => setShowDashboard(!showDashboard)}
            aria-label={showDashboard ? "Hide dashboard" : "Show dashboard"}
          >
            {showDashboard ? "📊 Hide Dashboard" : "📈 Show Dashboard"}
          </button>
        </div>
      </div>

      {showDashboard ? (
        <ProfileDashboard 
          profile={currentProfile}
          className={styles.dashboard}
        />
      ) : (
        <div className={styles.quickStats}>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>
              <span role="img" aria-hidden="true">{currentProfile.avatar}</span>
            </div>
            <div className={styles.profileInfo}>
              <h2>{currentProfile.name}</h2>
              <p>Ready to learn something new?</p>
            </div>
          </div>
          
          <div className={styles.actionCards}>
            <button 
              className={styles.actionCard}
              onClick={() => setShowDashboard(true)}
            >
              <div className={styles.actionIcon}>📊</div>
              <div className={styles.actionContent}>
                <h3>View Progress</h3>
                <p>See your learning statistics and achievements</p>
              </div>
            </button>
            
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>🎯</div>
              <div className={styles.actionContent}>
                <h3>Start Quiz</h3>
                <p>Continue your learning journey</p>
              </div>
            </div>
            
            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>🎨</div>
              <div className={styles.actionContent}>
                <h3>Custom Mix</h3>
                <p>Create personalized quiz combinations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}