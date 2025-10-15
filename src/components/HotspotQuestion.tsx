import React, { useState, useRef, useCallback } from 'react'
import { Question, Answer, Coordinate } from '../types/api'
import styles from './HotspotQuestion.module.css'

interface HotspotQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

export const HotspotQuestion: React.FC<HotspotQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  const [clickedCoordinates, setClickedCoordinates] = useState<Coordinate[]>([])
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hotspots = question.content.hotspots || []
  const maxClicks = question.content.additional_data?.max_clicks || 1

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (disabled || clickedCoordinates.length >= maxClicks) return

    const image = imageRef.current
    if (!image) return

    const rect = image.getBoundingClientRect()
    
    // Calculate relative coordinates within the image
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newCoordinate: Coordinate = {
      x: Math.round(x * 100) / 100, // Round to 2 decimal places
      y: Math.round(y * 100) / 100
    }

    const updatedCoordinates = [...clickedCoordinates, newCoordinate]
    setClickedCoordinates(updatedCoordinates)

    // Submit answer immediately if we've reached the max clicks
    if (updatedCoordinates.length >= maxClicks) {
      onAnswer(updatedCoordinates)
    }
  }, [disabled, clickedCoordinates, maxClicks, onAnswer])

  const handleReset = useCallback(() => {
    if (disabled) return
    setClickedCoordinates([])
  }, [disabled])

  const handleSubmit = useCallback(() => {
    if (disabled || clickedCoordinates.length === 0) return
    onAnswer(clickedCoordinates)
  }, [disabled, clickedCoordinates, onAnswer])

  const renderClickMarkers = () => {
    return clickedCoordinates.map((coord, index) => (
      <div
        key={index}
        className={styles.clickMarker}
        style={{
          left: `${coord.x}%`,
          top: `${coord.y}%`
        }}
      >
        {index + 1}
      </div>
    ))
  }

  const renderHotspotOverlays = () => {
    if (!showFeedback) return null

    return hotspots.map((hotspot, index) => (
      <div
        key={index}
        className={`${styles.hotspotOverlay} ${isCorrect ? styles.correctOverlay : styles.incorrectOverlay}`}
        style={{
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          width: hotspot.width ? `${hotspot.width}%` : '20px',
          height: hotspot.height ? `${hotspot.height}%` : '20px'
        }}
        title={hotspot.label || `Hotspot ${index + 1}`}
      >
        {hotspot.label && (
          <div className={styles.hotspotLabel}>
            {hotspot.label}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className={styles.container}>
      <div className={styles.questionText}>
        <h2>{question.content.text}</h2>
      </div>

      <div className={styles.instructions}>
        <p>
          {maxClicks === 1 
            ? "Click on the correct area in the image"
            : `Click on up to ${maxClicks} areas in the image`
          }
        </p>
        {clickedCoordinates.length > 0 && (
          <p className={styles.clickCount}>
            Clicks: {clickedCoordinates.length} / {maxClicks}
          </p>
        )}
      </div>

      <div className={styles.imageContainer} ref={containerRef}>
        {question.content.image_url ? (
          <>
            <img
              ref={imageRef}
              src={question.content.image_url}
              alt="Interactive question image"
              className={styles.interactiveImage}
              onClick={handleImageClick}
              style={{ cursor: disabled ? 'default' : 'crosshair' }}
            />
            {renderClickMarkers()}
            {renderHotspotOverlays()}
          </>
        ) : (
          <div className={styles.noImage}>
            <p>No image provided for this hotspot question</p>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        {clickedCoordinates.length > 0 && !disabled && (
          <button
            className={styles.resetButton}
            onClick={handleReset}
            type="button"
          >
            Reset Clicks
          </button>
        )}
        
        {clickedCoordinates.length > 0 && clickedCoordinates.length < maxClicks && !disabled && (
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            type="button"
          >
            Submit Answer
          </button>
        )}
      </div>

      {showFeedback && (
        <div className={styles.feedbackContainer}>
          <div className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? (
              <>
                <span className={styles.feedbackIcon}>✓</span>
                <span>Great job! You found the correct spot!</span>
              </>
            ) : (
              <>
                <span className={styles.feedbackIcon}>✗</span>
                <span>Not quite right. Look for the highlighted areas!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}