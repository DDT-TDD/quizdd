import { useState, useEffect } from 'react'
import { Profile, Progress, Achievement } from '../types/api'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { ProgressChart } from './ProgressChart'
import { AchievementGrid, AchievementUnlock } from './AchievementBadge'
import styles from './ProfileDashboard.module.css'

interface ProfileDashboardProps {
  profile: Profile
  className?: string
}

interface ProgressStatsProps {
  progress: Progress
}

function ProgressStats({ progress }: ProgressStatsProps) {
  const overallAccuracy = progress.total_questions_answered > 0 
    ? Math.round((progress.total_correct_answers / progress.total_questions_answered) * 100)
    : 0

  const totalTimeSpent = Object.values(progress.subject_progress)
    .reduce((total, subject) => total + subject.time_spent_seconds, 0)

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getPerformanceLevel = (accuracy: number): { level: string; color: string; icon: string } => {
    if (accuracy >= 90) return { level: 'Excellent', color: '#4CAF50', icon: '🌟' }
    if (accuracy >= 80) return { level: 'Great', color: '#8BC34A', icon: '⭐' }
    if (accuracy >= 70) return { level: 'Good', color: '#FF9800', icon: '👍' }
    if (accuracy >= 60) return { level: 'Fair', color: '#FF5722', icon: '📈' }
    return { level: 'Keep Trying', color: '#9E9E9E', icon: '💪' }
  }

  const performance = getPerformanceLevel(overallAccuracy)

  return (
    <div className={styles.progressStats}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{progress.total_questions_answered}</div>
          <div className={styles.statLabel}>Questions Answered</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>✅</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{progress.total_correct_answers}</div>
          <div className={styles.statLabel}>Correct Answers</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div 
          className={styles.statIcon}
          style={{ backgroundColor: performance.color }}
        >
          {performance.icon}
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{overallAccuracy}%</div>
          <div className={styles.statLabel}>{performance.level}</div>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>⏱️</div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{formatTime(totalTimeSpent)}</div>
          <div className={styles.statLabel}>Time Spent</div>
        </div>
      </div>
    </div>
  )
}

export function ProfileDashboard({ profile, className }: ProfileDashboardProps) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    loadProgress()
  }, [profile.id])

  const loadProgress = async () => {
    if (!profile.id) return

    try {
      setLoading(true)
      setError(null)
      const progressData = await tauriAPI.getProgress(profile.id)
      setProgress(progressData)
      
      // Check for new achievements (simplified - in real app this would be more sophisticated)
      checkForNewAchievements(progressData)
    } catch (err) {
      console.error('Failed to load progress:', err)
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const checkForNewAchievements = (progressData: Progress) => {
    // Simple achievement checking logic
    // In a real app, this would be handled by the backend
    const overallAccuracy = progressData.total_questions_answered > 0 
      ? (progressData.total_correct_answers / progressData.total_questions_answered) * 100
      : 0

    // Check for "First Steps" achievement
    if (progressData.total_questions_answered >= 1 && 
        !progressData.achievements.some(a => a.id === 'first_steps')) {
      const achievement: Achievement = {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Answered your first question!',
        icon: '👶',
        earned_at: new Date().toISOString(),
        category: 'completion'
      }
      setNewAchievement(achievement)
    }

    // Check for "Perfect Score" achievement
    if (overallAccuracy === 100 && progressData.total_questions_answered >= 5 &&
        !progressData.achievements.some(a => a.id === 'perfect_score')) {
      const achievement: Achievement = {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Achieved 100% accuracy with at least 5 questions!',
        icon: '💯',
        earned_at: new Date().toISOString(),
        category: 'accuracy'
      }
      setNewAchievement(achievement)
    }
  }

  const handleAchievementClose = () => {
    setNewAchievement(null)
  }

  if (loading) {
    return (
      <div className={`${styles.profileDashboard} ${className || ''}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>⏳</div>
          <p>Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.profileDashboard} ${className || ''}`}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>❌</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={loadProgress}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className={`${styles.profileDashboard} ${className || ''}`}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>📊</div>
          <h3>No Progress Data</h3>
          <p>Complete some quizzes to see your progress here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.profileDashboard} ${className || ''}`}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <span role="img" aria-hidden="true">{profile.avatar}</span>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{profile.name}'s Progress</h2>
          <p className={styles.profileSubtitle}>
            Keep up the great learning!
          </p>
        </div>
      </div>

      {/* Progress Statistics */}
      <ProgressStats progress={progress} />

      {/* Progress Chart */}
      <div className={styles.chartSection}>
        <ProgressChart 
          subjectProgress={progress.subject_progress}
          className={styles.progressChart}
        />
      </div>

      {/* Achievements */}
      <div className={styles.achievementSection}>
        <AchievementGrid 
          achievements={progress.achievements}
          maxDisplay={8}
          className={styles.achievementGrid}
        />
      </div>

      {/* Subject Breakdown */}
      <div className={styles.subjectBreakdown}>
        <h3>Subject Details</h3>
        <div className={styles.subjectList}>
          {Object.entries(progress.subject_progress)
            .filter(([_, subjectProgress]) => subjectProgress.questions_answered > 0)
            .sort((a, b) => b[1].questions_answered - a[1].questions_answered)
            .map(([key, subjectProgress]) => (
              <div key={key} className={styles.subjectCard}>
                <div className={styles.subjectHeader}>
                  <h4>{subjectProgress.subject}</h4>
                  <span className={styles.keyStage}>{subjectProgress.key_stage}</span>
                </div>
                <div className={styles.subjectStats}>
                  <div className={styles.subjectStat}>
                    <span className={styles.statNumber}>{subjectProgress.questions_answered}</span>
                    <span className={styles.statText}>questions</span>
                  </div>
                  <div className={styles.subjectStat}>
                    <span className={styles.statNumber}>{subjectProgress.accuracy_percentage}%</span>
                    <span className={styles.statText}>accuracy</span>
                  </div>
                  <div className={styles.subjectStat}>
                    <span className={styles.statNumber}>
                      {Math.round(subjectProgress.time_spent_seconds / 60)}m
                    </span>
                    <span className={styles.statText}>time</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Achievement Unlock Modal */}
      {newAchievement && (
        <AchievementUnlock 
          achievement={newAchievement}
          onClose={handleAchievementClose}
        />
      )}
    </div>
  )
}