import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing transcript request received')
    const { transcript } = await req.json()

    if (!transcript) {
      console.error('No transcript provided in request')
      throw new Error('No transcript provided')
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY not found in environment variables')
      throw new Error('API configuration missing')
    }

    console.log('Making request to Perplexity API with transcript length:', transcript.length)
    
    try {
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
              content: 'You are an AI assistant that helps analyze teacher conversations. Extract key information about the teacher and suggest content for their profile.'
            },
            {
              role: 'user',
              content: transcript
            }
          ],
          max_tokens: 150
        })
      })

      console.log('Perplexity API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error response:', errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('Successfully processed transcript, API response:', result)

      return new Response(
        JSON.stringify({
          suggestion: {
            content: result.choices[0].message.content
          }
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )

    } catch (apiError) {
      console.error('Error calling Perplexity API:', apiError)
      throw new Error(`Failed to process with Perplexity API: ${apiError.message}`)
    }

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