import React, { useState, useCallback } from 'react'
import { Question, Answer } from '../types/api'
import styles from './DragDropQuestion.module.css'

interface DragDropQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

interface DragItem {
  id: string
  content: string
  originalIndex: number
}

interface DropZone {
  id: string
  label: string
  acceptedItem?: DragItem
}

export const DragDropQuestion: React.FC<DragDropQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  // Parse drag-drop data from question content
  const dragItems: DragItem[] = (question.content.options || []).map((option, index) => ({
    id: `item-${index}`,
    content: option,
    originalIndex: index
  }))

  // Create drop zones based on additional_data or default zones
  const dropZoneCount = question.content.additional_data?.drop_zones || dragItems.length
  const dropZoneLabels = question.content.additional_data?.zone_labels || 
    Array.from({ length: dropZoneCount }, (_, i) => `Zone ${i + 1}`)

  const [dropZones, setDropZones] = useState<DropZone[]>(
    dropZoneLabels.map((label: string, index: number) => ({
      id: `zone-${index}`,
      label,
      acceptedItem: undefined
    }))
  )

  const [availableItems, setAvailableItems] = useState<DragItem[]>(dragItems)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)

  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, item: DragItem) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    // Set transfer data so browsers treat the element as draggable
    event.dataTransfer.setData('text/plain', item.id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggedItem(item)
  }, [disabled])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>, zoneId: string) => {
    event.preventDefault()

    if (!draggedItem || disabled) {
      return
    }

    const zoneIndex = dropZones.findIndex(zone => zone.id === zoneId)
    if (zoneIndex === -1) {
      return
    }

    const existingItem = dropZones[zoneIndex].acceptedItem

    setAvailableItems(prev => {
      const withoutDragged = prev.filter(item => item.id !== draggedItem.id)
      return existingItem
        ? [...withoutDragged, existingItem]
        : withoutDragged
    })

    let updatedZonesSnapshot: DropZone[] = []
    setDropZones(prev => {
      const next = prev.map((zone, index) =>
        index === zoneIndex
          ? { ...zone, acceptedItem: draggedItem }
          : zone
      )
      updatedZonesSnapshot = next
      return next
    })

    setDraggedItem(null)

    if (updatedZonesSnapshot.length > 0 && updatedZonesSnapshot.every(zone => zone.acceptedItem)) {
      const orderedItems = updatedZonesSnapshot.map(zone => zone.acceptedItem!.content)
      onAnswer(orderedItems.join(','))
    }
  }, [draggedItem, disabled, dropZones, onAnswer])

  const handleItemReturn = useCallback((item: DragItem) => {
    if (disabled) return

    // Remove item from drop zone
    setDropZones(prev => prev.map(zone => 
      zone.acceptedItem?.id === item.id 
        ? { ...zone, acceptedItem: undefined }
        : zone
    ))

    // Return item to available items
    setAvailableItems(prev => [...prev, item])
  }, [disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.questionText}>
        <h2>{question.content.text}</h2>
      </div>

      {question.content.image_url && (
        <div className={styles.imageContainer}>
          <img 
            src={question.content.image_url} 
            alt="Question illustration"
            className={styles.questionImage}
          />
        </div>
      )}

      <div className={styles.gameArea}>
        {/* Available Items */}
        <div className={styles.itemsContainer}>
          <h3 className={styles.sectionTitle}>Drag these items:</h3>
          <div className={styles.availableItems}>
            {availableItems.map(item => (
              <div
                key={item.id}
                className={`${styles.dragItem} ${draggedItem?.id === item.id ? styles.dragging : ''}`}
                draggable={!disabled}
                onDragStart={(event) => handleDragStart(event, item)}
                onDragEnd={handleDragEnd}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className={styles.zonesContainer}>
          <h3 className={styles.sectionTitle}>Drop them here:</h3>
          <div className={styles.dropZones}>
            {dropZones.map(zone => (
              <div
                key={zone.id}
                className={`${styles.dropZone} ${zone.acceptedItem ? styles.filled : ''}`}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, zone.id)}
              >
                <div className={styles.zoneLabel}>{zone.label}</div>
                {zone.acceptedItem && (
                  <div 
                    className={styles.droppedItem}
                    onClick={() => handleItemReturn(zone.acceptedItem!)}
                  >
                    {zone.acceptedItem.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFeedback && (
        <div className={styles.feedbackContainer}>
          <div className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? (
              <>
                <span className={styles.feedbackIcon}>✓</span>
                <span>Perfect matching! Well done!</span>
              </>
            ) : (
              <>
                <span className={styles.feedbackIcon}>✗</span>
                <span>Some items are in the wrong place. Try again!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}