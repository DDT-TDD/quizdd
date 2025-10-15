import React, { useEffect, useState } from 'react'
import { Score, QuizSession } from '../types/api'
import ProgressAnimation from './ProgressAnimation'
import RewardAnimation from './RewardAnimation'
import TransitionWrapper from './TransitionWrapper'
import styles from './ResultsScreen.module.css'

interface ResultsScreenProps {
  score: Score
  session: QuizSession
  onContinue: () => void
  onRestart: () => void
  onExit: () => void
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  session,
  onContinue,
  onRestart,
  onExit
}) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setShowAnimation(true)
    }, 100)

    // Show details after main animation
    const detailsTimer = setTimeout(() => {
      setShowDetails(true)
    }, 1000)

    // Show reward animation for excellent performance
    const rewardTimer = setTimeout(() => {
      if (score.performance_level === 'Excellent') {
        setShowRewardAnimation(true)
      }
    }, 1500)

    return () => {
      clearTimeout(timer)
      clearTimeout(detailsTimer)
      clearTimeout(rewardTimer)
    }
  }, [])

  const getPerformanceEmoji = (level: string): string => {
    switch (level) {
      case 'Excellent': return '🌟'
      case 'Good': return '👍'
      case 'Fair': return '👌'
      case 'NeedsImprovement': return '💪'
      case 'Poor': return '📚'
      default: return '🎯'
    }
  }

  const getPerformanceMessage = (level: string): string => {
    switch (level) {
      case 'Excellent': return 'Outstanding work!'
      case 'Good': return 'Great job!'
      case 'Fair': return 'Good effort!'
      case 'NeedsImprovement': return 'Keep practicing!'
      case 'Poor': return 'Don\'t give up!'
      default: return 'Well done!'
    }
  }

  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case 'Excellent': return 'var(--color-success)'
      case 'Good': return 'var(--color-primary)'
      case 'Fair': return 'var(--color-secondary)'
      case 'NeedsImprovement': return 'var(--color-warning)'
      case 'Poor': return 'var(--color-danger)'
      default: return 'var(--color-primary)'
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={`${styles.resultsCard} ${showAnimation ? styles.animated : ''}`}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.performanceEmoji}>
            {getPerformanceEmoji(score.performance_level)}
          </div>
          <h1 className={styles.title}>Quiz Complete!</h1>
          <p className={styles.message}>
            {getPerformanceMessage(score.performance_level)}
          </p>
        </div>

        {/* Main Score Display */}
        <div className={styles.mainScore}>
          <ProgressAnimation
            progress={score.accuracy_percentage}
            type="circular"
            size="large"
            color={getPerformanceColor(score.performance_level)}
            showPercentage={true}
            animated={true}
          />
          
          <div className={styles.correctAnswers}>
            <span className={styles.correctCount}>{score.correct_answers}</span>
            <span className={styles.totalCount}>/{score.total_questions}</span>
            <div className={styles.correctLabel}>Correct</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <TransitionWrapper
          type="slide"
          direction="up"
          duration={500}
          isVisible={showDetails}
        >
          <div className={styles.detailsSection}>
            <div className={styles.statsGrid}>
              
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statValue}>{score.final_score}</div>
                <div className={styles.statLabel}>Total Points</div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>⚡</div>
                <div className={styles.statValue}>{score.time_bonus}</div>
                <div className={styles.statLabel}>Time Bonus</div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>🔥</div>
                <div className={styles.statValue}>{score.streak_bonus}</div>
                <div className={styles.statLabel}>Streak Bonus</div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>⏱️</div>
                <div className={styles.statValue}>
                  {formatTime(session.total_time_seconds)}
                </div>
                <div className={styles.statLabel}>Time Taken</div>
              </div>

            </div>

            {/* Subject Info */}
            <div className={styles.subjectInfo}>
              <div className={styles.subjectIcon}>📚</div>
              <div className={styles.subjectText}>
                <div className={styles.subjectName}>{session.config.subject}</div>
                <div className={styles.keyStage}>Key Stage {session.config.key_stage}</div>
              </div>
            </div>

            {/* Achievements */}
            {score.achievements && score.achievements.length > 0 && (
              <div className={styles.achievementsSection}>
                <h3 className={styles.achievementsTitle}>🏆 New Achievements!</h3>
                <div className={styles.achievementsList}>
                  {score.achievements.map((achievement, index) => (
                    <div key={index} className={styles.achievement}>
                      <span className={styles.achievementIcon}>🎖️</span>
                      <span className={styles.achievementName}>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TransitionWrapper>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.continueButton}
            onClick={onContinue}
          >
            <span className={styles.buttonIcon}>➡️</span>
            Continue Quiz
          </button>

          <button 
            className={styles.restartButton}
            onClick={onRestart}
          >
            <span className={styles.buttonIcon}>🔄</span>
            Try Again
          </button>
          
          <button 
            className={styles.exitButton}
            onClick={onExit}
          >
            <span className={styles.buttonIcon}>🏠</span>
            Back to Menu
          </button>
        </div>

      </div>

      {/* Reward Animation */}
      <RewardAnimation
        type={score.performance_level === 'Excellent' ? 'achievement' : 'success'}
        isVisible={showRewardAnimation}
        onComplete={() => setShowRewardAnimation(false)}
        size="large"
      />

      {/* Celebration Animation */}
      {showAnimation && score.performance_level === 'Excellent' && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.confetti}>
            {Array.from({ length: 20 }, (_, i) => (
              <div 
                key={i} 
                className={styles.confettiPiece}
                style={{
                  '--delay': `${i * 0.1}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--color': `hsl(${Math.random() * 360}, 70%, 60%)`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}