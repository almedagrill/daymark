import { useState, useEffect } from 'react'
import { useJournalEntries } from '../hooks/useLocalStorage'

function DailyRitual() {
  const { saveEntry, getTodayEntry } = useJournalEntries()
  const [saved, setSaved] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Morning fields
  const [goal, setGoal] = useState('')
  const [gratitude, setGratitude] = useState(['', '', ''])
  const [affirmations, setAffirmations] = useState(['', '', ''])
  const [needle, setNeedle] = useState('')
  const [leaveItHere, setLeaveItHere] = useState('')

  // Evening fields
  const [completed, setCompleted] = useState(null)
  const [reflectionNote, setReflectionNote] = useState('')

  useEffect(() => {
    const existing = getTodayEntry()
    if (existing) {
      setGoal(existing.goal || '')
      setGratitude(existing.gratitude || ['', '', ''])
      setAffirmations(existing.affirmations || ['', '', ''])
      setNeedle(existing.needle || '')
      setLeaveItHere(existing.leaveItHere || '')
      if (existing.reflection) {
        setCompleted(existing.reflection.completed)
        setReflectionNote(existing.reflection.note || '')
      }
    }
  }, [])

  const handleGratitudeChange = (index, value) => {
    const updated = [...gratitude]
    updated[index] = value
    setGratitude(updated)
  }

  const handleAffirmationChange = (index, value) => {
    const updated = [...affirmations]
    updated[index] = value
    setAffirmations(updated)
  }

  const handleSave = () => {
    saveEntry({
      date: today,
      goal,
      gratitude,
      affirmations,
      needle,
      leaveItHere,
      reflection: {
        completed,
        note: reflectionNote,
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasMorningContent = needle.trim() || gratitude.some(g => g.trim())

  return (
    <div className="daily-ritual">
      {/* Goal */}
      <div className="goal-section">
        <input
          type="text"
          className="goal-input"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Your goal..."
        />
      </div>

      {/* Morning Section */}
      <div className="ritual-section morning-section">
        <div className="section-label">Morning</div>

        <section className="form-section">
          <h2>I am grateful for</h2>
          {gratitude.map((item, i) => (
            <div key={i} className="input-row">
              <span className="input-number">{i + 1}</span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleGratitudeChange(i, e.target.value)}
              />
            </div>
          ))}
        </section>

        <section className="form-section">
          <h2>Daily affirmations</h2>
          {affirmations.map((item, i) => (
            <div key={i} className="input-row">
              <span className="input-number">{i + 1}</span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleAffirmationChange(i, e.target.value)}
              />
            </div>
          ))}
        </section>

        <section className="form-section">
          <h2>What will I do today to move the needle?</h2>
          <textarea
            placeholder="One thing that will make today count..."
            value={needle}
            onChange={(e) => setNeedle(e.target.value)}
            rows={3}
          />
        </section>

        <section className="form-section leave-it-here">
          <h2>Leave it here</h2>
          <textarea
            placeholder="Thoughts, moods, stresses... let it out."
            value={leaveItHere}
            onChange={(e) => setLeaveItHere(e.target.value)}
            rows={5}
          />
        </section>
      </div>

      {/* Evening Section */}
      <div className="ritual-section evening-section">
        <div className="section-label">Evening</div>

        {hasMorningContent && needle.trim() && (
          <div className="needle-reminder">
            <span className="label">This morning you said:</span>
            <p className="needle-text">"{needle}"</p>
          </div>
        )}

        <section className="form-section">
          <h2>Did you move the needle today?</h2>
          <div className="options">
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'partial', label: 'Partially' },
              { value: 'no', label: 'No' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`option ${completed === option.value ? 'selected' : ''}`}
                onClick={() => setCompleted(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Reflection</h2>
          <textarea
            placeholder="How did the day go? What did you learn?"
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            rows={4}
          />
        </section>
      </div>

      <button type="button" className="save-button" onClick={handleSave}>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

export default DailyRitual
