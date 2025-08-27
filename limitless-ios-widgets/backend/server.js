const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
require('dotenv').config();

const marketsRoutes = require('./routes/markets');
const portfolioRoutes = require('./routes/portfolio');

const app = express();
const PORT = process.env.PORT || 3001;

// Cache for 5 minutes (widgets update frequently)
const cache = new NodeCache({ stdTTL: 300 });

// Middleware
app.use(cors());
app.use(express.json());

// Make cache available to routes
app.use((req, res, next) => {
  req.cache = cache;
  next();
});

// Routes
app.use('/api/markets', marketsRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cacheStats: {
      keys: req.cache.keys().length,
      hits: req.cache.getStats().hits,
      misses: req.cache.getStats().misses
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Limitless iOS Widgets Backend running on port ${PORT}`);
  console.log(`📱 Optimized for iOS widget data delivery`);
  console.log(`🔄 Cache TTL: 5 minutes`);
});