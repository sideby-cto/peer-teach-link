import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      console.error('Perplexity API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API key configuration error - key not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (apiKey.length < 30) {
      console.error('Invalid Perplexity API key format')
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Starting transcript processing...');
    console.log('Transcript length:', transcript.length);
    console.log('First 100 characters:', transcript.slice(0, 100));

    // Use Perplexity API to generate insights
    console.log('Making request to Perplexity API...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing conversations between teachers and extracting the most valuable insights.
            Focus on:
            - Teaching strategies discussed
            - Solutions to common challenges
            - Innovative approaches shared
            - Key learnings and takeaways
            
            Format the response as a concise, well-structured post that would be valuable for other teachers to read.
            Keep it under 2000 characters. Use clear paragraphs and bullet points where appropriate.`
          },
          {
            role: 'user',
            content: `Please analyze this conversation transcript and extract the most valuable insights to share with other teachers:\n\n${transcript}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      
      if (response.status === 401) {
        throw new Error('Invalid Perplexity API key or authentication failed. Please verify your API key.');
      }
      
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('Received response from Perplexity API');
    const result = await response.json();
    console.log('Successfully parsed response JSON');

    if (!result.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', JSON.stringify(result, null, 2));
      throw new Error('Invalid response format from Perplexity API');
    }

    const postContent = result.choices[0].message.content;
    console.log('Generated post content length:', postContent.length);
    console.log('First 100 characters of generated content:', postContent.slice(0, 100));

    // Create post suggestion with the generated content
    const postSuggestion = {
      content: postContent
    };

    // Also create a profile suggestion based on the transcript content
    const profileSuggestion = {
      title: "Teacher",
      bio: "Experienced educator passionate about student success.",
      subjects: "General Education",
    };

    console.log('Successfully prepared response');
    return new Response(
      JSON.stringify({
        postSuggestion,
        suggestion: profileSuggestion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing transcript:', error);
    console.error('Error stack:', error.stack);
    
    // Provide a more user-friendly error message
    const userMessage = error.message.includes('API key') 
      ? error.message 
      : 'An error occurred while processing the transcript. Please try again.';
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: error.message,
        stack: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});