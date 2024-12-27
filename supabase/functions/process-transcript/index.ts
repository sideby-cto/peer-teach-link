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
    console.log('Processing transcript:', transcript);

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
            content: 'You are an expert at analyzing conversations between teachers. Create 2 short posts (max 280 chars each) that capture key insights. Return ONLY a JSON array of strings, nothing else.'
          },
          {
            role: 'user',
            content: transcript
          }
        ]
      })
    });

    if (!shortPostsResult.ok) {
      console.error('Perplexity API error for short posts:', await shortPostsResult.text());
      throw new Error(`Perplexity API error for short posts: ${shortPostsResult.statusText}`);
    }

    const shortPostsData = await shortPostsResult.json();
    console.log('Short posts response:', shortPostsData);

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
            content: 'You are an expert at analyzing conversations between teachers. Create 1 article (500-1000 words) that expands on the key insights. Return ONLY a JSON array with one string, nothing else.'
          },
          {
            role: 'user',
            content: transcript
          }
        ]
      })
    });

    if (!articlesResult.ok) {
      console.error('Perplexity API error for articles:', await articlesResult.text());
      throw new Error(`Perplexity API error for articles: ${articlesResult.statusText}`);
    }

    const articlesData = await articlesResult.json();
    console.log('Articles response:', articlesData);

    const extractContent = (apiResponse: any) => {
      try {
        const content = apiResponse.choices[0].message.content.trim();
        let jsonContent;
        
        // Try to parse the content directly first
        try {
          jsonContent = JSON.parse(content);
        } catch {
          // If direct parsing fails, try to find and parse just the array portion
          const start = content.indexOf('[');
          const end = content.lastIndexOf(']');
          
          if (start === -1 || end === -1) {
            throw new Error('No JSON array found in response');
          }
          
          jsonContent = JSON.parse(content.substring(start, end + 1));
        }
        
        if (!Array.isArray(jsonContent)) {
          throw new Error('Parsed content is not an array');
        }
        
        return jsonContent;
      } catch (error) {
        console.error('Error extracting content:', error);
        throw error;
      }
    };

    const shortPosts = extractContent(shortPostsData).map(post => ({
      content: post,
      post_type: 'short'
    }));

    const articles = extractContent(articlesData).map(article => ({
      content: article,
      post_type: 'article'
    }));

    const postSuggestions = [...shortPosts, ...articles];

    return new Response(
      JSON.stringify({ postSuggestions }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing transcript:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      { 
        status: error.message.includes('No transcript') ? 400 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});