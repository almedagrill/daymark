import { useState, useRef, useEffect } from 'react'
import DailyRitual from './components/DailyRitual'
import DayPlanner from './components/DayPlanner'
import WeekPlanner from './components/WeekPlanner'
import WeeklySummary from './components/WeeklySummary'
import HistoryList from './components/HistoryList'
import EntryView from './components/EntryView'
import Support from './components/Support'
import Privacy from './components/Privacy'
import { getDailyQuote } from './data/stoicQuotes'

const STORAGE_KEYS = {
  entries: 'morning-start-entries',
  weekPlans: 'daymark-week-plans',
  dayPlans: 'daymark-day-plans',
}

function App() {
  const [view, setView] = useState('ritual')
  const [selectedDate, setSelectedDate] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  const handleViewEntry = (date) => {
    setSelectedDate(date)
    setView('entry')
  }

  const handleBack = () => {
    setView('history')
    setSelectedDate(null)
  }

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      entries: JSON.parse(localStorage.getItem(STORAGE_KEYS.entries) || '[]'),
      weekPlans: JSON.parse(localStorage.getItem(STORAGE_KEYS.weekPlans) || '{}'),
      dayPlans: JSON.parse(localStorage.getItem(STORAGE_KEYS.dayPlans) || '{}'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daymark-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.entries) {
          localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(data.entries))
        }
        if (data.weekPlans) {
          localStorage.setItem(STORAGE_KEYS.weekPlans, JSON.stringify(data.weekPlans))
        }
        if (data.dayPlans) {
          localStorage.setItem(STORAGE_KEYS.dayPlans, JSON.stringify(data.dayPlans))
        }
        window.location.reload()
      } catch (err) {
        alert('Invalid backup file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const navItems = [
    { id: 'ritual', label: 'Reflect' },
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'Week' },
  ]

  const quote = getDailyQuote()
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <header className="header">
        <h1 onClick={() => setView('ritual')}>Daymark</h1>
        <p className="header-date">{todayFormatted}</p>
        <div className="header-quote">
          <blockquote>"{quote.text}"</blockquote>
          <cite>— {quote.author}</cite>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                view === item.id ||
                (item.id === 'history' && (view === 'entry' || view === 'summary'))
                  ? 'active'
                  : ''
              }
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {view === 'ritual' && <DailyRitual />}
        {view === 'day' && <DayPlanner />}
        {view === 'week' && <WeekPlanner />}
        {view === 'summary' && <WeeklySummary onViewEntry={handleViewEntry} />}
        {view === 'history' && <HistoryList onViewEntry={handleViewEntry} />}
        {view === 'entry' && <EntryView date={selectedDate} onBack={handleBack} />}
        {view === 'support' && <Support />}
        {view === 'privacy' && <Privacy />}
      </main>

      <footer className="footer">
        <button onClick={() => setView('history')}>History</button>
        <span className="footer-divider">·</span>
        <button onClick={handleExport}>Export</button>
        <span className="footer-divider">·</span>
        <button onClick={() => fileInputRef.current?.click()}>Import</button>
        <span className="footer-divider">·</span>
        <button onClick={() => setView('support')}>Support</button>
        <span className="footer-divider">·</span>
        <button onClick={() => setView('privacy')}>Privacy</button>
        {installPrompt && (
          <>
            <span className="footer-divider">·</span>
            <button onClick={handleInstall}>Install App</button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </footer>
    </div>
  )
}

export default App
