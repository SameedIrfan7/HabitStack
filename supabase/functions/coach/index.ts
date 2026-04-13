import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { displayName, pct, done, total, doneLabels, missedLabels } = await req.json()

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are a ruthless but caring gym coach and life mentor. User: ${displayName || 'Warrior'}. Score: ${pct}% (${done}/${total}). Done: ${doneLabels}. Missed: ${missedLabels}. Write 2-3 punchy sentences. If score>=80 hype them hard. If 40-79 push to finish. If <40 tough love + encourage. Reference missed habits by name. End with ONE action they can do RIGHT NOW.`
        }]
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? 'Keep pushing. Every rep counts.'

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ text: 'Keep pushing. Every rep counts.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})