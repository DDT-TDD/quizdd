import React, { useState } from 'react'
import { Question, Answer } from '../types/api'
import styles from './StoryQuizQuestion.module.css'

interface StoryQuizQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

export const StoryQuizQuestion: React.FC<StoryQuizQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showQuestion, setShowQuestion] = useState(false)
  
  const story = question.content.story || ''
  const questionText = question.content.text
  const options = question.content.options || []

  const handleReadStory = () => {
    setShowQuestion(true)
  }

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
    <div className={styles.container}>
      {!showQuestion ? (
        // Story Reading Phase
        <div className={styles.storyPhase}>
          <div className={styles.storyHeader}>
            <h2>Read the story carefully</h2>
            <p>You'll answer a question about it afterwards</p>
          </div>

          <div className={styles.storyContainer}>
            <div className={styles.storyContent}>
              {story.split('\n').map((paragraph, index) => (
                <p key={index} className={styles.storyParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {question.content.image_url && (
            <div className={styles.imageContainer}>
              <img 
                src={question.content.image_url} 
                alt="Story illustration"
                className={styles.storyImage}
              />
            </div>
          )}

          <div className={styles.storyControls}>
            <button
              className={styles.continueButton}
              onClick={handleReadStory}
              type="button"
            >
              I've finished reading - Show the question
            </button>
          </div>
        </div>
      ) : (
        // Question Phase
        <div className={styles.questionPhase}>
          <div className={styles.storyReference}>
            <div className={styles.storyToggle}>
              <details className={styles.storyDetails}>
                <summary className={styles.storySummary}>
                  📖 Click to review the story
                </summary>
                <div className={styles.storyReview}>
                  {story.split('\n').map((paragraph, index) => (
                    <p key={index} className={styles.reviewParagraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </div>

          <div className={styles.questionContent}>
            <div className={styles.questionText}>
              <h2>{questionText}</h2>
            </div>

            <div className={styles.optionsContainer}>
              {options.map((option, index) => (
                <button
                  key={index}
                  className={getOptionClassName(option)}
                  onClick={() => handleOptionClick(option)}
                  disabled={disabled}
                  type="button"
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
                      <span>Excellent reading comprehension!</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.feedbackIcon}>✗</span>
                      <span>Try reading the story again for clues!</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}