import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
      console.error('Perplexity API key not found')
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // First, generate short posts
    const shortPostsResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: `You are an expert at analyzing conversations between teachers and extracting concise, impactful insights.
            Create 5 short, tweet-style posts (max 280 characters each) highlighting key teaching strategies or insights.
            Format the response as a JSON array of strings, each representing one post.`
          },
          {
            role: 'user',
            content: `Generate 5 short posts from this conversation transcript:\n\n${transcript}`
          }
        ],
        temperature: 0.2,
      }),
    });

    // Then, generate article-style posts
    const articlesResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: `You are an expert at analyzing conversations between teachers and creating detailed articles.
            Create 2 longer, article-style posts (500-1000 words each) that dive deep into teaching strategies discussed.
            Format the response as a JSON array of strings, each representing one article.`
          },
          {
            role: 'user',
            content: `Generate 2 detailed articles from this conversation transcript:\n\n${transcript}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const shortPostsResult = await shortPostsResponse.json();
    const articlesResult = await articlesResponse.json();

    const shortPosts = JSON.parse(shortPostsResult.choices[0].message.content);
    const articles = JSON.parse(articlesResult.choices[0].message.content);

    // Create post suggestions with different types
    const postSuggestions = [
      ...shortPosts.map((content: string) => ({
        content,
        post_type: 'short'
      })),
      ...articles.map((content: string) => ({
        content,
        post_type: 'article'
      }))
    ];

    // Also create a profile suggestion based on the transcript content
    const profileSuggestion = {
      title: "Teacher",
      bio: "Experienced educator passionate about student success.",
      subjects: "General Education",
      stance: "Dedicated to fostering a growth mindset and creating an inclusive learning environment where every student can thrive."
    };

    return new Response(
      JSON.stringify({
        postSuggestions,
        suggestion: profileSuggestion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing transcript:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process transcript' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});