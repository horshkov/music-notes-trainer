const express = require('express');
const router = express.Router();
const limitlessApi = require('../services/limitlessApi');

// GET /api/portfolio/:address - Get portfolio summary for widgets
router.get('/:address', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    
    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const cacheKey = `portfolio_${walletAddress}`;
    
    let portfolio = req.cache.get(cacheKey);
    
    if (!portfolio) {
      console.log(`📱 Fetching portfolio for ${walletAddress} for widget`);
      portfolio = await limitlessApi.getPortfolioSummary(walletAddress);
      
      // Cache for 3 minutes (portfolio updates frequently)
      req.cache.set(cacheKey, portfolio, 180);
    } else {
      console.log(`📱 Serving cached portfolio for ${walletAddress.substring(0, 6)}...`);
    }

    res.json({
      success: true,
      data: portfolio,
      address: walletAddress,
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Portfolio API error for ${req.params.address}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio',
      message: error.message
    });
  }
});

// GET /api/portfolio/:address/widget - Optimized portfolio data for widgets
router.get('/:address/widget', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const cacheKey = `portfolio_widget_${walletAddress}`;
    
    let widgetData = req.cache.get(cacheKey);
    
    if (!widgetData) {
      console.log(`📱 Generating widget portfolio data for ${walletAddress}`);
      const portfolio = await limitlessApi.getPortfolioSummary(walletAddress);
      
      // Optimize data specifically for widget display
      widgetData = {
        // Primary stats for small widget
        totalValue: portfolio.totalValue,
        totalPnL: portfolio.totalPnL,
        pnlPercentage: portfolio.totalValue > 0 ? 
          ((portfolio.totalPnL / (portfolio.totalValue - portfolio.totalPnL)) * 100).toFixed(1) : 0,
        
        // Secondary stats for medium widget
        winRate: portfolio.winRate,
        activePositions: portfolio.activePositions,
        points: portfolio.points,
        
        // Top positions for large widget
        topPositions: portfolio.positions.slice(0, 2),
        
        // Performance indicators
        isProfit: portfolio.totalPnL >= 0,
        performanceColor: portfolio.totalPnL >= 0 ? 'green' : 'red',
        
        // Status
        hasActivePositions: portfolio.activePositions > 0,
        address: `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
      };
      
      req.cache.set(cacheKey, widgetData, 180);
    }

    res.json({
      success: true,
      data: widgetData,
      optimizedFor: 'iOS Widget',
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Portfolio widget API error for ${req.params.address}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio widget data',
      message: error.message
    });
  }
});

// GET /api/portfolio/:address/positions - Get active positions
router.get('/:address/positions', async (req, res) => {
  try {
    const walletAddress = req.params.address;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const cacheKey = `positions_${walletAddress}_${limit}`;
    
    let positions = req.cache.get(cacheKey);
    
    if (!positions) {
      console.log(`📱 Fetching ${limit} positions for ${walletAddress}`);
      const portfolio = await limitlessApi.getPortfolioSummary(walletAddress);
      
      positions = portfolio.positions.slice(0, limit);
      req.cache.set(cacheKey, positions, 180);
    }

    res.json({
      success: true,
      data: positions,
      total: positions.length,
      cached: req.cache.has(cacheKey),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Positions API error for ${req.params.address}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions',
      message: error.message
    });
  }
});

module.exports = router;