import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing transcript request received')
    const { content } = await req.json()

    if (!content) {
      console.error('No content provided in request')
      throw new Error('No content provided')
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY not found in environment variables')
      throw new Error('API configuration missing')
    }

    console.log('Making request to Perplexity API')
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
            content: 'You are an AI assistant that helps analyze teacher conversations. Provide a concise summary of the key points discussed.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 150
      })
    })

    if (!response.ok) {
      console.error('Perplexity API error:', await response.text())
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()
    console.log('Successfully processed transcript')

    return new Response(
      JSON.stringify({
        summary: result.choices[0].message.content
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error processing transcript:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process transcript'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})