import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

serve(async (req) => {
  try {
    const { transcript } = await req.json()

    // Call Perplexity API to analyze the transcript
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes teaching conversations and extracts key insights to share with other teachers. Focus on practical teaching strategies, classroom management tips, or innovative approaches discussed. Keep the output concise and actionable.'
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    })

    const result = await response.json()
    
    // Extract the AI's suggestion from the response
    const postSuggestion = {
      content: result.choices[0].message.content
    }

    return new Response(
      JSON.stringify({
        postSuggestion
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
})