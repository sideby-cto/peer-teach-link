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
            content: 'You are an expert at analyzing conversations between teachers. Create 2 short posts (max 280 chars each). IMPORTANT: Respond with ONLY a JSON array of strings. Example: ["Post 1", "Post 2"]. No markdown, no explanations.'
          },
          {
            role: 'user',
            content: transcript.replace(/[\n\r\t]/g, ' ').trim()
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
    console.log('Short posts API raw response:', shortPostsResult);

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
            content: 'You are an expert at analyzing conversations between teachers. Create 1 article (500-1000 words). IMPORTANT: Respond with ONLY a JSON array with one string. Example: ["Your article text"]. No markdown, no explanations.'
          },
          {
            role: 'user',
            content: transcript.replace(/[\n\r\t]/g, ' ').trim()
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
    console.log('Article API raw response:', articlesResult);

    // Parse and validate the responses
    let shortPosts;
    let articles;
    try {
      const sanitizeContent = (content: string) => {
        // Remove any markdown code block syntax
        let cleaned = content.replace(/```json\n?|```/g, '').trim();
        // Remove any control characters and normalize whitespace
        cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        return cleaned;
      };

      const shortPostsContent = sanitizeContent(shortPostsResult.choices[0].message.content);
      console.log('Sanitized short posts content:', shortPostsContent);
      shortPosts = JSON.parse(shortPostsContent);

      const articlesContent = sanitizeContent(articlesResult.choices[0].message.content);
      console.log('Sanitized articles content:', articlesContent);
      articles = JSON.parse(articlesContent);

      // Validate arrays
      if (!Array.isArray(shortPosts)) {
        console.error('Invalid short posts format:', shortPosts);
        throw new Error('Short posts must be an array');
      }
      if (!Array.isArray(articles)) {
        console.error('Invalid articles format:', articles);
        throw new Error('Articles must be an array');
      }

      // Validate content
      if (!shortPosts.every(post => typeof post === 'string')) {
        throw new Error('All short posts must be strings');
      }
      if (!articles.every(article => typeof article === 'string')) {
        throw new Error('All articles must be strings');
      }
    } catch (error) {
      console.error('Error parsing AI responses:', error);
      console.log('Short posts raw content:', shortPostsResult.choices[0].message.content);
      console.log('Articles raw content:', articlesResult.choices[0].message.content);
      throw new Error(`Failed to parse AI responses: ${error.message}`);
    }

    // Create post suggestions
    const postSuggestions = [
      ...shortPosts.map((content: string) => ({
        content: content.trim(),
        post_type: 'short'
      })),
      ...articles.map((content: string) => ({
        content: content.trim(),
        post_type: 'article'
      }))
    ];

    // Create a profile suggestion
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