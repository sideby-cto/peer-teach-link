import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      throw new Error('No transcript provided');
    }

    // Call Perplexity API for short posts
    const shortPostsResult = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pplx-7b-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing conversations between teachers. Create 2 short posts (max 280 chars each). Return ONLY a JSON array of strings, nothing else. Example: ["First post", "Second post"]'
          },
          {
            role: 'user',
            content: transcript
          }
        ]
      })
    });

    if (!shortPostsResult.ok) {
      throw new Error(`Perplexity API error for short posts: ${shortPostsResult.statusText}`);
    }

    // Call Perplexity API for article
    const articlesResult = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pplx-7b-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing conversations between teachers. Create 1 article (500-1000 words). Return ONLY a JSON array with one string, nothing else. Example: ["Your article text"]'
          },
          {
            role: 'user',
            content: transcript
          }
        ]
      })
    });

    if (!articlesResult.ok) {
      throw new Error(`Perplexity API error for articles: ${articlesResult.statusText}`);
    }

    const shortPostsData = await shortPostsResult.json();
    const articlesData = await articlesResult.json();

    let shortPosts;
    let articles;

    try {
      const extractJsonArray = (apiResponse: any) => {
        try {
          const content = apiResponse.choices[0].message.content.trim();
          
          // Find the first [ and last ]
          const start = content.indexOf('[');
          const end = content.lastIndexOf(']');
          
          if (start === -1 || end === -1) {
            throw new Error('No JSON array found in response');
          }
          
          // Extract just the array portion
          const jsonStr = content.substring(start, end + 1);
          
          // Parse and validate
          const parsed = JSON.parse(jsonStr);
          if (!Array.isArray(parsed)) {
            throw new Error('Parsed content is not an array');
          }
          
          return parsed;
        } catch (error) {
          console.error('Error extracting JSON array:', error);
          throw error;
        }
      };

      shortPosts = extractJsonArray(shortPostsData);
      articles = extractJsonArray(articlesData);

      // Additional validation
      if (!shortPosts.every(post => typeof post === 'string' && post.length <= 280)) {
        throw new Error('Invalid short posts format or length');
      }

      if (!articles.every(article => typeof article === 'string' && article.length >= 100)) {
        throw new Error('Invalid article format or length');
      }

    } catch (error) {
      console.error('Error processing AI responses:', error);
      throw new Error(`Failed to parse AI responses: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        shortPosts,
        articles
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});