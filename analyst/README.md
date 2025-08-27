# Limitless Exchange API Client

This project connects to the Limitless Exchange API to pull market feed events data from the specified market.

## Target Market

- **Market Slug**: `dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549`
- **Source URL**: https://limitless.exchange/markets/dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549?rv=3ZRZ58M83M

## Project Structure

```
analyst/
├── limitless_api_client.py    # Main API client
├── analyze_data.py            # Data analysis script
├── example_usage.py           # Usage examples
├── compare_markets.py         # Market comparison tool
├── requirements.txt           # Python dependencies
├── README.md                  # This file
└── limitless_data_*.json      # Generated data files
```

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API client:
   ```bash
   python3 limitless_api_client.py
   ```

## Features

- **Market Information**: Fetches basic market details
- **Feed Events**: Retrieves market feed events with configurable limits
- **Data Export**: Automatically saves retrieved data to JSON files with timestamps
- **Error Handling**: Comprehensive error handling and logging
- **Data Analysis**: Built-in analysis tools for market insights

## API Endpoints Used

- `GET /markets/{market_slug}` - Get market information
- `GET /markets/{market_slug}/get-feed-events` - Get market feed events

## Usage

### Basic Data Collection
```bash
python3 limitless_api_client.py
```

### Data Analysis
```bash
python3 analyze_data.py
```

### Example Usage
```bash
python3 example_usage.py
```

### Market Comparison
```bash
python3 compare_markets.py
```

## Example Code Usage

```python
from limitless_api_client import LimitlessExchangeAPI

# Initialize client
api_client = LimitlessExchangeAPI()

# Get market info
market_info = api_client.get_market_info("your-market-slug")

# Get feed events
feed_events = api_client.get_market_feed_events("your-market-slug", limit=100)
```

## Data Structure

The saved JSON file contains:
- Market information
- Feed events data
- Timestamp of data retrieval
- Market slug identifier
- Feed events from market info (included in market response)

## Sample Results

### BTC Market Analysis
- **Market**: $BTC above $116996.01 on Aug 15, 21:00 UTC?
- **Status**: RESOLVED (BTC price was $117,347.18)
- **Volume**: 2,451.02 USDC
- **Trading Activity**: 10 trades by 9 unique traders
- **Trading Period**: 5 minutes 22 seconds
- **All trades**: Buy YES positions (correct prediction)

### DOGE Market Analysis
- **Market**: $DOGE above $0.22223 on Aug 15, 20:00 UTC?
- **Status**: RESOLVED (DOGE price was $0.22190)
- **Volume**: 1,523.64 USDC
- **Trading Activity**: 10 trades by 10 unique traders
- **Trading Period**: 56 seconds
- **Trading Pattern**: 70% NO positions, 30% YES positions (majority was bearish, correctly predicted the outcome)

### Key Insights
- BTC market had 1.6x more volume than DOGE market
- BTC traders were 100% bullish and correct
- DOGE traders were 70% bearish and correct
- Both markets showed high trading activity in short time periods
