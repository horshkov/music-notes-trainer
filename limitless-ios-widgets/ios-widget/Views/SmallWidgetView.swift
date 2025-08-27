import SwiftUI
import WidgetKit

struct SmallWidgetView: View {
    let entry: LimitlessWidgetEntry
    
    var body: some View {
        if let market = entry.markets.first {
            VStack(alignment: .leading, spacing: 4) {
                // Header
                HStack {
                    Text("Limitless")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Circle()
                        .fill(market.isActive ? .green : .gray)
                        .frame(width: 6, height: 6)
                }
                
                Spacer()
                
                // Market Title
                Text(market.shortTitle)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                
                Spacer()
                
                // Price & Probability
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(market.formattedPrice)
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text("YES")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        HStack(spacing: 2) {
                            Image(systemName: market.change24h >= 0 ? "arrow.up" : "arrow.down")
                                .font(.caption2)
                            Text(String(format: "%.1f%%", abs(market.change24h)))
                                .font(.caption2)
                        }
                        .foregroundColor(market.change24h >= 0 ? .green : .red)
                        
                        Text(market.formattedVolume)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(12)
        } else {
            // No data state
            VStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                Text("No Markets")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

#Preview(as: .systemSmall) {
    LimitlessWidget()
} timeline: {
    LimitlessWidgetEntry(
        date: .now,
        markets: MarketData.sampleMarkets,
        portfolio: nil
    )
}