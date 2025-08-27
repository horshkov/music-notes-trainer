#!/usr/bin/env python3
"""
Example usage of the Limitless Exchange API Client
Demonstrates how to use the API client programmatically.
"""

from limitless_api_client import LimitlessExchangeAPI
import json


def example_basic_usage():
    """Basic usage example."""
    print("=== Basic API Usage Example ===")
    
    # Initialize the API client
    api_client = LimitlessExchangeAPI()
    
    # Market slugs from the provided URLs
    btc_market_slug = "dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549"
    doge_market_slug = "dollardoge-above-dollar022223-on-aug-15-2000-utc-1755284410619"
    
    # Get BTC market information
    print(f"Fetching BTC market info for: {btc_market_slug}")
    btc_market_info = api_client.get_market_info(btc_market_slug)
    
    if "error" not in btc_market_info:
        print(f"✓ BTC Market found: {btc_market_info.get('title', 'Unknown')}")
        print(f"  Status: {btc_market_info.get('status', 'Unknown')}")
        print(f"  Volume: {btc_market_info.get('volumeFormatted', 'Unknown')} USDC")
        print(f"  Resolve Price: ${btc_market_info.get('metadata', {}).get('resolvePrice', 'N/A')}")
    else:
        print(f"✗ BTC Market Error: {btc_market_info['error']}")
    
    # Get DOGE market information
    print(f"\nFetching DOGE market info for: {doge_market_slug}")
    doge_market_info = api_client.get_market_info(doge_market_slug)
    
    if "error" not in doge_market_info:
        print(f"✓ DOGE Market found: {doge_market_info.get('title', 'Unknown')}")
        print(f"  Status: {doge_market_info.get('status', 'Unknown')}")
        print(f"  Volume: {doge_market_info.get('volumeFormatted', 'Unknown')} USDC")
        print(f"  Resolve Price: ${doge_market_info.get('metadata', {}).get('resolvePrice', 'N/A')}")
    else:
        print(f"✗ DOGE Market Error: {doge_market_info['error']}")


def example_feed_events():
    """Example of fetching feed events."""
    print("\n=== Feed Events Example ===")
    
    api_client = LimitlessExchangeAPI()
    market_slug = "dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549"
    
    # Get feed events
    print(f"Fetching feed events for: {market_slug}")
    feed_events = api_client.get_market_feed_events(market_slug, limit=10)
    
    if "error" not in feed_events:
        events = feed_events.get('events', [])
        print(f"✓ Retrieved {len(events)} events")
        
        # Show first few events
        for i, event in enumerate(events[:3]):
            if event.get('eventType') == 'NEW_TRADE':
                user = event.get('user', {})
                data = event.get('data', {})
                print(f"  {i+1}. {user.get('displayName', user.get('account', 'Unknown'))}")
                print(f"     {data.get('strategy', 'N/A')} {data.get('outcome', 'N/A')} - ${data.get('tradeAmountUSD', 'N/A')}")
    else:
        print(f"✗ Error: {feed_events['error']}")


def example_custom_market():
    """Example with a different market (you can modify the slug)."""
    print("\n=== Custom Market Example ===")
    
    api_client = LimitlessExchangeAPI()
    
    # You can change this to any other market slug
    custom_market_slug = "dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549"
    
    print(f"Fetching info for custom market: {custom_market_slug}")
    market_info = api_client.get_market_info(custom_market_slug)
    
    if "error" not in market_info:
        print(f"✓ Market: {market_info.get('title', 'Unknown')}")
        print(f"  Categories: {', '.join(market_info.get('categories', []))}")
        print(f"  Tags: {', '.join(market_info.get('tags', []))}")
        
        # Show feed events if available
        feed_events = market_info.get('feedEvents', [])
        if feed_events:
            print(f"  Recent events: {len(feed_events)}")
            for event in feed_events[:2]:
                if event.get('eventType') == 'NEW_TRADE':
                    data = event.get('data', {})
                    print(f"    - {data.get('strategy', 'N/A')} {data.get('outcome', 'N/A')} for ${data.get('tradeAmountUSD', 'N/A')}")
    else:
        print(f"✗ Error: {market_info['error']}")


def example_error_handling():
    """Example of error handling."""
    print("\n=== Error Handling Example ===")
    
    api_client = LimitlessExchangeAPI()
    
    # Try to fetch a non-existent market
    invalid_slug = "non-existent-market-123"
    print(f"Trying to fetch invalid market: {invalid_slug}")
    
    result = api_client.get_market_info(invalid_slug)
    
    if "error" in result:
        print(f"✓ Properly handled error: {result['error']}")
    else:
        print("Unexpected: No error returned for invalid market")


def main():
    """Run all examples."""
    print("Limitless Exchange API Client - Usage Examples")
    print("=" * 60)
    
    try:
        example_basic_usage()
        example_feed_events()
        example_custom_market()
        example_error_handling()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error running examples: {e}")


if __name__ == "__main__":
    main()
