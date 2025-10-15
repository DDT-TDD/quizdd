import React from 'react'
import { Question, Answer } from '../types/api'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import { DragDropQuestion } from './DragDropQuestion'
import { HotspotQuestion } from './HotspotQuestion'
import { FillInBlankQuestion } from './FillInBlankQuestion'
import { StoryQuizQuestion } from './StoryQuizQuestion'
import styles from './QuestionRenderer.module.css'

interface QuestionRendererProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
  timeRemaining?: number
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect,
  timeRemaining
}) => {
  const renderQuestionByType = () => {
    const commonProps = {
      question,
      onAnswer,
      disabled,
      showFeedback,
      isCorrect
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />
      
      case 'drag_drop':
        return <DragDropQuestion {...commonProps} />
      
      case 'hotspot':
        return <HotspotQuestion {...commonProps} />
      
      case 'fill_blank':
        return <FillInBlankQuestion {...commonProps} />
      
      case 'story_quiz':
        return <StoryQuizQuestion {...commonProps} />
      
      default:
        return (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              Unknown question type: {question.question_type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className={`${styles.questionContainer} secure-question`}>
      {timeRemaining !== undefined && (
        <div className={styles.timerContainer}>
          <div className={styles.timer}>
            Time: {Math.ceil(timeRemaining / 1000)}s
          </div>
        </div>
      )}
      
      <div className={`${styles.questionContent} quiz-content`}>
        {renderQuestionByType()}
      </div>
    </div>
  )
}