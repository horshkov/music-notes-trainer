const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ClaudeEnricher = require('./claude-enricher');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || process.env.ENRICHMENT_PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Serve the viewer as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'viewer.html'));
});

const enricher = new ClaudeEnricher();
const database = new Database();

// Initialize database
async function initializeDatabase() {
  try {
    await database.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Legacy function for backward compatibility (now uses database)
async function loadEnrichedData() {
  try {
    return await database.getAllEnrichedPosts();
  } catch (error) {
    console.error('Error loading enriched data from database:', error);
    return {};
  }
}

// Legacy function for backward compatibility (now uses database)
async function saveEnrichedData(data) {
  try {
    // This function is no longer used as we save directly to database
    // Keeping for backward compatibility
    return true;
  } catch (error) {
    console.error('Error in saveEnrichedData:', error);
    return false;
  }
}

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get enriched data for a specific post
app.get('/enriched/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const enrichedPost = await database.getEnrichedPost(postId);
    
    if (enrichedPost) {
      res.json({
        success: true,
        data: enrichedPost
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Post not found in enriched data'
      });
    }
  } catch (error) {
    console.error('Error fetching enriched post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all enriched data
app.get('/enriched', async (req, res) => {
  try {
    const enrichedData = await database.getAllEnrichedPosts();
    res.json({
      success: true,
      data: enrichedData,
      count: Object.keys(enrichedData).length
    });
  } catch (error) {
    console.error('Error fetching all enriched data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Enrich a single post
app.post('/enrich', async (req, res) => {
  try {
    const { post } = req.body;
    
    if (!post || !post.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid post data - post with id required'
      });
    }

    // Check if already enriched
    const existingEnrichment = await database.getEnrichedPost(post.id);
    if (existingEnrichment) {
      return res.json({
        success: true,
        data: existingEnrichment,
        cached: true
      });
    }

    console.log(`Enriching post: ${post.id} - "${post.title}"`);
    
    // Enrich the post using Claude
    const enrichedPost = await enricher.enrichRedditPost(post);
    
    // Save enriched data to database
    await database.saveEnrichedPost(
      post.id, 
      enrichedPost.original_post, 
      enrichedPost.enrichment
    );

    res.json({
      success: true,
      data: enrichedPost,
      cached: false
    });

  } catch (error) {
    console.error('Error enriching post:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enrich post'
    });
  }
});

// Batch enrich multiple posts
app.post('/enrich/batch', async (req, res) => {
  try {
    const { posts } = req.body;
    
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid posts data - array of posts required'
      });
    }

    console.log(`Batch enriching ${posts.length} posts`);
    
    const enrichedPosts = await enricher.batchEnrich(posts);
    
    // Save all enriched data
    const enrichedData = loadEnrichedData();
    enrichedPosts.forEach(enrichedPost => {
      enrichedData[enrichedPost.post_id] = enrichedPost;
    });
    
    const saved = saveEnrichedData(enrichedData);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save enriched data'
      });
    }

    res.json({
      success: true,
      data: enrichedPosts,
      count: enrichedPosts.length
    });

  } catch (error) {
    console.error('Error batch enriching posts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to batch enrich posts'
    });
  }
});

// General analysis with custom prompt
app.post('/analyze/general', async (req, res) => {
  try {
    const { posts, prompt, postCount } = req.body;
    
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid posts data - array of posts required'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const selectedPosts = posts.slice(0, postCount || 10);
    
    console.log(`General analysis of ${selectedPosts.length} posts with custom prompt`);
    
    const analysis = await enricher.generalAnalysis(selectedPosts, prompt);
    
    // Save general analysis result
    const timestamp = Date.now();
    const analysisId = `general_${timestamp}`;
    const analysisResult = {
      id: analysisId,
      timestamp: new Date().toISOString(),
      posts_analyzed: selectedPosts.length,
      prompt_type: 'marketing_research',
      analysis: analysis,
      posts_context: selectedPosts.map(p => ({
        id: p.id,
        title: p.title,
        subreddit: p.subreddit
      }))
    };
    
    // Save to database
    await database.saveGeneralAnalysis(
      analysisId,
      selectedPosts.length,
      'marketing_research',
      analysis,
      analysisResult.posts_context
    );

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Error in general analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform general analysis'
    });
  }
});

// Delete enriched data for a post
app.delete('/enriched/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const result = await database.deleteEnrichedPost(postId);
    
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Enriched data deleted'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Post not found in enriched data'
      });
    }
  } catch (error) {
    console.error('Error deleting enriched post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server with database initialization
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Enrichment server running on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('  GET  /health - Health check');
      console.log('  GET  /enriched - Get all enriched data');
      console.log('  GET  /enriched/:postId - Get enriched data for specific post');
      console.log('  POST /enrich - Enrich a single post');
      console.log('  POST /enrich/batch - Batch enrich multiple posts');
      console.log('  POST /analyze/general - General analysis with custom prompt');
      console.log('  DELETE /enriched/:postId - Delete enriched data for post');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  database.close();
  process.exit(0);
});

startServer();

module.exports = app;