import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json()

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'No transcript provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // For now, we'll create a simple post suggestion from the transcript
    // In a real implementation, you might want to use an AI service to analyze the transcript
    const postSuggestion = {
      content: `Key insights from my teaching conversation:\n\n${transcript.slice(0, 200)}...`
    }

    // Also create a profile suggestion based on the transcript content
    // This is a simplified example - in production you'd want more sophisticated parsing
    const profileSuggestion = {
      title: "Teacher",
      bio: "Experienced educator passionate about student success.",
      subjects: "General Education",
    }

    return new Response(
      JSON.stringify({
        postSuggestion,
        suggestion: profileSuggestion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})