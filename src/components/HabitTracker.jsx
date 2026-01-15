import { useState, useRef, useEffect } from 'react'
import { useHabits } from '../hooks/useLocalStorage'

const TOTAL_DAYS = 21

function HabitTracker() {
  const { habits, addHabit, updateHabitName, toggleDay, deleteHabit, resetHabit } = useHabits()
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleAddHabit = () => {
    if (habits.length >= 3) return
    const id = addHabit('')
    setEditingId(id)
    setEditingName('')
  }

  const handleStartEdit = (habit) => {
    setEditingId(habit.id)
    setEditingName(habit.name)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      if (editingName.trim()) {
        updateHabitName(editingId, editingName.trim())
      } else {
        deleteHabit(editingId)
      }
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingName('')
    }
  }

  const getCompletedCount = (habit) => {
    return habit.completedDays.length
  }

  const isHabitComplete = (habit) => {
    return getCompletedCount(habit) >= TOTAL_DAYS
  }

  return (
    <div className="habit-tracker">
      <div className="habit-header">
        <h2>Habits</h2>
        <p className="habit-subtitle">Build new habits in 21 days</p>
      </div>

      <div className="habits-list">
        {habits.map((habit) => (
          <div key={habit.id} className={`habit-card ${isHabitComplete(habit) ? 'complete' : ''}`}>
            <div className="habit-info">
              {editingId === habit.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="habit-name-input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyDown}
                  placeholder="Habit name..."
                />
              ) : (
                <span className="habit-name" onClick={() => handleStartEdit(habit)}>
                  {habit.name || 'Untitled habit'}
                </span>
              )}
              <span className="habit-progress">
                {getCompletedCount(habit)} / {TOTAL_DAYS} days
                {isHabitComplete(habit) && ' ✓'}
              </span>
            </div>

            <div className="habit-days">
              {Array.from({ length: TOTAL_DAYS }, (_, i) => (
                <button
                  key={i}
                  className={`habit-day ${habit.completedDays.includes(i) ? 'checked' : ''}`}
                  onClick={() => toggleDay(habit.id, i)}
                  title={`Day ${i + 1}`}
                >
                  {habit.completedDays.includes(i) ? '✓' : i + 1}
                </button>
              ))}
            </div>

            <div className="habit-actions">
              <button
                className="habit-action-btn"
                onClick={() => resetHabit(habit.id)}
                title="Reset progress"
              >
                Reset
              </button>
              <button
                className="habit-action-btn delete"
                onClick={() => deleteHabit(habit.id)}
                title="Delete habit"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {habits.length < 3 && (
          <button className="add-habit-btn" onClick={handleAddHabit}>
            + Add habit {habits.length > 0 && `(${3 - habits.length} remaining)`}
          </button>
        )}
      </div>

      {habits.length === 0 && (
        <p className="habit-empty">
          Start tracking up to 3 habits. It takes 21 days to form a new habit.
        </p>
      )}
    </div>
  )
}

export default HabitTracker
