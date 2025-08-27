#!/usr/bin/env python3
"""
Limitless Exchange API Client
Connects to the Limitless Exchange API to pull market feed events data.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any


class LimitlessExchangeAPI:
    """Client for interacting with the Limitless Exchange API."""
    
    def __init__(self, base_url: str = "https://api.limitless.exchange"):
        """
        Initialize the API client.
        
        Args:
            base_url: Base URL for the Limitless Exchange API
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'LimitlessExchangeAPIClient/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    
    def get_market_feed_events(self, market_slug: str, limit: int = 100) -> Dict[str, Any]:
        """
        Get feed events for a specific market.
        
        Args:
            market_slug: The market slug identifier
            limit: Number of events to retrieve (default: 100)
            
        Returns:
            Dictionary containing the API response
        """
        endpoint = f"{self.base_url}/markets/{market_slug}/get-feed-events"
        
        params = {
            'limit': limit
        }
        
        try:
            print(f"Fetching feed events from: {endpoint}")
            print(f"Parameters: {params}")
            
            response = self.session.get(endpoint, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response content: {e.response.text}")
            return {"error": str(e)}
    
    def get_market_info(self, market_slug: str) -> Dict[str, Any]:
        """
        Get basic market information.
        
        Args:
            market_slug: The market slug identifier
            
        Returns:
            Dictionary containing market information
        """
        endpoint = f"{self.base_url}/markets/{market_slug}"
        
        try:
            print(f"Fetching market info from: {endpoint}")
            
            response = self.session.get(endpoint)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching market info: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response content: {e.response.text}")
            return {"error": str(e)}


def main():
    """Main function to demonstrate API usage."""
    
    # Market slug from the provided URL
    market_slug = "dollardoge-above-dollar022223-on-aug-15-2000-utc-1755284410619"
    
    # Initialize API client
    api_client = LimitlessExchangeAPI()
    
    print("=" * 60)
    print("Limitless Exchange API Client")
    print("=" * 60)
    print(f"Target Market: {market_slug}")
    print(f"Source URL: https://limitless.exchange/markets/{market_slug}")
    print("=" * 60)
    
    # Get market information first
    print("\n1. Fetching market information...")
    market_info = api_client.get_market_info(market_slug)
    
    if "error" not in market_info:
        print("✓ Market information retrieved successfully")
        print(f"Market data: {json.dumps(market_info, indent=2)}")
    else:
        print(f"✗ Failed to get market info: {market_info['error']}")
    
    # Save data to file (even if separate feed events call fails, we have feed events in market info)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"limitless_data_{timestamp}.json"
    
    # Get feed events (optional - we already have them in market_info)
    print("\n2. Fetching additional feed events...")
    feed_events = api_client.get_market_feed_events(market_slug, limit=50)
    
    if "error" not in feed_events:
        print("✓ Additional feed events retrieved successfully")
        print(f"Number of additional events: {len(feed_events.get('events', []))}")
    else:
        print(f"✗ Failed to get additional feed events: {feed_events['error']}")
        print("Note: Feed events are already included in the market information")
        feed_events = {"events": []}  # Empty events for consistency
    
    # Save all data to file
    with open(filename, 'w') as f:
        json.dump({
            "market_info": market_info,
            "feed_events": feed_events,
            "timestamp": datetime.now().isoformat(),
            "market_slug": market_slug,
            "feed_events_from_market_info": market_info.get('feedEvents', [])
        }, f, indent=2)
    
    print(f"\n✓ Data saved to: {filename}")
    print(f"✓ Market info includes {len(market_info.get('feedEvents', []))} feed events")
    
    print("\n" + "=" * 60)
    print("API Client execution completed")
    print("=" * 60)


if __name__ == "__main__":
    main()
