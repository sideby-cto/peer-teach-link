import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json()
    console.log('Processing transcript:', transcript.substring(0, 100), '...')

    if (!transcript) {
      throw new Error('No transcript provided')
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      throw new Error('API configuration missing')
    }

    // Improved prompt for better results
    const systemPrompt = `You are an AI assistant that helps analyze teacher conversations and create engaging social media content. 
    Extract key insights and create both short posts (1-2 sentences) and longer article-style posts. Focus on practical teaching tips and insights.`

    const userPrompt = `Analyze this teacher conversation and create:
    1. Two short posts (1-2 sentences each) highlighting key teaching insights
    2. One longer article-style post (3-4 paragraphs) expanding on the most valuable teaching practice discussed
    
    Here's the conversation: ${transcript}`

    console.log('Sending request to Perplexity API...')
    
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', errorText)
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Received response from Perplexity API')

    if (!result.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Perplexity API')
    }

    const content = result.choices[0].message.content

    // Split content into short posts and article
    const posts = [
      {
        content: content,
        post_type: 'article'
      }
    ]

    return new Response(
      JSON.stringify({ postSuggestions: posts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing transcript:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})