import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    console.log('Received transcript:', transcript);

    if (!transcript) {
      throw new Error('No transcript provided');
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('Perplexity API key not found');
    }

    // First, generate short posts
    console.log('Generating short posts...');
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
            Create 2 short, tweet-style posts (max 280 characters each) highlighting key teaching strategies or insights.
            Return ONLY a valid JSON array of strings, each representing one post. For example: ["First post text", "Second post text"]`
          },
          {
            role: 'user',
            content: `Generate 2 short posts from this conversation transcript:\n\n${transcript}`
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!shortPostsResponse.ok) {
      const errorText = await shortPostsResponse.text();
      console.error('Short posts API error:', errorText);
      throw new Error(`Failed to generate short posts: ${errorText}`);
    }

    const shortPostsResult = await shortPostsResponse.json();
    console.log('Short posts API response:', shortPostsResult);

    // Then, generate one article-style post
    console.log('Generating article...');
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
            Create 1 longer, article-style post (500-1000 words) that dives deep into teaching strategies discussed.
            Return ONLY a valid JSON array containing one string representing the article. For example: ["Article text here"]`
          },
          {
            role: 'user',
            content: `Generate 1 detailed article from this conversation transcript:\n\n${transcript}`
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!articlesResponse.ok) {
      const errorText = await articlesResponse.text();
      console.error('Articles API error:', errorText);
      throw new Error(`Failed to generate articles: ${errorText}`);
    }

    const articlesResult = await articlesResponse.json();
    console.log('Article API response:', articlesResult);

    // Parse the responses with better error handling
    let shortPosts;
    let articles;
    try {
      const shortPostsContent = shortPostsResult.choices[0].message.content;
      console.log('Attempting to parse short posts content:', shortPostsContent);
      shortPosts = JSON.parse(shortPostsContent);
      
      const articlesContent = articlesResult.choices[0].message.content;
      console.log('Attempting to parse articles content:', articlesContent);
      articles = JSON.parse(articlesContent);

      // Validate the parsed data
      if (!Array.isArray(shortPosts) || !Array.isArray(articles)) {
        throw new Error('API returned non-array response');
      }
    } catch (error) {
      console.error('Error parsing AI responses:', error);
      console.log('Short posts raw content:', shortPostsResult.choices[0].message.content);
      console.log('Articles raw content:', articlesResult.choices[0].message.content);
      throw new Error(`Failed to parse AI responses: ${error.message}`);
    }

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

    console.log('Successfully processed transcript, returning response');
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
      JSON.stringify({ 
        error: error.message || 'Failed to process transcript',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});