import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json()
    console.log('Processing transcript:', transcript.substring(0, 100) + '...')

    // Call Perplexity API to analyze the transcript
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes teaching conversations and extracts key insights to share with other teachers. Focus on practical teaching strategies, classroom management tips, or innovative approaches discussed. Keep the output concise and actionable. Format the response as a social media post that would be valuable for other teachers.'
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

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Perplexity API response:', result)

    const postContent = result.choices[0].message.content

    return new Response(
      JSON.stringify({
        postSuggestion: {
          content: postContent
        }
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
        error: 'Failed to process transcript',
        details: error.message
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