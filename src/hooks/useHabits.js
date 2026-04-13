import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { format, subDays } from 'date-fns'

export function useHabits() {
  const { user } = useAuth()
  const [commonHabits, setCommonHabits] = useState([])
  const [personalHabits, setPersonalHabits] = useState([])
  const [commonLogs, setCommonLogs] = useState({})
  const [personalLogs, setPersonalLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const commonHabitsRef = useRef([])
  const commonLogsRef = useRef({})
  const today = format(new Date(), 'yyyy-MM-dd')

  // Keep refs in sync
  useEffect(() => { commonHabitsRef.current = commonHabits }, [commonHabits])
  useEffect(() => { commonLogsRef.current = commonLogs }, [commonLogs])

  const fetchAll = useCallback(async () => {
    if (!user) return
    const from = format(subDays(new Date(), 90), 'yyyy-MM-dd')
    const [ch, ph, cl, pl] = await Promise.all([
      supabase.from('common_habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
      supabase.from('personal_habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
      supabase.from('common_logs').select('*').eq('user_id', user.id).gte('log_date', from),
      supabase.from('personal_logs').select('*').eq('user_id', user.id).gte('log_date', from),
    ])
    const habits = ch.data || []
    setCommonHabits(habits)
    setPersonalHabits(ph.data || [])
    const cmap = {}; (cl.data || []).forEach(l => { cmap[`${l.habit_id}:${l.log_date}`] = l.done })
    const pmap = {}; (pl.data || []).forEach(l => { pmap[`${l.habit_id}:${l.log_date}`] = l.done })
    setCommonLogs(cmap)
    setPersonalLogs(pmap)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function pushDailyScore(date, habits, logs) {
    const done = habits.filter(h => logs[`${h.id}:${date}`]).length
    const total = habits.length
    const score = total > 0 ? Math.round((done / total) * 100) : 0
    await supabase.from('daily_scores').upsert(
      { user_id: user.id, score_date: date, score, habits_done: done, habits_total: total },
      { onConflict: 'user_id,score_date' }
    )
  }

  async function toggleCommon(habitId, date = today) {
    const key = `${habitId}:${date}`
    const newVal = !commonLogsRef.current[key]
    const newLogs = { ...commonLogsRef.current, [key]: newVal }
    setCommonLogs(newLogs)
    await supabase.from('common_logs').upsert(
      { user_id: user.id, habit_id: habitId, log_date: date, done: newVal },
      { onConflict: 'user_id,habit_id,log_date' }
    )
    await pushDailyScore(date, commonHabitsRef.current, newLogs)
  }

  async function togglePersonal(habitId, date = today) {
    const key = `${habitId}:${date}`
    const newVal = !personalLogs[key]
    setPersonalLogs(p => ({ ...p, [key]: newVal }))
    await supabase.from('personal_logs').upsert(
      { user_id: user.id, habit_id: habitId, log_date: date, done: newVal },
      { onConflict: 'user_id,habit_id,log_date' }
    ) 
  }

  async function addCommonHabit(habit) {
  const { data, error } = await supabase.from('common_habits')
    .upsert(
      { ...habit, user_id: user.id, sort_order: commonHabitsRef.current.length, is_active: true },
      { onConflict: 'user_id,label', ignoreDuplicates: true }
    )
    .select()
  const row = data?.[0]
  if (!error && row) setCommonHabits(p => [...p, row])
  return { data: row, error }
}

  async function addPersonalHabit(habit) {
    const { data, error } = await supabase.from('personal_habits')
      .insert({ ...habit, user_id: user.id, sort_order: personalHabits.length })
      .select().single()
    if (!error) setPersonalHabits(p => [...p, data])
    return { data, error }
  }

  async function deleteCommonHabit(id) {
    await supabase.from('common_habits').update({ is_active: false }).eq('id', id)
    setCommonHabits(p => p.filter(h => h.id !== id))
  }

  async function deletePersonalHabit(id) {
    await supabase.from('personal_habits').update({ is_active: false }).eq('id', id)
    setPersonalHabits(p => p.filter(h => h.id !== id))
  }

  function getStreak(habitId, logs) {
    let streak = 0, d = new Date()
    while (streak < 366) {
      if (logs[`${habitId}:${format(d,'yyyy-MM-dd')}`]) { streak++; d = subDays(d,1) } else break
    }
    return streak
  }

  function getRate(habitId, logs, days = 7) {
    let done = 0
    for (let i = 0; i < days; i++) {
      if (logs[`${habitId}:${format(subDays(new Date(), i),'yyyy-MM-dd')}`]) done++
    }
    return Math.round((done / days) * 100)
  }

  function getTodayCommonScore() {
    const done = commonHabits.filter(h => commonLogs[`${h.id}:${today}`]).length
    const total = commonHabits.length
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  function getMissedCommonToday() {
    return commonHabits.filter(h => !commonLogs[`${h.id}:${today}`])
  }

  function getWeekData(habits, logs) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const ds = format(d, 'yyyy-MM-dd')
      const done = habits.filter(h => logs[`${h.id}:${ds}`]).length
      return { day: ['S','M','T','W','T','F','S'][d.getDay()], date: ds, score: habits.length > 0 ? Math.round((done/habits.length)*100) : 0 }
    })
  }

  function getMonthData(habits, logs) {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i)
      const ds = format(d, 'yyyy-MM-dd')
      const done = habits.filter(h => logs[`${h.id}:${ds}`]).length
      return { label: format(d,'MMM d'), date: ds, score: habits.length > 0 ? Math.round((done/habits.length)*100) : 0 }
    })
  }

  return {
    commonHabits, personalHabits, commonLogs, personalLogs, loading, today,
    toggleCommon, togglePersonal,
    addCommonHabit, addPersonalHabit,
    deleteCommonHabit, deletePersonalHabit,
    getStreak, getRate, getTodayCommonScore, getMissedCommonToday,
    getWeekData, getMonthData,
    refetch: fetchAll,
  }
}
