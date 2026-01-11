import { useState, useEffect } from 'react'
import { useJournalEntries } from '../hooks/useLocalStorage'

function EveningReflection() {
  const { getTodayEntry, saveEntry } = useJournalEntries()
  const [todayEntry, setTodayEntry] = useState(null)
  const [completed, setCompleted] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const entry = getTodayEntry()
    setTodayEntry(entry)
    if (entry?.reflection) {
      setCompleted(entry.reflection.completed)
      setNote(entry.reflection.note || '')
    }
  }, [])

  const handleSave = () => {
    if (!todayEntry) return
    saveEntry({
      ...todayEntry,
      reflection: { completed, note },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!todayEntry || !todayEntry.needle) {
    return (
      <div className="evening-reflection">
        <div className="empty-state">
          <h2>Evening Reflection</h2>
          <p>Complete your morning entry first to reflect on your day.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="evening-reflection">
      <h2>Evening Reflection</h2>

      <div className="needle-reminder">
        <span className="label">This morning you said:</span>
        <p className="needle-text">"{todayEntry.needle}"</p>
      </div>

      <div className="reflection-question">
        <h3>Did you move the needle today?</h3>
        <div className="options">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'partial', label: 'Partially' },
            { value: 'no', label: 'No' },
          ].map((option) => (
            <button
              key={option.value}
              className={`option ${completed === option.value ? 'selected' : ''}`}
              onClick={() => setCompleted(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="reflection-note">
        <label htmlFor="note">Reflection notes (optional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did the day go? What did you learn?"
          rows={4}
        />
      </div>

      <button
        className="save-button"
        onClick={handleSave}
        disabled={completed === null}
      >
        {saved ? 'Saved' : 'Save Reflection'}
      </button>
    </div>
  )
}

export default EveningReflection
