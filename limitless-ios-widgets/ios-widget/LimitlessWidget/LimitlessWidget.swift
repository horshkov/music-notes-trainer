import WidgetKit
import SwiftUI

// MARK: - Widget Provider
struct LimitlessWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> LimitlessWidgetEntry {
        LimitlessWidgetEntry(
            date: Date(),
            markets: MarketData.sampleMarkets,
            portfolio: PortfolioData.samplePortfolio
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (LimitlessWidgetEntry) -> ()) {
        let entry = LimitlessWidgetEntry(
            date: Date(),
            markets: MarketData.sampleMarkets,
            portfolio: PortfolioData.samplePortfolio
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        Task {
            let entries = await fetchWidgetData(for: context.family)
            let timeline = Timeline(entries: entries, policy: .atEnd)
            completion(timeline)
        }
    }
    
    private func fetchWidgetData(for family: WidgetFamily) async -> [LimitlessWidgetEntry] {
        let apiService = WidgetApiService()
        
        do {
            // Fetch markets data
            let markets = await apiService.fetchTopMarkets(limit: family.maxMarkets)
            
            // Fetch portfolio data if needed (for medium/large widgets)
            var portfolio: PortfolioData? = nil
            if family != .systemSmall, let walletAddress = UserDefaults.shared.string(forKey: "widget_wallet_address") {
                portfolio = await apiService.fetchPortfolio(address: walletAddress)
            }
            
            // Create entries for next 4 hours (15-minute intervals)
            var entries: [LimitlessWidgetEntry] = []
            let currentDate = Date()
            
            for hourOffset in 0..<4 {
                for minuteOffset in stride(from: 0, to: 60, by: 15) {
                    let entryDate = Calendar.current.date(
                        byAdding: .minute,
                        value: hourOffset * 60 + minuteOffset,
                        to: currentDate
                    )!
                    
                    let entry = LimitlessWidgetEntry(
                        date: entryDate,
                        markets: markets,
                        portfolio: portfolio
                    )
                    entries.append(entry)
                }
            }
            
            return entries
            
        } catch {
            print("Widget API Error: \(error)")
            
            // Return fallback entry with sample data
            return [LimitlessWidgetEntry(
                date: Date(),
                markets: MarketData.sampleMarkets,
                portfolio: nil
            )]
        }
    }
}

// MARK: - Widget Entry
struct LimitlessWidgetEntry: TimelineEntry {
    let date: Date
    let markets: [MarketData]
    let portfolio: PortfolioData?
    
    var hasPortfolio: Bool {
        portfolio != nil
    }
}

// MARK: - Widget View
struct LimitlessWidgetEntryView: View {
    var entry: LimitlessWidgetProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SmallWidgetView(entry: entry)
            case .systemMedium:
                MediumWidgetView(entry: entry)
            case .systemLarge:
                LargeWidgetView(entry: entry)
            default:
                SmallWidgetView(entry: entry)
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

// MARK: - Widget Configuration
struct LimitlessWidget: Widget {
    let kind: String = "LimitlessWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LimitlessWidgetProvider()) { entry in
            LimitlessWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Limitless Markets")
        .description("Stay updated with your favorite prediction markets and portfolio.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Extensions
extension WidgetFamily {
    var maxMarkets: Int {
        switch self {
        case .systemSmall: return 1
        case .systemMedium: return 3
        case .systemLarge: return 5
        default: return 1
        }
    }
}

extension UserDefaults {
    static let shared = UserDefaults(suiteName: "group.com.limitless.widgets")!
}

// MARK: - Preview
#Preview(as: .systemSmall) {
    LimitlessWidget()
} timeline: {
    LimitlessWidgetEntry(
        date: .now,
        markets: MarketData.sampleMarkets,
        portfolio: PortfolioData.samplePortfolio
    )
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

#Preview(as: .systemLarge) {
    LimitlessWidget()
} timeline: {
    LimitlessWidgetEntry(
        date: .now,
        markets: MarketData.sampleMarkets,
        portfolio: PortfolioData.samplePortfolio
    )
}