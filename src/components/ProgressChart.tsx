
import { SubjectProgress } from '../types/api'
import styles from './ProgressChart.module.css'

interface ProgressChartProps {
  subjectProgress: Record<string, SubjectProgress>
  className?: string
}

interface ChartBarProps {
  subject: string
  keyStage: string
  accuracy: number
  questionsAnswered: number
  color: string
}

function ChartBar({ subject, keyStage, accuracy, questionsAnswered, color }: ChartBarProps) {
  const height = Math.max(accuracy, 5) // Minimum 5% height for visibility
  
  return (
    <div className={styles.chartBar}>
      <div className={styles.barContainer}>
        <div 
          className={styles.bar}
          style={{ 
            height: `${height}%`,
            backgroundColor: color,
          }}
        >
          <span className={styles.accuracyLabel}>
            {accuracy}%
          </span>
        </div>
      </div>
      <div className={styles.barLabel}>
        <div className={styles.subjectName}>{subject}</div>
        <div className={styles.keyStage}>{keyStage}</div>
        <div className={styles.questionCount}>
          {questionsAnswered} questions
        </div>
      </div>
    </div>
  )
}

export function ProgressChart({ subjectProgress, className }: ProgressChartProps) {
  const subjectColors: Record<string, string> = {
    'Mathematics': '#4CAF50',
    'Geography': '#2196F3', 
    'English': '#FF9800',
    'Science': '#9C27B0',
    'General Knowledge': '#F44336'
  }

  const progressEntries = Object.entries(subjectProgress)
    .filter(([_, progress]) => progress.questions_answered > 0)
    .sort((a, b) => b[1].accuracy_percentage - a[1].accuracy_percentage)

  if (progressEntries.length === 0) {
    return (
      <div className={`${styles.progressChart} ${className || ''}`}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} role="img" aria-hidden="true">📊</span>
          <h3>No Progress Yet</h3>
          <p>Complete some quizzes to see your progress here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.progressChart} ${className || ''}`}>
      <div className={styles.chartHeader}>
        <h3>Subject Progress</h3>
        <p>Your accuracy percentage by subject</p>
      </div>
      
      <div className={styles.chartContainer}>
        <div className={styles.yAxis}>
          <span className={styles.yLabel}>100%</span>
          <span className={styles.yLabel}>75%</span>
          <span className={styles.yLabel}>50%</span>
          <span className={styles.yLabel}>25%</span>
          <span className={styles.yLabel}>0%</span>
        </div>
        
        <div className={styles.chartBars}>
          {progressEntries.map(([key, progress]) => (
            <ChartBar
              key={key}
              subject={progress.subject}
              keyStage={progress.key_stage}
              accuracy={progress.accuracy_percentage}
              questionsAnswered={progress.questions_answered}
              color={subjectColors[progress.subject] || '#757575'}
            />
          ))}
        </div>
      </div>
      
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendIcon}>📈</span>
          <span>Higher bars = better accuracy</span>
        </div>
      </div>
    </div>
  )
}