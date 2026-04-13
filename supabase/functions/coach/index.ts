import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { type } = body

    let prompt = ''

    if (type === 'coach') {
      const { displayName, pct, done, total, doneLabels, missedLabels } = body
      prompt = `You are a ruthless but caring gym coach and life mentor. User: ${displayName || 'Warrior'}. Score: ${pct}% (${done}/${total}). Done: ${doneLabels}. Missed: ${missedLabels}. Write 2-3 punchy sentences. If score>=80 hype them hard. If 40-79 push to finish. If <40 tough love + encourage. Reference missed habits by name. End with ONE action they can do RIGHT NOW.`

    } else if (type === 'fire') {
      const { displayName, pct, maxStreak, missedLabels } = body
      prompt = `You are the most intense motivational coach alive. User: ${displayName || 'Warrior'}. Score: ${pct}%. Streak: ${maxStreak} days. Missed today: ${missedLabels}. Write ONE blazing motivational paragraph (4-5 sentences) that will make them want to immediately do those missed habits. Reference them by name. Sound like David Goggins meets a wise sage. Include one short power quote at the end.`

    } else if (type === 'weekly_review') {
      const { displayName, weekAvg, topHabit, weakHabit, consistentDays, habitBreakdown } = body
      prompt = `You are a performance analyst and coach. User: ${displayName || 'Warrior'}. Weekly average: ${weekAvg}%. Best habit: ${topHabit}. Weakest habit: ${weakHabit}. Consistent days: ${consistentDays}/7. Breakdown: ${habitBreakdown}. Write a sharp weekly review in 4 parts: 1) ONE sentence overall verdict, 2) ONE specific strength to keep, 3) ONE specific weakness to fix next week with HOW, 4) ONE powerful goal for next week. Be data-driven and specific. Use their habit names.`

    } else if (type === 'habit_recommendation') {
      const { displayName, currentHabits, weakAreas, strongAreas } = body
      prompt = `You are a habit design expert. User: ${displayName || 'Warrior'}. Current habits: ${currentHabits}. Strong areas: ${strongAreas}. Weak areas: ${weakAreas}. Suggest exactly 3 new habits they should add. For each: name, why it complements their current stack, and one tip to make it stick. Be specific and practical. Format as a numbered list.`

    } else if (type === 'progress_letter') {
      const { displayName, monthAvg, bestStreak, totalDone, topHabits, monthTrend } = body
      prompt = `Write a personal monthly progress letter to ${displayName || 'Warrior'}. Stats: ${monthAvg}% monthly average, ${bestStreak} day best streak, ${totalDone} total completions, top habits: ${topHabits}, trend: ${monthTrend}. Write it like a letter from their future self looking back. 3-4 paragraphs. Be honest, inspiring, and specific. Reference their actual habits. End with a single powerful sentence for next month.`

    } else if (type === 'chat') {
      const { displayName, message, habitContext } = body
      prompt = `You are Coach Claude, a personal habit and performance coach for ${displayName || 'Warrior'}. Their habit data: ${habitContext}. They ask: "${message}". Give a helpful, specific, data-driven response in 2-4 sentences. Reference their actual habits and numbers when relevant. Be direct and practical.`

    } else if (type === 'streak_alert') {
      const { displayName, habitName, streakDays, todayDone } = body
      prompt = `Write a short streak alert message for ${displayName || 'Warrior'}. Habit: ${habitName}. Current streak: ${streakDays} days. Completed today: ${todayDone ? 'yes' : 'no'}. ${todayDone ? 'Celebrate the streak continuation in 1-2 sentences.' : 'Warn them urgently that their streak is at risk in 1-2 sentences. Make it feel urgent but not harsh.'}`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? 'Keep pushing. Every rep counts.'

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ text: 'Keep pushing. Every rep counts.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})