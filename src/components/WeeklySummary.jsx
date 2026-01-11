import { useJournalEntries } from '../hooks/useLocalStorage'

function WeeklySummary({ onViewEntry }) {
  const { getWeekEntries } = useJournalEntries()
  const weekEntries = getWeekEntries()

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const stats = {
    totalEntries: weekEntries.length,
    reflectionsCompleted: weekEntries.filter((e) => e.reflection?.completed).length,
    needlesMoved: weekEntries.filter(
      (e) => e.reflection?.completed === 'yes'
    ).length,
    partiallyMoved: weekEntries.filter(
      (e) => e.reflection?.completed === 'partial'
    ).length,
  }

  const allGratitude = weekEntries
    .flatMap((e) => e.gratitude || [])
    .filter((g) => g.trim())

  const allNeedles = weekEntries
    .filter((e) => e.needle?.trim())
    .map((e) => ({
      date: e.date,
      needle: e.needle,
      completed: e.reflection?.completed,
    }))

  if (weekEntries.length === 0) {
    return (
      <div className="weekly-summary">
        <div className="empty-state">
          <h2>This Week</h2>
          <p>No entries from the past 7 days.</p>
          <p>Start journaling to see your weekly summary.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="weekly-summary">
      <h2>This Week</h2>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{stats.totalEntries}</span>
          <span className="stat-label">Days journaled</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.needlesMoved}</span>
          <span className="stat-label">Needles moved</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.partiallyMoved}</span>
          <span className="stat-label">Partial progress</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.reflectionsCompleted}</span>
          <span className="stat-label">Reflections</span>
        </div>
      </div>

      {allNeedles.length > 0 && (
        <section className="summary-section">
          <h3>What you committed to</h3>
          <ul className="needles-list">
            {allNeedles.map((item, i) => (
              <li
                key={i}
                className={`needle-item ${item.completed || ''}`}
                onClick={() => onViewEntry(item.date)}
              >
                <span className="needle-date">{formatDate(item.date)}</span>
                <span className="needle-text">{item.needle}</span>
                {item.completed && (
                  <span className={`status ${item.completed}`}>
                    {item.completed === 'yes'
                      ? 'Done'
                      : item.completed === 'partial'
                      ? 'Partial'
                      : 'Missed'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {allGratitude.length > 0 && (
        <section className="summary-section">
          <h3>Gratitude this week</h3>
          <ul className="gratitude-list">
            {allGratitude.slice(0, 9).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {allGratitude.length > 9 && (
              <li className="more">+{allGratitude.length - 9} more</li>
            )}
          </ul>
        </section>
      )}
    </div>
  )
}

export default WeeklySummary
