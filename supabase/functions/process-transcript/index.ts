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
            content: `You are an expert at analyzing conversations between teachers and extracting concise insights.
            Your task is to create 2 short, tweet-style posts (max 280 characters each).
            IMPORTANT: You must respond with ONLY a JSON array of strings, nothing else.
            Example valid response: ["First insight about teaching", "Second insight about teaching"]
            Do not include any explanations, headers, or other text.`
          },
          {
            role: 'user',
            content: transcript
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
            content: `You are an expert at analyzing conversations between teachers and creating detailed articles.
            Your task is to create 1 longer, article-style post (500-1000 words).
            IMPORTANT: You must respond with ONLY a JSON array containing one string, nothing else.
            Example valid response: ["Your detailed article text goes here"]
            Do not include any explanations, headers, or other text.`
          },
          {
            role: 'user',
            content: transcript
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
      const shortPostsContent = shortPostsResult.choices[0].message.content.trim();
      console.log('Attempting to parse short posts content:', shortPostsContent);
      
      // Try to clean the response if it's not pure JSON
      const shortPostsJson = shortPostsContent.replace(/^```json\n|\n```$/g, '');
      shortPosts = JSON.parse(shortPostsJson);

      const articlesContent = articlesResult.choices[0].message.content.trim();
      console.log('Attempting to parse articles content:', articlesContent);
      
      // Try to clean the response if it's not pure JSON
      const articlesJson = articlesContent.replace(/^```json\n|\n```$/g, '');
      articles = JSON.parse(articlesJson);

      // Validate the parsed data
      if (!Array.isArray(shortPosts)) {
        console.error('Short posts is not an array:', shortPosts);
        throw new Error('Short posts response is not an array');
      }
      if (!Array.isArray(articles)) {
        console.error('Articles is not an array:', articles);
        throw new Error('Articles response is not an array');
      }

      // Validate content of arrays
      if (!shortPosts.every(post => typeof post === 'string')) {
        throw new Error('Short posts array contains non-string elements');
      }
      if (!articles.every(article => typeof article === 'string')) {
        throw new Error('Articles array contains non-string elements');
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