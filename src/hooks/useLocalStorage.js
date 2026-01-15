import { useState, useEffect } from 'react'

const STORAGE_KEY = 'morning-start-entries'
const WEEK_PLANS_KEY = 'daymark-week-plans'
const DAY_PLANS_KEY = 'daymark-day-plans'
const HABITS_KEY = 'daymark-habits'

export function useJournalEntries() {
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const saveEntry = (entry) => {
    setEntries((prev) => {
      const existingIndex = prev.findIndex((e) => e.date === entry.date)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...entry }
        return updated
      }
      return [entry, ...prev]
    })
  }

  const getEntryByDate = (date) => {
    return entries.find((e) => e.date === date) || null
  }

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0]
    return getEntryByDate(today)
  }

  const searchEntries = (query) => {
    if (!query.trim()) return entries
    const lowerQuery = query.toLowerCase()
    return entries.filter((entry) => {
      const gratitudeMatch = entry.gratitude?.some((g) =>
        g.toLowerCase().includes(lowerQuery)
      )
      const affirmationMatch = entry.affirmations?.some((a) =>
        a.toLowerCase().includes(lowerQuery)
      )
      const needleMatch = entry.needle?.toLowerCase().includes(lowerQuery)
      const leaveItHereMatch = entry.leaveItHere?.toLowerCase().includes(lowerQuery)
      const reflectionMatch = entry.reflection?.note
        ?.toLowerCase()
        .includes(lowerQuery)
      return gratitudeMatch || affirmationMatch || needleMatch || leaveItHereMatch || reflectionMatch
    })
  }

  const getWeekEntries = () => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date + 'T00:00:00')
      return entryDate >= weekAgo && entryDate <= today
    })
  }

  return {
    entries,
    saveEntry,
    getEntryByDate,
    getTodayEntry,
    searchEntries,
    getWeekEntries,
  }
}

// Get the Monday of a given week
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function useWeekPlans() {
  const [plans, setPlans] = useState(() => {
    try {
      const stored = localStorage.getItem(WEEK_PLANS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(WEEK_PLANS_KEY, JSON.stringify(plans))
  }, [plans])

  const getCurrentWeekKey = () => getWeekStart(new Date())

  const getWeekPlan = (weekKey) => {
    return plans[weekKey] || {
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
    }
  }

  const saveWeekPlan = (weekKey, plan) => {
    setPlans((prev) => ({
      ...prev,
      [weekKey]: plan,
    }))
  }

  return {
    plans,
    getCurrentWeekKey,
    getWeekPlan,
    saveWeekPlan,
  }
}

// Generate unique ID for blocks
function generateBlockId() {
  return 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Migrate old slot-based data to block-based format
function migrateSlotData(dayData) {
  // If already has blocks array, return as-is
  if (dayData && Array.isArray(dayData.blocks)) {
    return dayData
  }

  // If it's old slot-based data (object with time keys like "05:00")
  if (dayData && typeof dayData === 'object' && !Array.isArray(dayData)) {
    const timeSlots = Object.keys(dayData).filter(key => /^\d{2}:\d{2}$/.test(key))
    if (timeSlots.length > 0) {
      const blocks = []
      timeSlots.forEach(time => {
        const text = dayData[time]
        if (text && text.trim()) {
          const [hour, min] = time.split(':').map(Number)
          const startSlot = (hour - 5) * 2 + (min === 30 ? 1 : 0)
          blocks.push({
            id: generateBlockId(),
            title: text.trim(),
            startSlot: startSlot,
            duration: 1
          })
        }
      })
      return { blocks }
    }
  }

  return { blocks: [] }
}

export function useDayPlans() {
  const [plans, setPlans] = useState(() => {
    try {
      const stored = localStorage.getItem(DAY_PLANS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(DAY_PLANS_KEY, JSON.stringify(plans))
  }, [plans])

  const getTodayKey = () => new Date().toISOString().split('T')[0]

  const getDayPlan = (dateKey) => {
    const raw = plans[dateKey]
    return migrateSlotData(raw)
  }

  const saveDayPlan = (dateKey, dayPlan) => {
    setPlans((prev) => ({
      ...prev,
      [dateKey]: dayPlan,
    }))
  }

  const addBlock = (dateKey, block) => {
    const current = getDayPlan(dateKey)
    const newBlock = {
      ...block,
      id: block.id || generateBlockId()
    }
    saveDayPlan(dateKey, {
      blocks: [...current.blocks, newBlock]
    })
    return newBlock.id
  }

  const updateBlock = (dateKey, blockId, updates) => {
    const current = getDayPlan(dateKey)
    saveDayPlan(dateKey, {
      blocks: current.blocks.map(b =>
        b.id === blockId ? { ...b, ...updates } : b
      )
    })
  }

  const deleteBlock = (dateKey, blockId) => {
    const current = getDayPlan(dateKey)
    saveDayPlan(dateKey, {
      blocks: current.blocks.filter(b => b.id !== blockId)
    })
  }

  const moveBlock = (dateKey, blockId, newStartSlot) => {
    updateBlock(dateKey, blockId, { startSlot: newStartSlot })
  }

  return {
    plans,
    getTodayKey,
    getDayPlan,
    saveDayPlan,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
  }
}

export function useHabits() {
  const [habits, setHabits] = useState(() => {
    try {
      const stored = localStorage.getItem(HABITS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
  }, [habits])

  const addHabit = (name) => {
    const newHabit = {
      id: 'habit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      name,
      startDate: new Date().toISOString().split('T')[0],
      completedDays: [],
    }
    setHabits((prev) => [...prev, newHabit])
    return newHabit.id
  }

  const updateHabitName = (habitId, name) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, name } : h))
    )
  }

  const toggleDay = (habitId, dayIndex) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        const completedDays = [...h.completedDays]
        if (completedDays.includes(dayIndex)) {
          return { ...h, completedDays: completedDays.filter((d) => d !== dayIndex) }
        } else {
          return { ...h, completedDays: [...completedDays, dayIndex] }
        }
      })
    )
  }

  const deleteHabit = (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }

  const resetHabit = (habitId) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, startDate: new Date().toISOString().split('T')[0], completedDays: [] }
          : h
      )
    )
  }

  return {
    habits,
    addHabit,
    updateHabitName,
    toggleDay,
    deleteHabit,
    resetHabit,
  }
}
