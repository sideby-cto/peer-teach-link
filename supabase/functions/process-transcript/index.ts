import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json()
    console.log('Processing transcript:', transcript.substring(0, 100))

    if (!transcript) {
      throw new Error('No transcript provided')
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      throw new Error('API configuration missing')
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps analyze teacher conversations and create engaging social media content. Extract key insights and create both short posts (1-2 sentences) and longer article-style posts.'
          },
          {
            role: 'user',
            content: `Analyze this teacher conversation and create 2-3 short posts (1-2 sentences each) and 1 longer article-style post (3-4 paragraphs) that would be engaging for other teachers: ${transcript}`
          }
        ],
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      console.error('Perplexity API error:', await response.text())
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('API Response:', result)

    return new Response(
      JSON.stringify({
        postSuggestions: [
          {
            content: result.choices[0].message.content,
            post_type: 'article'
          }
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing transcript:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})