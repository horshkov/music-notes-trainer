const express = require('express');
const router = express.Router();
const limitlessApi = require('../services/limitlessApi');

// GET /api/markets - Get top markets for widgets
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const cacheKey = `top_markets_${limit}`;
    
    // Check cache first
    let markets = req.cache.get(cacheKey);
    
    if (!markets) {
      console.log(`📱 Fetching top ${limit} markets for widgets`);
      markets = await limitlessApi.getTopMarkets(limit);
      
      // Cache for 5 minutes
      req.cache.set(cacheKey, markets);
    } else {
      console.log(`📱 Serving cached markets (${markets.length} items)`);
    }

    res.json({
      success: true,
      data: markets,
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Markets API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
      message: error.message
    });
  }
});

// GET /api/markets/:id - Get specific market
router.get('/:id', async (req, res) => {
  try {
    const marketId = req.params.id;
    const cacheKey = `market_${marketId}`;
    
    let market = req.cache.get(cacheKey);
    
    if (!market) {
      console.log(`📱 Fetching market ${marketId} for widget`);
      market = await limitlessApi.getMarket(marketId);
      
      if (!market) {
        return res.status(404).json({
          success: false,
          error: 'Market not found'
        });
      }
      
      // Cache for 2 minutes (more frequent updates for specific markets)
      req.cache.set(cacheKey, market, 120);
    }

    res.json({
      success: true,
      data: market,
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Market ${req.params.id} API error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market',
      message: error.message
    });
  }
});

// GET /api/markets/widget/summary - Optimized endpoint for widget summary
router.get('/widget/summary', async (req, res) => {
  try {
    const cacheKey = 'widget_markets_summary';
    
    let summary = req.cache.get(cacheKey);
    
    if (!summary) {
      console.log('📱 Generating widget markets summary');
      const markets = await limitlessApi.getTopMarkets(3);
      
      summary = {
        topMarkets: markets,
        totalVolume: markets.reduce((sum, m) => sum + m.volume, 0),
        avgProbability: markets.reduce((sum, m) => sum + m.yesPrice, 0) / markets.length,
        activeMarkets: markets.filter(m => m.isActive).length
      };
      
      req.cache.set(cacheKey, summary);
    }

    res.json({
      success: true,
      data: summary,
      optimizedFor: 'iOS Widget',
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Widget summary API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate widget summary',
      message: error.message
    });
  }
});

module.exports = router;