import Foundation

class WidgetApiService {
    private let baseURL: String
    private let session: URLSession
    
    init() {
        // Use local backend by default, can be configured for production
        self.baseURL = "http://localhost:3001/api"
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10.0
        config.timeoutIntervalForResource = 15.0
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Markets API
    func fetchTopMarkets(limit: Int = 5) async -> [MarketData] {
        do {
            let url = URL(string: "\(baseURL)/markets/widget/summary")!
            let (data, response) = try await session.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw APIError.invalidResponse
            }
            
            let apiResponse = try JSONDecoder().decode(ApiResponse<MarketsResponse>.self, from: data)
            
            if apiResponse.success {
                return Array(apiResponse.data.topMarkets.prefix(limit))
            } else {
                throw APIError.apiError(apiResponse.error ?? "Unknown error")
            }
            
        } catch {
            print("Widget API Error - Markets: \(error)")
            
            // Return cached data or sample data as fallback
            return getCachedMarkets() ?? MarketData.sampleMarkets
        }
    }
    
    func fetchMarket(id: String) async -> MarketData? {
        do {
            let url = URL(string: "\(baseURL)/markets/\(id)")!
            let (data, response) = try await session.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return nil
            }
            
            let apiResponse = try JSONDecoder().decode(ApiResponse<MarketData>.self, from: data)
            
            if apiResponse.success {
                return apiResponse.data
            }
            
        } catch {
            print("Widget API Error - Market \(id): \(error)")
        }
        
        return nil
    }
    
    // MARK: - Portfolio API
    func fetchPortfolio(address: String) async -> PortfolioData? {
        do {
            let url = URL(string: "\(baseURL)/portfolio/\(address)/widget")!
            let (data, response) = try await session.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                throw APIError.invalidResponse
            }
            
            let apiResponse = try JSONDecoder().decode(ApiResponse<PortfolioData>.self, from: data)
            
            if apiResponse.success {
                // Cache the portfolio data
                cachePortfolio(apiResponse.data, for: address)
                return apiResponse.data
            } else {
                throw APIError.apiError(apiResponse.error ?? "Unknown error")
            }
            
        } catch {
            print("Widget API Error - Portfolio \(address): \(error)")
            
            // Return cached portfolio or sample data
            return getCachedPortfolio(for: address) ?? PortfolioData.samplePortfolio
        }
    }
    
    // MARK: - Caching
    private func getCachedMarkets() -> [MarketData]? {
        guard let data = UserDefaults.shared.data(forKey: "cached_markets"),
              let cachedData = try? JSONDecoder().decode(CachedData<[MarketData]>.self, from: data),
              cachedData.isValid else {
            return nil
        }
        
        return cachedData.data
    }
    
    private func cacheMarkets(_ markets: [MarketData]) {
        let cachedData = CachedData(data: markets, timestamp: Date())
        if let data = try? JSONEncoder().encode(cachedData) {
            UserDefaults.shared.set(data, forKey: "cached_markets")
        }
    }
    
    private func getCachedPortfolio(for address: String) -> PortfolioData? {
        let key = "cached_portfolio_\(address)"
        guard let data = UserDefaults.shared.data(forKey: key),
              let cachedData = try? JSONDecoder().decode(CachedData<PortfolioData>.self, from: data),
              cachedData.isValid else {
            return nil
        }
        
        return cachedData.data
    }
    
    private func cachePortfolio(_ portfolio: PortfolioData, for address: String) {
        let key = "cached_portfolio_\(address)"
        let cachedData = CachedData(data: portfolio, timestamp: Date())
        if let data = try? JSONEncoder().encode(cachedData) {
            UserDefaults.shared.set(data, forKey: key)
        }
    }
}

// MARK: - Supporting Types
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case apiError(String)
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .apiError(let message):
            return "API Error: \(message)"
        case .networkError(let error):
            return "Network Error: \(error.localizedDescription)"
        }
    }
}

struct CachedData<T: Codable>: Codable {
    let data: T
    let timestamp: Date
    
    // Data is valid for 10 minutes
    var isValid: Bool {
        Date().timeIntervalSince(timestamp) < 600
    }
}

// MARK: - Configuration
extension WidgetApiService {
    static func configureForProduction() {
        UserDefaults.shared.set("https://your-production-api.com/api", forKey: "widget_api_base_url")
    }
    
    static func setWalletAddress(_ address: String) {
        UserDefaults.shared.set(address, forKey: "widget_wallet_address")
    }
    
    static func getWalletAddress() -> String? {
        return UserDefaults.shared.string(forKey: "widget_wallet_address")
    }
}