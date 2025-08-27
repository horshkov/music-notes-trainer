const axios = require('axios');

class LimitlessApiService {
  constructor() {
    this.baseURL = process.env.LIMITLESS_API_URL || 'https://api.limitless.exchange';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Limitless-iOS-Widgets/1.0'
      }
    });
  }

  // Get top markets for widgets (simplified data)
  async getTopMarkets(limit = 5) {
    try {
      // This would be the actual Limitless API endpoint
      const response = await this.client.get('/markets', {
        params: {
          limit,
          sort: 'volume',
          status: 'active'
        }
      });

      // Transform data for widget consumption
      return response.data.map(market => ({
        id: market.id,
        title: this.truncateTitle(market.title, 50),
        shortTitle: this.truncateTitle(market.title, 25),
        yesPrice: market.yesPrice,
        noPrice: market.noPrice,
        volume: market.volume,
        change24h: market.change24h || 0,
        category: market.category,
        endDate: market.endDate,
        isActive: new Date(market.endDate) > new Date()
      }));

    } catch (error) {
      console.error('Error fetching top markets:', error.message);
      
      // Return mock data for development/testing
      return this.getMockMarkets(limit);
    }
  }

  // Get specific market data
  async getMarket(marketId) {
    try {
      const response = await this.client.get(`/markets/${marketId}`);
      const market = response.data;

      return {
        id: market.id,
        title: market.title,
        shortTitle: this.truncateTitle(market.title, 30),
        description: market.description,
        yesPrice: market.yesPrice,
        noPrice: market.noPrice,
        volume: market.volume,
        uniqueTraders: market.uniqueTraders,
        change24h: market.change24h || 0,
        category: market.category,
        endDate: market.endDate,
        isActive: new Date(market.endDate) > new Date(),
        probability: market.yesPrice
      };

    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error.message);
      return null;
    }
  }

  // Get portfolio summary for a wallet address
  async getPortfolioSummary(walletAddress) {
    try {
      const response = await this.client.get(`/portfolio/${walletAddress}`);
      const portfolio = response.data;

      return {
        totalValue: portfolio.totalValue || 0,
        totalPnL: portfolio.totalPnL || 0,
        winRate: portfolio.winRate || 0,
        activePositions: portfolio.activePositions || 0,
        totalVolume: portfolio.totalVolume || 0,
        points: portfolio.points || 0,
        positions: (portfolio.positions || []).slice(0, 3).map(pos => ({
          marketTitle: this.truncateTitle(pos.marketTitle, 30),
          outcome: pos.outcome,
          pnl: pos.pnl,
          currentValue: pos.currentValue
        }))
      };

    } catch (error) {
      console.error(`Error fetching portfolio for ${walletAddress}:`, error.message);
      
      // Return mock portfolio for development
      return this.getMockPortfolio();
    }
  }

  // Utility method to truncate titles for widget display
  truncateTitle(title, maxLength) {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  }

  // Mock data for development/testing
  getMockMarkets(limit = 5) {
    const mockMarkets = [
      {
        id: '1',
        title: 'Will Bitcoin reach $100,000 by end of 2024?',
        shortTitle: 'BTC $100K by 2024?',
        yesPrice: 75.5,
        noPrice: 24.5,
        volume: 125000,
        change24h: 2.3,
        category: 'Crypto',
        endDate: '2024-12-31T23:59:59Z',
        isActive: true
      },
      {
        id: '2',
        title: 'Will Apple stock hit $200 this quarter?',
        shortTitle: 'AAPL $200 this Q?',
        yesPrice: 42.3,
        noPrice: 57.7,
        volume: 89000,
        change24h: -1.2,
        category: 'Stocks',
        endDate: '2024-12-31T23:59:59Z',
        isActive: true
      },
      {
        id: '3',
        title: 'Will Ethereum hit $5000 before March?',
        shortTitle: 'ETH $5K before March?',
        yesPrice: 68.2,
        noPrice: 31.8,
        volume: 203000,
        change24h: 4.1,
        category: 'Crypto',
        endDate: '2024-03-31T23:59:59Z',
        isActive: true
      }
    ];

    return mockMarkets.slice(0, limit);
  }

  getMockPortfolio() {
    return {
      totalValue: 1250.75,
      totalPnL: 125.50,
      winRate: 68.5,
      activePositions: 5,
      totalVolume: 5420.00,
      points: 2840,
      positions: [
        {
          marketTitle: 'BTC $100K by 2024?',
          outcome: 'YES',
          pnl: 15.25,
          currentValue: 75.50
        },
        {
          marketTitle: 'AAPL $200 this Q?',
          outcome: 'NO',
          pnl: -8.75,
          currentValue: 42.30
        }
      ]
    };
  }
}

module.exports = new LimitlessApiService();