import React, { useEffect, useState } from 'react'
import styles from './QuizTimer.module.css'

interface QuizTimerProps {
  timeRemaining: number // in milliseconds
  totalTime: number // in milliseconds
  onTimeUp: () => void
  showWarning?: boolean
  warningThreshold?: number // in milliseconds
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  timeRemaining,
  totalTime,
  onTimeUp,
  showWarning = true,
  warningThreshold = 30000 // 30 seconds
}) => {
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  // Calculate time values
  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)
  const progressPercentage = (timeRemaining / totalTime) * 100

  // Update warning states
  useEffect(() => {
    if (showWarning) {
      setIsWarning(timeRemaining <= warningThreshold && timeRemaining > 10000)
      setIsCritical(timeRemaining <= 10000)
    }
  }, [timeRemaining, warningThreshold, showWarning])

  // Handle time up
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp()
    }
  }, [timeRemaining, onTimeUp])

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTimerClass = (): string => {
    let className = styles.timer
    if (isCritical) {
      className += ` ${styles.critical}`
    } else if (isWarning) {
      className += ` ${styles.warning}`
    }
    return className
  }

  return (
    <div className={getTimerClass()}>
      {/* Timer Icon */}
      <div className={styles.timerIcon}>
        ⏰
      </div>

      {/* Timer Display */}
      <div className={styles.timerDisplay}>
        <div className={styles.timeText}>
          {formatTime(minutes, seconds)}
        </div>
        
        {/* Progress Ring */}
        <div className={styles.progressRing}>
          <svg className={styles.progressSvg} viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              className={styles.progressBackground}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress circle */}
            <path
              className={`${styles.progressForeground} ${
                isCritical ? styles.criticalProgress : 
                isWarning ? styles.warningProgress : styles.normalProgress
              }`}
              strokeDasharray={`${progressPercentage}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>

      {/* Warning Messages */}
      {isWarning && !isCritical && (
        <div className={styles.warningMessage}>
          ⚠️ Time running low!
        </div>
      )}
      
      {isCritical && (
        <div className={styles.criticalMessage}>
          🚨 Almost out of time!
        </div>
      )}
    </div>
  )
}