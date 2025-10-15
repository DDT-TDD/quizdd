import React, { useState } from 'react'
import { Question, Answer } from '../types/api'
import styles from './MultipleChoiceQuestion.module.css'

interface MultipleChoiceQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const options = question.content.options || []

  const handleOptionClick = (option: string) => {
    if (disabled) return
    
    setSelectedOption(option)
    onAnswer(option)
  }

  const getOptionClassName = (option: string) => {
    let className = styles.option
    
    if (selectedOption === option) {
      className += ` ${styles.selected}`
    }
    
    if (showFeedback && selectedOption === option) {
      className += isCorrect ? ` ${styles.correct}` : ` ${styles.incorrect}`
    }
    
    if (disabled) {
      className += ` ${styles.disabled}`
    }
    
    return className
  }

  return (
    <div className={`${styles.container} secure-question`}>
      <div className={`${styles.questionText} quiz-content`}>
        <h2>{question.content.text}</h2>
      </div>
      
      {question.content.image_url && (
        <div className={styles.imageContainer}>
          <img 
            src={question.content.image_url} 
            alt="Question illustration"
            className={`${styles.questionImage} secure-image interactive`}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      )}
      
      <div className={`${styles.optionsContainer} quiz-content`}>
        {options.map((option, index) => (
          <button
            key={index}
            className={getOptionClassName(option)}
            onClick={() => handleOptionClick(option)}
            disabled={disabled}
            type="button"
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className={styles.optionLetter}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={styles.optionText}>
              {option}
            </span>
          </button>
        ))}
      </div>
      
      {showFeedback && selectedOption && (
        <div className={styles.feedbackContainer}>
          <div className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? (
              <>
                <span className={styles.feedbackIcon}>✓</span>
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <span className={styles.feedbackIcon}>✗</span>
                <span>Not quite right. Try again!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}