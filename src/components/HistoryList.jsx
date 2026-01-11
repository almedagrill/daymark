import { useState } from 'react'
import { useJournalEntries } from '../hooks/useLocalStorage'

function HistoryList({ onViewEntry }) {
  const { entries, searchEntries } = useJournalEntries()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEntries = searchQuery ? searchEntries(searchQuery) : entries

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPreview = (entry) => {
    const firstGratitude = entry.gratitude?.find((g) => g.trim())
    if (firstGratitude) {
      return firstGratitude
    }
    if (entry.needle?.trim()) {
      return entry.needle
    }
    return 'No content'
  }

  return (
    <div className="history-list">
      <h2>History</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-search"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="empty-state">
          {searchQuery ? (
            <p>No entries match "{searchQuery}"</p>
          ) : (
            <>
              <p>No journal entries yet.</p>
              <p>Start your first entry today.</p>
            </>
          )}
        </div>
      ) : (
        <ul>
          {filteredEntries.map((entry) => (
            <li key={entry.date} onClick={() => onViewEntry(entry.date)}>
              <div className="entry-header">
                <span className="entry-date">{formatDate(entry.date)}</span>
                {entry.reflection?.completed && (
                  <span className={`reflection-badge ${entry.reflection.completed}`}>
                    {entry.reflection.completed === 'yes'
                      ? 'Done'
                      : entry.reflection.completed === 'partial'
                      ? 'Partial'
                      : 'Missed'}
                  </span>
                )}
              </div>
              <span className="entry-preview">{getPreview(entry)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryList
