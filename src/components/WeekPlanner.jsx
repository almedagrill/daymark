import { useState, useEffect } from 'react'
import { useWeekPlans } from '../hooks/useLocalStorage'

function WeekPlanner() {
  const { getCurrentWeekKey, getWeekPlan, saveWeekPlan } = useWeekPlans()
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey())
  const [plan, setPlan] = useState(getWeekPlan(weekKey))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPlan(getWeekPlan(weekKey))
  }, [weekKey])

  const getWeekDates = (mondayKey) => {
    const monday = new Date(mondayKey + 'T00:00:00')
    const dates = {}
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    days.forEach((day, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates[day] = d.getDate()
    })
    return dates
  }

  const dates = getWeekDates(weekKey)

  const getWeekLabel = (mondayKey) => {
    const monday = new Date(mondayKey + 'T00:00:00')
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const monthFormat = { month: 'short' }
    const startMonth = monday.toLocaleDateString('en-US', monthFormat)
    const endMonth = sunday.toLocaleDateString('en-US', monthFormat)

    if (startMonth === endMonth) {
      return `${startMonth} ${monday.getDate()} - ${sunday.getDate()}`
    }
    return `${startMonth} ${monday.getDate()} - ${endMonth} ${sunday.getDate()}`
  }

  const navigateWeek = (direction) => {
    const current = new Date(weekKey + 'T00:00:00')
    current.setDate(current.getDate() + (direction * 7))
    setWeekKey(current.toISOString().split('T')[0])
  }

  const handleChange = (day, value) => {
    setPlan((prev) => ({
      ...prev,
      [day]: value,
    }))
  }

  const handleSave = () => {
    saveWeekPlan(weekKey, plan)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isCurrentWeek = weekKey === getCurrentWeekKey()

  return (
    <div className="week-planner">
      <div className="week-header">
        <button className="nav-arrow" onClick={() => navigateWeek(-1)}>←</button>
        <div className="week-title">
          <h2>Week Plan</h2>
          <span className="week-range">{getWeekLabel(weekKey)}</span>
        </div>
        <button className="nav-arrow" onClick={() => navigateWeek(1)}>→</button>
      </div>

      {!isCurrentWeek && (
        <button className="today-link" onClick={() => setWeekKey(getCurrentWeekKey())}>
          Go to this week
        </button>
      )}

      <div className="week-grid">
        <div className="day-box">
          <div className="day-label">Mon <span className="day-date">{dates.mon}</span></div>
          <textarea
            value={plan.mon}
            onChange={(e) => handleChange('mon', e.target.value)}
            placeholder="Meetings, workouts, tasks..."
          />
        </div>
        <div className="day-box">
          <div className="day-label">Tue <span className="day-date">{dates.tue}</span></div>
          <textarea
            value={plan.tue}
            onChange={(e) => handleChange('tue', e.target.value)}
            placeholder="Meetings, workouts, tasks..."
          />
        </div>
        <div className="day-box">
          <div className="day-label">Wed <span className="day-date">{dates.wed}</span></div>
          <textarea
            value={plan.wed}
            onChange={(e) => handleChange('wed', e.target.value)}
            placeholder="Meetings, workouts, tasks..."
          />
        </div>
        <div className="day-box">
          <div className="day-label">Thu <span className="day-date">{dates.thu}</span></div>
          <textarea
            value={plan.thu}
            onChange={(e) => handleChange('thu', e.target.value)}
            placeholder="Meetings, workouts, tasks..."
          />
        </div>
        <div className="day-box">
          <div className="day-label">Fri <span className="day-date">{dates.fri}</span></div>
          <textarea
            value={plan.fri}
            onChange={(e) => handleChange('fri', e.target.value)}
            placeholder="Meetings, workouts, tasks..."
          />
        </div>
        <div className="day-box weekend-box">
          <div className="weekend-split">
            <div className="weekend-half">
              <div className="day-label">Sat <span className="day-date">{dates.sat}</span></div>
              <textarea
                value={plan.sat}
                onChange={(e) => handleChange('sat', e.target.value)}
                placeholder="Weekend..."
              />
            </div>
            <div className="weekend-half">
              <div className="day-label">Sun <span className="day-date">{dates.sun}</span></div>
              <textarea
                value={plan.sun}
                onChange={(e) => handleChange('sun', e.target.value)}
                placeholder="Weekend..."
              />
            </div>
          </div>
        </div>
      </div>

      <button className="save-button" onClick={handleSave}>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

export default WeekPlanner
