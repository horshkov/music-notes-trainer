#!/usr/bin/env python3
"""
Data Analysis Script for Limitless Exchange Market Data
Analyzes the retrieved market data and provides insights.
"""

import json
import glob
from datetime import datetime
from typing import Dict, List, Any


def load_latest_data() -> Dict[str, Any]:
    """Load the most recent data file."""
    data_files = glob.glob("limitless_data_*.json")
    if not data_files:
        print("No data files found. Please run the API client first.")
        return {}
    
    latest_file = max(data_files)
    print(f"Loading data from: {latest_file}")
    
    with open(latest_file, 'r') as f:
        return json.load(f)


def analyze_market_info(data: Dict[str, Any]) -> None:
    """Analyze market information."""
    market_info = data.get('market_info', {})
    
    print("\n" + "="*60)
    print("MARKET ANALYSIS")
    print("="*60)
    
    print(f"Market Title: {market_info.get('title', 'N/A')}")
    print(f"Market ID: {market_info.get('id', 'N/A')}")
    print(f"Status: {market_info.get('status', 'N/A')}")
    print(f"Expired: {market_info.get('expired', 'N/A')}")
    print(f"Winning Outcome Index: {market_info.get('winningOutcomeIndex', 'N/A')}")
    
    if market_info.get('metadata', {}).get('resolvePrice'):
        print(f"Resolve Price: ${market_info['metadata']['resolvePrice']:,.2f}")
    
    print(f"Volume: {market_info.get('volumeFormatted', 'N/A')} USDC")
    print(f"Liquidity: {market_info.get('liquidityFormatted', 'N/A')} USDC")
    print(f"Open Interest: {market_info.get('openInterestFormatted', 'N/A')} USDC")
    
    print(f"Created: {market_info.get('createdAt', 'N/A')}")
    print(f"Expiration: {market_info.get('expirationDate', 'N/A')}")
    print(f"Categories: {', '.join(market_info.get('categories', []))}")
    print(f"Tags: {', '.join(market_info.get('tags', []))}")


def analyze_feed_events(data: Dict[str, Any]) -> None:
    """Analyze feed events data."""
    feed_events = data.get('feed_events_from_market_info', [])
    
    print("\n" + "="*60)
    print("FEED EVENTS ANALYSIS")
    print("="*60)
    
    print(f"Total Events: {len(feed_events)}")
    
    if not feed_events:
        print("No feed events found.")
        return
    
    # Analyze event types
    event_types = {}
    total_volume = 0
    unique_users = set()
    
    for event in feed_events:
        event_type = event.get('eventType', 'UNKNOWN')
        event_types[event_type] = event_types.get(event_type, 0) + 1
        
        # Track volume
        if event.get('data', {}).get('tradeAmountUSD'):
            total_volume += float(event['data']['tradeAmountUSD'])
        
        # Track unique users
        if event.get('user', {}).get('account'):
            unique_users.add(event['user']['account'])
    
    print(f"Event Types: {event_types}")
    print(f"Total Trading Volume: ${total_volume:,.2f}")
    print(f"Unique Traders: {len(unique_users)}")
    
    # Show recent trades
    print(f"\nRecent Trades (last 5):")
    for i, event in enumerate(feed_events[:5]):
        if event.get('eventType') == 'NEW_TRADE':
            user = event.get('user', {})
            trade_data = event.get('data', {})
            
            print(f"  {i+1}. {user.get('displayName', user.get('account', 'Unknown'))}")
            print(f"     Strategy: {trade_data.get('strategy', 'N/A')} {trade_data.get('outcome', 'N/A')}")
            print(f"     Amount: ${trade_data.get('tradeAmountUSD', 'N/A')}")
            print(f"     Time: {event.get('timestamp', 'N/A')}")
            print()


def analyze_trading_patterns(data: Dict[str, Any]) -> None:
    """Analyze trading patterns."""
    feed_events = data.get('feed_events_from_market_info', [])
    
    if not feed_events:
        return
    
    print("\n" + "="*60)
    print("TRADING PATTERNS ANALYSIS")
    print("="*60)
    
    # Analyze outcomes
    outcomes = {}
    strategies = {}
    
    for event in feed_events:
        if event.get('eventType') == 'NEW_TRADE':
            outcome = event.get('data', {}).get('outcome', 'UNKNOWN')
            strategy = event.get('data', {}).get('strategy', 'UNKNOWN')
            
            outcomes[outcome] = outcomes.get(outcome, 0) + 1
            strategies[strategy] = strategies.get(strategy, 0) + 1
    
    print(f"Trading Outcomes: {outcomes}")
    print(f"Trading Strategies: {strategies}")
    
    # Time analysis
    if feed_events:
        timestamps = [event.get('timestamp') for event in feed_events if event.get('timestamp')]
        if timestamps:
            try:
                start_time = datetime.fromisoformat(timestamps[-1].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(timestamps[0].replace('Z', '+00:00'))
                duration = end_time - start_time
                print(f"Trading Period: {duration}")
                print(f"First Trade: {timestamps[-1]}")
                print(f"Last Trade: {timestamps[0]}")
            except Exception as e:
                print(f"Could not parse timestamps: {e}")


def main():
    """Main analysis function."""
    print("Limitless Exchange Data Analysis")
    print("="*60)
    
    # Load data
    data = load_latest_data()
    if not data:
        return
    
    # Run analyses
    analyze_market_info(data)
    analyze_feed_events(data)
    analyze_trading_patterns(data)
    
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
