import Foundation

// MARK: - Market Data Models
struct MarketData: Codable, Identifiable {
    let id: String
    let title: String
    let shortTitle: String
    let yesPrice: Double
    let noPrice: Double
    let volume: Double
    let change24h: Double
    let category: String
    let endDate: String
    let isActive: Bool
    
    var probabilityPercent: Double {
        yesPrice
    }
    
    var formattedVolume: String {
        if volume >= 1_000_000 {
            return String(format: "%.1fM", volume / 1_000_000)
        } else if volume >= 1_000 {
            return String(format: "%.1fK", volume / 1_000)
        } else {
            return String(format: "%.0f", volume)
        }
    }
    
    var formattedPrice: String {
        return String(format: "%.1f¢", yesPrice)
    }
    
    var changeColor: String {
        return change24h >= 0 ? "green" : "red"
    }
}

// MARK: - Portfolio Data Models
struct PortfolioData: Codable {
    let totalValue: Double
    let totalPnL: Double
    let pnlPercentage: String
    let winRate: Double
    let activePositions: Int
    let points: Int
    let topPositions: [Position]
    let isProfit: Bool
    let performanceColor: String
    let hasActivePositions: Bool
    let address: String
    
    var formattedValue: String {
        return String(format: "$%.2f", totalValue)
    }
    
    var formattedPnL: String {
        let sign = totalPnL >= 0 ? "+" : ""
        return "\(sign)$\(String(format: "%.2f", totalPnL))"
    }
    
    var formattedWinRate: String {
        return String(format: "%.1f%%", winRate)
    }
    
    var formattedPoints: String {
        if points >= 1000 {
            return String(format: "%.1fK", Double(points) / 1000)
        } else {
            return String(points)
        }
    }
}

struct Position: Codable, Identifiable {
    let marketTitle: String
    let outcome: String
    let pnl: Double
    let currentValue: Double
    
    var id: String {
        return marketTitle + outcome
    }
    
    var formattedPnL: String {
        let sign = pnl >= 0 ? "+" : ""
        return "\(sign)$\(String(format: "%.2f", pnl))"
    }
    
    var pnlColor: String {
        return pnl >= 0 ? "green" : "red"
    }
}

// MARK: - API Response Models
struct ApiResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
    let cached: Bool?
    let timestamp: String
    let error: String?
    let message: String?
}

struct MarketsResponse: Codable {
    let topMarkets: [MarketData]
    let totalVolume: Double
    let avgProbability: Double
    let activeMarkets: Int
}

// MARK: - Widget Configuration
enum WidgetSize: String, CaseIterable {
    case small = "small"
    case medium = "medium"
    case large = "large"
    
    var maxMarkets: Int {
        switch self {
        case .small: return 1
        case .medium: return 3
        case .large: return 5
        }
    }
    
    var maxPositions: Int {
        switch self {
        case .small: return 0
        case .medium: return 1
        case .large: return 3
        }
    }
}

// MARK: - Widget Data Container
struct LimitlessWidgetData: Codable {
    let markets: [MarketData]
    let portfolio: PortfolioData?
    let lastUpdated: Date
    let dataSource: String
    
    init(markets: [MarketData], portfolio: PortfolioData? = nil) {
        self.markets = markets
        self.portfolio = portfolio
        self.lastUpdated = Date()
        self.dataSource = "Limitless API"
    }
    
    var formattedLastUpdated: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: lastUpdated)
    }
}

// MARK: - Sample Data for Previews
extension MarketData {
    static let sampleMarket = MarketData(
        id: "1",
        title: "Will Bitcoin reach $100,000 by end of 2024?",
        shortTitle: "BTC $100K by 2024?",
        yesPrice: 75.5,
        noPrice: 24.5,
        volume: 125000,
        change24h: 2.3,
        category: "Crypto",
        endDate: "2024-12-31T23:59:59Z",
        isActive: true
    )
    
    static let sampleMarkets = [
        sampleMarket,
        MarketData(
            id: "2",
            title: "Will Apple stock hit $200 this quarter?",
            shortTitle: "AAPL $200 this Q?",
            yesPrice: 42.3,
            noPrice: 57.7,
            volume: 89000,
            change24h: -1.2,
            category: "Stocks",
            endDate: "2024-12-31T23:59:59Z",
            isActive: true
        )
    ]
}

extension PortfolioData {
    static let samplePortfolio = PortfolioData(
        totalValue: 1250.75,
        totalPnL: 125.50,
        pnlPercentage: "11.1",
        winRate: 68.5,
        activePositions: 5,
        points: 2840,
        topPositions: [
            Position(marketTitle: "BTC $100K?", outcome: "YES", pnl: 15.25, currentValue: 75.50),
            Position(marketTitle: "AAPL $200?", outcome: "NO", pnl: -8.75, currentValue: 42.30)
        ],
        isProfit: true,
        performanceColor: "green",
        hasActivePositions: true,
        address: "0x1234...5678"
    )
}