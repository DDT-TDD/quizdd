import React from 'react'
import { Achievement, AchievementCategory } from '../types/api'
import styles from './AchievementBadge.module.css'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  className?: string
}

interface AchievementGridProps {
  achievements: Achievement[]
  maxDisplay?: number
  className?: string
}

function getCategoryColor(category: AchievementCategory): string {
  const colors: Record<AchievementCategory, string> = {
    'accuracy': '#4CAF50',
    'streak': '#FF9800', 
    'completion': '#2196F3',
    'time': '#9C27B0',
    'subject_mastery': '#F44336'
  }
  return colors[category] || '#757575'
}

function getCategoryLabel(category: AchievementCategory): string {
  const labels: Record<AchievementCategory, string> = {
    'accuracy': 'Accuracy',
    'streak': 'Streak',
    'completion': 'Completion',
    'time': 'Speed',
    'subject_mastery': 'Mastery'
  }
  return labels[category] || 'Achievement'
}

export function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  showDetails = true,
  className 
}: AchievementBadgeProps) {
  const categoryColor = getCategoryColor(achievement.category)
  const categoryLabel = getCategoryLabel(achievement.category)
  
  return (
    <div 
      className={`${styles.achievementBadge} ${styles[size]} ${className || ''}`}
      style={{ '--category-color': categoryColor } as React.CSSProperties}
    >
      <div className={styles.badgeIcon}>
        <span role="img" aria-hidden="true">{achievement.icon}</span>
      </div>
      
      {showDetails && (
        <div className={styles.badgeContent}>
          <div className={styles.badgeHeader}>
            <h4 className={styles.badgeName}>{achievement.name}</h4>
            <span className={styles.categoryTag}>{categoryLabel}</span>
          </div>
          
          <p className={styles.badgeDescription}>{achievement.description}</p>
          
          <div className={styles.badgeFooter}>
            <span className={styles.earnedDate}>
              Earned {new Date(achievement.earned_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function AchievementGrid({ achievements, maxDisplay, className }: AchievementGridProps) {
  const displayAchievements = maxDisplay 
    ? achievements.slice(0, maxDisplay)
    : achievements

  const remainingCount = maxDisplay && achievements.length > maxDisplay 
    ? achievements.length - maxDisplay 
    : 0

  if (achievements.length === 0) {
    return (
      <div className={`${styles.achievementGrid} ${className || ''}`}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} role="img" aria-hidden="true">🏆</span>
          <h3>No Achievements Yet</h3>
          <p>Keep learning to unlock your first achievement!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.achievementGrid} ${className || ''}`}>
      <div className={styles.gridHeader}>
        <h3>Achievements</h3>
        <span className={styles.achievementCount}>
          {achievements.length} earned
        </span>
      </div>
      
      <div className={styles.badgeGrid}>
        {displayAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="small"
            showDetails={false}
          />
        ))}
        
        {remainingCount > 0 && (
          <div className={styles.moreIndicator}>
            <span className={styles.moreIcon}>+</span>
            <span className={styles.moreText}>{remainingCount} more</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Achievement unlock animation component
interface AchievementUnlockProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000) // Auto-close after 4 seconds
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={styles.achievementUnlock} onClick={onClose}>
      <div className={styles.unlockContent}>
        <div className={styles.unlockAnimation}>
          <span className={styles.unlockIcon} role="img" aria-hidden="true">
            🎉
          </span>
        </div>
        
        <div className={styles.unlockBadge}>
          <AchievementBadge 
            achievement={achievement} 
            size="large"
            showDetails={true}
          />
        </div>
        
        <div className={styles.unlockMessage}>
          <h2>Achievement Unlocked!</h2>
          <p>Tap anywhere to continue</p>
        </div>
      </div>
    </div>
  )
}