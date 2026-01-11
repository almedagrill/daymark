import { useJournalEntries } from '../hooks/useLocalStorage'

function EntryView({ date, onBack }) {
  const { getEntryByDate } = useJournalEntries()
  const entry = getEntryByDate(date)

  if (!entry) {
    return (
      <div className="entry-view">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <div className="empty-state">
          <p>Entry not found.</p>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const getReflectionLabel = (status) => {
    switch (status) {
      case 'yes':
        return 'Completed'
      case 'partial':
        return 'Partially completed'
      case 'no':
        return 'Not completed'
      default:
        return null
    }
  }

  return (
    <div className="entry-view">
      <button className="back-button" onClick={onBack}>
        Back
      </button>

      <h2 className="entry-date-header">{formattedDate}</h2>

      <section className="entry-section">
        <h3>Grateful for</h3>
        <ul>
          {entry.gratitude?.map((item, i) => (
            <li key={i}>{item || <span className="empty">—</span>}</li>
          ))}
        </ul>
      </section>

      <section className="entry-section">
        <h3>Affirmations</h3>
        <ul>
          {entry.affirmations?.map((item, i) => (
            <li key={i}>{item || <span className="empty">—</span>}</li>
          ))}
        </ul>
      </section>

      <section className="entry-section">
        <h3>Moving the needle</h3>
        <p>{entry.needle || <span className="empty">—</span>}</p>
      </section>

      {entry.leaveItHere && (
        <section className="entry-section">
          <h3>Leave it here</h3>
          <p>{entry.leaveItHere}</p>
        </section>
      )}

      {entry.reflection && (
        <section className="entry-section">
          <h3>Evening reflection</h3>
          {entry.reflection.completed && (
            <p>
              <span className={`reflection-badge ${entry.reflection.completed}`}>
                {getReflectionLabel(entry.reflection.completed)}
              </span>
            </p>
          )}
          {entry.reflection.note && (
            <p style={{ marginTop: '8px' }}>{entry.reflection.note}</p>
          )}
        </section>
      )}
    </div>
  )
}

export default EntryView
