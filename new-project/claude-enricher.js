const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

class ClaudeEnricher {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async enrichRedditPost(post) {
    try {
      const prompt = this.buildEnrichmentPrompt(post);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const enrichmentText = message.content[0].text;
      const enrichment = this.parseEnrichmentResponse(enrichmentText);
      
      return {
        post_id: post.id,
        original_post: post,
        enrichment: {
          ...enrichment,
          timestamp: new Date().toISOString(),
          model_used: 'claude-3-5-sonnet-20241022'
        }
      };
    } catch (error) {
      console.error('Error enriching post:', error);
      throw new Error(`Enrichment failed: ${error.message}`);
    }
  }

  buildEnrichmentPrompt(post) {
    return `Analyze this Reddit post about Bitcoin/cryptocurrency trading and provide enriched context:

**POST DETAILS:**
Title: ${post.title}
Subreddit: r/${post.subreddit}
Author: u/${post.author}
Score: ${post.score} upvotes
Comments: ${post.num_comments}
Content: ${post.selftext || 'No text content'}
URL: ${post.url}

**ANALYSIS REQUESTED:**
Please provide a structured analysis in JSON format with these exact fields:

{
  "analysis": "Detailed analysis of the post content, context, and implications (2-3 sentences)",
  "sentiment": "bullish|bearish|neutral",
  "credibility": "high|medium|low",
  "key_points": ["point1", "point2", "point3"],
  "trading_relevance": "How relevant is this to actual trading decisions (1-10 scale)",
  "market_context": "Brief context about current market conditions related to this post",
  "risk_assessment": "Potential risks or considerations for traders"
}

Focus on:
- Market sentiment and trading implications
- Credibility assessment based on source and content quality
- Key actionable insights for cryptocurrency traders
- Risk factors and market context

Respond only with valid JSON, no additional text.`;
  }

  parseEnrichmentResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        analysis: response.substring(0, 200) + '...',
        sentiment: 'neutral',
        credibility: 'medium',
        key_points: ['Analysis available in raw format'],
        trading_relevance: '5',
        market_context: 'Unable to parse structured analysis',
        risk_assessment: 'Standard trading risks apply'
      };
    } catch (error) {
      console.error('Error parsing enrichment response:', error);
      return {
        analysis: 'Error parsing AI response',
        sentiment: 'neutral',
        credibility: 'low',
        key_points: ['Analysis parsing failed'],
        trading_relevance: '1',
        market_context: 'Analysis unavailable',
        risk_assessment: 'High risk due to analysis failure'
      };
    }
  }

  async batchEnrich(posts, maxConcurrent = 3) {
    const results = [];
    
    for (let i = 0; i < posts.length; i += maxConcurrent) {
      const batch = posts.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(post => this.enrichRedditPost(post));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Rate limiting - wait between batches
        if (i + maxConcurrent < posts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error in batch ${i}-${i + maxConcurrent}:`, error);
        // Continue with next batch even if current batch fails
      }
    }
    
    return results;
  }

  async generalAnalysis(posts, customPrompt) {
    try {
      const postsContext = this.buildPostsContext(posts);
      const fullPrompt = this.buildGeneralPrompt(customPrompt, postsContext);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: fullPrompt
        }]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Error in general analysis:', error);
      throw new Error(`General analysis failed: ${error.message}`);
    }
  }

  buildPostsContext(posts) {
    return posts.map((post, index) => {
      return `**POST ${index + 1}:**
Title: ${post.title}
Subreddit: r/${post.subreddit}
Author: u/${post.author}
Score: ${post.score} upvotes
Comments: ${post.num_comments}
Content: ${post.selftext || 'No text content'}
URL: ${post.url}
Created: ${new Date(post.created).toLocaleDateString()}

---`;
    }).join('\n\n');
  }

  buildGeneralPrompt(customPrompt, postsContext) {
    return `${customPrompt}

**USER PAIN INPUT:**
Here are ${postsContext.split('**POST').length - 1} Reddit posts about Bitcoin/cryptocurrency trading that contain user discussions, pain points, and experiences:

${postsContext}

Please analyze these posts to extract pain points and generate testable marketing message assumptions according to the framework provided above.`;
  }
}

module.exports = ClaudeEnricher;