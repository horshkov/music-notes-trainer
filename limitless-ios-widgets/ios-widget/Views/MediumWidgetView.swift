import SwiftUI
import WidgetKit

struct MediumWidgetView: View {
    let entry: LimitlessWidgetEntry
    
    var body: some View {
        HStack(spacing: 12) {
            // Left side - Markets
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Text("Markets")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text("\(entry.markets.count)")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.secondary.opacity(0.2))
                        .cornerRadius(8)
                }
                
                // Markets list
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(Array(entry.markets.prefix(3).enumerated()), id: \.element.id) { index, market in
                        MarketRowView(market: market, isCompact: true)
                        
                        if index < min(2, entry.markets.count - 1) {
                            Divider()
                        }
                    }
                }
                
                Spacer()
            }
            
            // Right side - Portfolio or Market Details
            VStack(alignment: .leading, spacing: 8) {
                if let portfolio = entry.portfolio {
                    PortfolioSummaryView(portfolio: portfolio)
                } else {
                    // Extended market info when no portfolio
                    if let topMarket = entry.markets.first {
                        MarketDetailView(market: topMarket)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding(12)
    }
}

struct MarketRowView: View {
    let market: MarketData
    let isCompact: Bool
    
    var body: some View {
        HStack(spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text(market.shortTitle)
                    .font(isCompact ? .caption2 : .caption)
                    .fontWeight(.medium)
                    .lineLimit(1)
                
                Text(market.category)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(market.formattedPrice)
                    .font(isCompact ? .caption : .callout)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                HStack(spacing: 2) {
                    Image(systemName: market.change24h >= 0 ? "arrow.up" : "arrow.down")
                        .font(.caption2)
                    Text(String(format: "%.1f%%", abs(market.change24h)))
                        .font(.caption2)
                }
                .foregroundColor(market.change24h >= 0 ? .green : .red)
            }
        }
    }
}

struct PortfolioSummaryView: View {
    let portfolio: PortfolioData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text("Portfolio")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text(portfolio.address)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            // Value & P&L
            VStack(alignment: .leading, spacing: 4) {
                Text(portfolio.formattedValue)
                    .font(.title3)
                    .fontWeight(.bold)
                
                HStack(spacing: 4) {
                    Text(portfolio.formattedPnL)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(portfolio.isProfit ? .green : .red)
                    
                    Text("(\(portfolio.pnlPercentage)%)")
                        .font(.caption2)
                        .foregroundColor(portfolio.isProfit ? .green : .red)
                }
            }
            
            // Stats
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(portfolio.formattedWinRate)
                        .font(.caption)
                        .fontWeight(.medium)
                    Text("Win Rate")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text(portfolio.formattedPoints)
                        .font(.caption)
                        .fontWeight(.medium)
                    Text("Points")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
    }
}

struct MarketDetailView: View {
    let market: MarketData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Details")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
            
            // Probability bar
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("YES")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(Int(market.yesPrice))%")
                        .font(.caption)
                        .fontWeight(.medium)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(.secondary.opacity(0.2))
                            .frame(height: 6)
                            .cornerRadius(3)
                        
                        Rectangle()
                            .fill(.blue)
                            .frame(width: geometry.size.width * (market.yesPrice / 100), height: 6)
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
            }
            
            // Volume & Status
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(market.formattedVolume)
                        .font(.caption)
                        .fontWeight(.medium)
                    Text("Volume")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                HStack(spacing: 4) {
                    Circle()
                        .fill(market.isActive ? .green : .gray)
                        .frame(width: 6, height: 6)
                    Text(market.isActive ? "Active" : "Ended")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
    }
}

#Preview(as: .systemMedium) {
    LimitlessWidget()
} timeline: {
    LimitlessWidgetEntry(
        date: .now,
        markets: MarketData.sampleMarkets,
        portfolio: PortfolioData.samplePortfolio
    )
}