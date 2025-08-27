import SwiftUI
import WidgetKit

struct LargeWidgetView: View {
    let entry: LimitlessWidgetEntry
    
    var body: some View {
        VStack(spacing: 12) {
            // Header
            HStack {
                Text("Limitless")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                Text(entry.date, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            if let portfolio = entry.portfolio {
                // Portfolio + Markets Layout
                HStack(spacing: 12) {
                    // Left: Portfolio
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Portfolio")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LargePortfolioView(portfolio: portfolio)
                    }
                    .frame(maxWidth: .infinity)
                    
                    Divider()
                    
                    // Right: Top Markets
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Markets")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        LargeMarketsView(markets: Array(entry.markets.prefix(4)))
                    }
                    .frame(maxWidth: .infinity)
                }
            } else {
                // Markets Only Layout
                VStack(alignment: .leading, spacing: 8) {
                    Text("Top Markets")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    LargeMarketsView(markets: Array(entry.markets.prefix(5)))
                }
            }
            
            Spacer()
        }
        .padding(16)
    }
}

struct LargePortfolioView: View {
    let portfolio: PortfolioData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Main stats
            VStack(alignment: .leading, spacing: 4) {
                Text(portfolio.formattedValue)
                    .font(.title2)
                    .fontWeight(.bold)
                
                HStack(spacing: 6) {
                    Text(portfolio.formattedPnL)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(portfolio.isProfit ? .green : .red)
                    
                    Text("(\(portfolio.pnlPercentage)%)")
                        .font(.caption)
                        .foregroundColor(portfolio.isProfit ? .green : .red)
                }
            }
            
            // Performance metrics
            HStack {
                MetricView(
                    title: "Win Rate",
                    value: portfolio.formattedWinRate,
                    color: .blue
                )
                
                Spacer()
                
                MetricView(
                    title: "Positions",
                    value: "\(portfolio.activePositions)",
                    color: .orange
                )
                
                Spacer()
                
                MetricView(
                    title: "Points",
                    value: portfolio.formattedPoints,
                    color: .purple
                )
            }
            
            // Top positions
            if !portfolio.topPositions.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Top Positions")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                    
                    ForEach(Array(portfolio.topPositions.prefix(2).enumerated()), id: \.element.id) { index, position in
                        PositionRowView(position: position)
                        
                        if index < min(1, portfolio.topPositions.count - 1) {
                            Divider()
                        }
                    }
                }
            }
        }
    }
}

struct LargeMarketsView: View {
    let markets: [MarketData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(Array(markets.enumerated()), id: \.element.id) { index, market in
                HStack(spacing: 8) {
                    // Market info
                    VStack(alignment: .leading, spacing: 2) {
                        Text(market.shortTitle)
                            .font(.caption)
                            .fontWeight(.medium)
                            .lineLimit(1)
                        
                        HStack(spacing: 4) {
                            Text(market.category)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                            
                            Circle()
                                .fill(.secondary)
                                .frame(width: 2, height: 2)
                            
                            Text(market.formattedVolume)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                    
                    // Price and change
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(market.formattedPrice)
                            .font(.caption)
                            .fontWeight(.semibold)
                        
                        HStack(spacing: 2) {
                            Image(systemName: market.change24h >= 0 ? "arrow.up" : "arrow.down")
                                .font(.caption2)
                            Text(String(format: "%.1f%%", abs(market.change24h)))
                                .font(.caption2)
                        }
                        .foregroundColor(market.change24h >= 0 ? .green : .red)
                    }
                }
                
                if index < markets.count - 1 {
                    Divider()
                }
            }
        }
    }
}

struct MetricView: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

struct PositionRowView: View {
    let position: Position
    
    var body: some View {
        HStack(spacing: 6) {
            VStack(alignment: .leading, spacing: 1) {
                Text(position.marketTitle)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .lineLimit(1)
                
                Text(position.outcome)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(position.formattedPnL)
                .font(.caption2)
                .fontWeight(.medium)
                .foregroundColor(position.pnl >= 0 ? .green : .red)
        }
    }
}

#Preview(as: .systemLarge) {
    LimitlessWidget()
} timeline: {
    LimitlessWidgetEntry(
        date: .now,
        markets: MarketData.sampleMarkets,
        portfolio: PortfolioData.samplePortfolio
    )
}