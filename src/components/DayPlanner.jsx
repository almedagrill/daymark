import { useState, useEffect, useRef } from 'react'
import { useDayPlans } from '../hooks/useLocalStorage'

const TOTAL_SLOTS = 34 // 5 AM to 9:30 PM (17 hours × 2)
const SLOT_HEIGHT = 40 // pixels per 30-min slot
const START_HOUR = 5

function slotToTime(slot) {
  const totalMinutes = slot * 30 + START_HOUR * 60
  const hour = Math.floor(totalMinutes / 60)
  const min = totalMinutes % 60
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  if (min === 0) {
    return `${displayHour} ${ampm}`
  }
  return `${displayHour}:${min.toString().padStart(2, '0')}`
}

function DayPlanner() {
  const { getTodayKey, getDayPlan, saveDayPlan } = useDayPlans()
  const [dateKey, setDateKey] = useState(getTodayKey())
  const [dayPlan, setDayPlan] = useState({ blocks: [] })
  const [editingBlockId, setEditingBlockId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [draggingBlock, setDraggingBlock] = useState(null)
  const [resizingBlock, setResizingBlock] = useState(null)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartSlot, setDragStartSlot] = useState(0)
  const [dragStartDuration, setDragStartDuration] = useState(0)
  const gridRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setDayPlan(getDayPlan(dateKey))
  }, [dateKey])

  useEffect(() => {
    if (editingBlockId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingBlockId])

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const navigateDay = (direction) => {
    const current = new Date(dateKey + 'T00:00:00')
    current.setDate(current.getDate() + direction)
    setDateKey(current.toISOString().split('T')[0])
  }

  const isToday = dateKey === getTodayKey()

  // Check if a slot is occupied by any block
  const isSlotOccupied = (slot, excludeBlockId = null) => {
    return dayPlan.blocks.some(block => {
      if (block.id === excludeBlockId) return false
      return slot >= block.startSlot && slot < block.startSlot + block.duration
    })
  }

  // Find the next block after a given slot
  const getNextBlockStart = (fromSlot, excludeBlockId = null) => {
    let nextStart = TOTAL_SLOTS
    dayPlan.blocks.forEach(block => {
      if (block.id === excludeBlockId) return
      if (block.startSlot > fromSlot && block.startSlot < nextStart) {
        nextStart = block.startSlot
      }
    })
    return nextStart
  }

  // Find max duration for a block (until next block or end of day)
  const getMaxDuration = (startSlot, excludeBlockId = null) => {
    const nextBlockStart = getNextBlockStart(startSlot, excludeBlockId)
    return nextBlockStart - startSlot
  }

  // Handle clicking empty slot to create block
  const handleSlotClick = (slot) => {
    if (isSlotOccupied(slot)) return

    const newBlockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const newBlock = {
      id: newBlockId,
      title: '',
      startSlot: slot,
      duration: 1
    }

    // Update local state immediately
    const updatedPlan = {
      blocks: [...dayPlan.blocks, newBlock]
    }
    setDayPlan(updatedPlan)

    // Persist to storage
    saveDayPlan(dateKey, updatedPlan)

    // Start editing the new block
    setEditingBlockId(newBlockId)
    setEditingTitle('')
  }

  // Handle block title editing
  const handleBlockClick = (e, block) => {
    e.stopPropagation()
    setEditingBlockId(block.id)
    setEditingTitle(block.title)
  }

  const handleTitleChange = (e) => {
    setEditingTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    if (editingBlockId) {
      let updatedPlan
      if (editingTitle.trim()) {
        updatedPlan = {
          blocks: dayPlan.blocks.map(b =>
            b.id === editingBlockId ? { ...b, title: editingTitle.trim() } : b
          )
        }
      } else {
        // Delete block if title is empty
        updatedPlan = {
          blocks: dayPlan.blocks.filter(b => b.id !== editingBlockId)
        }
      }
      setDayPlan(updatedPlan)
      saveDayPlan(dateKey, updatedPlan)
      setEditingBlockId(null)
      setEditingTitle('')
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditingBlockId(null)
      setEditingTitle('')
    }
  }

  // Handle block deletion
  const handleDeleteBlock = (e, blockId) => {
    e.stopPropagation()
    const updatedPlan = {
      blocks: dayPlan.blocks.filter(b => b.id !== blockId)
    }
    setDayPlan(updatedPlan)
    saveDayPlan(dateKey, updatedPlan)
  }

  // Toggle block completion
  const handleToggleComplete = (e, blockId) => {
    e.stopPropagation()
    const updatedPlan = {
      blocks: dayPlan.blocks.map(b =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      )
    }
    setDayPlan(updatedPlan)
    saveDayPlan(dateKey, updatedPlan)
  }

  // Drag to move
  const handleDragStart = (e, block) => {
    if (editingBlockId === block.id) return
    e.preventDefault()
    setDraggingBlock(block.id)
    setDragStartY(e.clientY)
    setDragStartSlot(block.startSlot)
  }

  const handleDragMove = (e) => {
    if (!draggingBlock && !resizingBlock) return

    const deltaY = e.clientY - dragStartY
    const deltaSlots = Math.round(deltaY / SLOT_HEIGHT)

    if (draggingBlock) {
      let newSlot = dragStartSlot + deltaSlots
      // Clamp to valid range
      const block = dayPlan.blocks.find(b => b.id === draggingBlock)
      if (!block) return

      newSlot = Math.max(0, Math.min(newSlot, TOTAL_SLOTS - block.duration))

      // Check for overlaps
      let canMove = true
      for (let s = newSlot; s < newSlot + block.duration; s++) {
        if (isSlotOccupied(s, draggingBlock)) {
          canMove = false
          break
        }
      }

      if (canMove && newSlot !== block.startSlot) {
        const updatedPlan = {
          blocks: dayPlan.blocks.map(b =>
            b.id === draggingBlock ? { ...b, startSlot: newSlot } : b
          )
        }
        setDayPlan(updatedPlan)
        saveDayPlan(dateKey, updatedPlan)
      }
    }

    if (resizingBlock) {
      const block = dayPlan.blocks.find(b => b.id === resizingBlock)
      if (!block) return

      let newDuration = dragStartDuration + deltaSlots
      const maxDuration = getMaxDuration(block.startSlot, resizingBlock)
      newDuration = Math.max(1, Math.min(newDuration, maxDuration))

      if (newDuration !== block.duration) {
        const updatedPlan = {
          blocks: dayPlan.blocks.map(b =>
            b.id === resizingBlock ? { ...b, duration: newDuration } : b
          )
        }
        setDayPlan(updatedPlan)
        saveDayPlan(dateKey, updatedPlan)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggingBlock(null)
    setResizingBlock(null)
  }

  // Resize handle
  const handleResizeStart = (e, block) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingBlock(block.id)
    setDragStartY(e.clientY)
    setDragStartDuration(block.duration)
  }

  // Generate time slot labels
  const timeSlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i)

  return (
    <div
      className="day-planner"
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      <div className="day-header">
        <button className="nav-arrow" onClick={() => navigateDay(-1)}>←</button>
        <div className="day-title">
          <h2>Day Plan</h2>
          <span className="day-date-label">{formatDate(dateKey)}</span>
        </div>
        <button className="nav-arrow" onClick={() => navigateDay(1)}>→</button>
      </div>

      {!isToday && (
        <button className="today-link" onClick={() => setDateKey(getTodayKey())}>
          Go to today
        </button>
      )}

      <div className="time-grid" ref={gridRef}>
        {/* Time slot backgrounds */}
        {timeSlots.map((slot) => (
          <div
            key={slot}
            className={`time-slot ${isSlotOccupied(slot) ? '' : 'empty'}`}
            onClick={() => handleSlotClick(slot)}
          >
            <span className="time-label">{slotToTime(slot)}</span>
            <div className="slot-area" />
          </div>
        ))}

        {/* Blocks overlay */}
        <div className="blocks-container">
          {dayPlan.blocks.map((block) => (
            <div
              key={block.id}
              className={`time-block ${draggingBlock === block.id ? 'dragging' : ''} ${resizingBlock === block.id ? 'resizing' : ''} ${block.completed ? 'completed' : ''}`}
              style={{
                top: block.startSlot * SLOT_HEIGHT,
                height: block.duration * SLOT_HEIGHT - 4,
              }}
              onClick={(e) => handleBlockClick(e, block)}
              onPointerDown={(e) => {
                if (e.target.closest('.resize-handle') || e.target.closest('.block-actions')) return
                handleDragStart(e, block)
              }}
            >
              {editingBlockId === block.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="block-title-input"
                  value={editingTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  placeholder="Event name..."
                />
              ) : (
                <span className="block-title">{block.title || 'Untitled'}</span>
              )}
              <div className="block-actions">
                <button
                  className="block-action-btn"
                  onClick={(e) => handleToggleComplete(e, block.id)}
                >
                  {block.completed ? '✓' : '○'}
                </button>
                <button
                  className="block-action-btn block-delete-btn"
                  onClick={(e) => handleDeleteBlock(e, block.id)}
                >
                  ×
                </button>
              </div>
              <div
                className="resize-handle"
                onPointerDown={(e) => handleResizeStart(e, block)}
              >
                <span className="resize-dots"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DayPlanner
