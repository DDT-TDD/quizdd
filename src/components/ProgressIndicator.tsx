import React from 'react'
import ProgressAnimation from './ProgressAnimation'
import styles from './ProgressIndicator.module.css'

interface ProgressIndicatorProps {
  currentQuestion: number
  totalQuestions: number
  correctAnswers: number
  showAccuracy?: boolean
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentQuestion,
  totalQuestions,
  correctAnswers,
  showAccuracy = true
}) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100
  const accuracy = currentQuestion > 1 ? Math.round((correctAnswers / (currentQuestion - 1)) * 100) : 0

  return (
    <div className={styles.progressContainer}>
      {/* Question Counter */}
      <div className={styles.questionCounter}>
        <span className={styles.currentQuestion}>{currentQuestion}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.totalQuestions}>{totalQuestions}</span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Question markers */}
          <div className={styles.questionMarkers}>
            {Array.from({ length: totalQuestions }, (_, index) => (
              <div
                key={index}
                className={`${styles.questionMarker} ${
                  index < currentQuestion - 1 ? styles.completed : ''
                } ${
                  index === currentQuestion - 1 ? styles.current : ''
                }`}
                style={{ left: `${((index + 1) / totalQuestions) * 100}%` }}
              />
            ))}
          </div>
        </div>
        
        {/* Progress label */}
        <div className={styles.progressLabel}>
          Progress: {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Accuracy Display */}
      {showAccuracy && currentQuestion > 1 && (
        <div className={styles.accuracyContainer}>
          <div className={styles.accuracyIcon}>🎯</div>
          <div className={styles.accuracyText}>
            <ProgressAnimation
              progress={accuracy}
              type="circular"
              size="small"
              color={accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#f44336'}
              showPercentage={true}
            />
            <span className={styles.accuracyLabel}>Accuracy</span>
          </div>
        </div>
      )}

      {/* Correct Answers Counter */}
      <div className={styles.scoreContainer}>
        <div className={styles.scoreIcon}>⭐</div>
        <div className={styles.scoreText}>
          <span className={styles.scoreValue}>{correctAnswers}</span>
          <span className={styles.scoreLabel}>Correct</span>
        </div>
      </div>
    </div>
  )
}