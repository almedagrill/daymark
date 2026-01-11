import { useState, useEffect } from 'react'
import { useJournalEntries } from '../hooks/useLocalStorage'
import { getDailyQuote } from '../data/stoicQuotes'

function JournalForm() {
  const { saveEntry, getTodayEntry } = useJournalEntries()
  const [saved, setSaved] = useState(false)
  const quote = getDailyQuote()

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const [gratitude, setGratitude] = useState(['', '', ''])
  const [affirmations, setAffirmations] = useState(['', '', ''])
  const [needle, setNeedle] = useState('')
  const [leaveItHere, setLeaveItHere] = useState('')

  useEffect(() => {
    const existing = getTodayEntry()
    if (existing) {
      setGratitude(existing.gratitude || ['', '', ''])
      setAffirmations(existing.affirmations || ['', '', ''])
      setNeedle(existing.needle || '')
      setLeaveItHere(existing.leaveItHere || '')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    saveEntry({
      date: today,
      gratitude,
      affirmations,
      needle,
      leaveItHere,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form className="journal-form" onSubmit={handleSubmit}>
      <div className="daily-quote">
        <blockquote>"{quote.text}"</blockquote>
        <cite>— {quote.author}</cite>
      </div>

      <p className="date">{todayFormatted}</p>

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

      <button type="submit" className="save-button">
        {saved ? 'Saved' : 'Save'}
      </button>
    </form>
  )
}

export default JournalForm
