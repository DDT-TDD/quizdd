import { useState, useEffect } from 'react'
import { contentService, ContentHelpers } from '../services/contentService'
import type { KeyStage } from '../types/api'
import styles from './DifficultySelector.module.css'

interface DifficultySelectorProps {
  subjectName: string
  keyStage: KeyStage
  selectedRange: [number, number]
  onRangeChange: (range: [number, number]) => void
  disabled?: boolean
}

export function DifficultySelector({
  subjectName,
  keyStage,
  selectedRange,
  onRangeChange,
  disabled = false
}: DifficultySelectorProps) {
  const [availableLevels, setAvailableLevels] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({})

  // Load available difficulty levels for the subject
  useEffect(() => {
    const loadDifficultyLevels = async () => {
      if (!subjectName) return

      try {
        setLoading(true)
        const levels = await contentService.getAvailableDifficultyLevels(subjectName, keyStage)
        setAvailableLevels(levels)

        // Get question counts for each difficulty level
        const counts: Record<number, number> = {}
        for (const level of levels) {
          const count = await contentService.getQuestionCount(
            subjectName,
            keyStage,
            [level, level]
          )
          counts[level] = count
        }
        setQuestionCounts(counts)
      } catch (error) {
        console.error('Failed to load difficulty levels:', error)
        setAvailableLevels([1, 2, 3]) // Default levels
      } finally {
        setLoading(false)
      }
    }

    loadDifficultyLevels()
  }, [subjectName, keyStage])

  // Handle individual level selection
  const handleLevelToggle = (level: number) => {
    if (disabled) return

    const [minLevel, maxLevel] = selectedRange
    
    // If this level is already selected as both min and max, deselect it
    if (minLevel === level && maxLevel === level) {
      // Find the next available level or reset to first level
      const nextLevel = availableLevels.find(l => l !== level) || availableLevels[0]
      onRangeChange([nextLevel, nextLevel])
      return
    }

    // If clicking on a level outside current range, expand range
    if (level < minLevel) {
      onRangeChange([level, maxLevel])
    } else if (level > maxLevel) {
      onRangeChange([minLevel, level])
    } else {
      // Clicking within range - set as single level
      onRangeChange([level, level])
    }
  }

  // Handle range slider changes
  const handleMinChange = (value: number) => {
    if (disabled) return
    const [, maxLevel] = selectedRange
    onRangeChange([value, Math.max(value, maxLevel)])
  }

  const handleMaxChange = (value: number) => {
    if (disabled) return
    const [minLevel] = selectedRange
    onRangeChange([Math.min(minLevel, value), value])
  }

  // Check if a level is selected
  const isLevelSelected = (level: number): boolean => {
    const [minLevel, maxLevel] = selectedRange
    return level >= minLevel && level <= maxLevel
  }

  // Get total questions in selected range
  const getTotalQuestionsInRange = (): number => {
    const [minLevel, maxLevel] = selectedRange
    return availableLevels
      .filter(level => level >= minLevel && level <= maxLevel)
      .reduce((total, level) => total + (questionCounts[level] || 0), 0)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Difficulty Level</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading difficulty levels...</span>
        </div>
      </div>
    )
  }

  if (availableLevels.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Difficulty Level</h3>
        </div>
        <div className={styles.noLevels}>
          <span>No difficulty levels available</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Difficulty Level</h3>
        <div className={styles.rangeInfo}>
          {selectedRange[0] === selectedRange[1] ? (
            <span className={styles.singleLevel}>
              {ContentHelpers.formatDifficultyLevel(selectedRange[0])}
            </span>
          ) : (
            <span className={styles.rangeLevel}>
              {ContentHelpers.formatDifficultyLevel(selectedRange[0])} - {ContentHelpers.formatDifficultyLevel(selectedRange[1])}
            </span>
          )}
          <span className={styles.questionCount}>
            ({getTotalQuestionsInRange()} questions)
          </span>
        </div>
      </div>

      {/* Level Buttons */}
      <div className={styles.levelButtons}>
        {availableLevels.map((level) => (
          <button
            key={level}
            className={`${styles.levelButton} ${
              isLevelSelected(level) ? styles.selected : ''
            }`}
            onClick={() => handleLevelToggle(level)}
            disabled={disabled}
            style={{
              backgroundColor: isLevelSelected(level) 
                ? ContentHelpers.getDifficultyColor(level)
                : undefined
            }}
            title={`${ContentHelpers.formatDifficultyLevel(level)} (${questionCounts[level] || 0} questions)`}
          >
            <div className={styles.levelNumber}>{level}</div>
            <div className={styles.levelLabel}>
              {ContentHelpers.formatDifficultyLevel(level)}
            </div>
            <div className={styles.levelCount}>
              {questionCounts[level] || 0}
            </div>
          </button>
        ))}
      </div>

      {/* Range Sliders */}
      <div className={styles.sliders}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Minimum Level: {ContentHelpers.formatDifficultyLevel(selectedRange[0])}
          </label>
          <input
            type="range"
            min={Math.min(...availableLevels)}
            max={Math.max(...availableLevels)}
            value={selectedRange[0]}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            disabled={disabled}
            className={styles.slider}
          />
        </div>
        
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Maximum Level: {ContentHelpers.formatDifficultyLevel(selectedRange[1])}
          </label>
          <input
            type="range"
            min={Math.min(...availableLevels)}
            max={Math.max(...availableLevels)}
            value={selectedRange[1]}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            disabled={disabled}
            className={styles.slider}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className={styles.presets}>
        <button
          className={styles.presetButton}
          onClick={() => onRangeChange([Math.min(...availableLevels), Math.min(...availableLevels)])}
          disabled={disabled}
        >
          Easiest Only
        </button>
        <button
          className={styles.presetButton}
          onClick={() => onRangeChange([Math.min(...availableLevels), Math.max(...availableLevels)])}
          disabled={disabled}
        >
          All Levels
        </button>
        <button
          className={styles.presetButton}
          onClick={() => onRangeChange([Math.max(...availableLevels), Math.max(...availableLevels)])}
          disabled={disabled}
        >
          Hardest Only
        </button>
      </div>
    </div>
  )
}