#!/usr/bin/env python3
"""
Market Comparison Script
Compares the BTC and DOGE markets side by side.
"""

from limitless_api_client import LimitlessExchangeAPI
import json
from datetime import datetime


def compare_markets():
    """Compare BTC and DOGE markets."""
    print("Limitless Exchange - Market Comparison")
    print("=" * 80)
    
    # Initialize API client
    api_client = LimitlessExchangeAPI()
    
    # Market slugs
    btc_market_slug = "dollarbtc-above-dollar11699601-on-aug-15-2100-utc-1755288010549"
    doge_market_slug = "dollardoge-above-dollar022223-on-aug-15-2000-utc-1755284410619"
    
    # Fetch market data
    print("Fetching market data...")
    btc_market = api_client.get_market_info(btc_market_slug)
    doge_market = api_client.get_market_info(doge_market_slug)
    
    if "error" in btc_market or "error" in doge_market:
        print("Error fetching market data")
        return
    
    # Display comparison table
    print("\n" + "=" * 80)
    print("MARKET COMPARISON")
    print("=" * 80)
    
    print(f"{'Metric':<25} {'BTC Market':<25} {'DOGE Market':<25}")
    print("-" * 80)
    
    print(f"{'Market Title':<25} {btc_market.get('title', 'N/A')[:23]:<25} {doge_market.get('title', 'N/A')[:23]:<25}")
    print(f"{'Market ID':<25} {btc_market.get('id', 'N/A'):<25} {doge_market.get('id', 'N/A'):<25}")
    print(f"{'Status':<25} {btc_market.get('status', 'N/A'):<25} {doge_market.get('status', 'N/A'):<25}")
    print(f"{'Winning Outcome':<25} {btc_market.get('winningOutcomeIndex', 'N/A'):<25} {doge_market.get('winningOutcomeIndex', 'N/A'):<25}")
    
    btc_resolve = btc_market.get('metadata', {}).get('resolvePrice', 'N/A')
    doge_resolve = doge_market.get('metadata', {}).get('resolvePrice', 'N/A')
    print(f"{'Resolve Price':<25} ${btc_resolve:<24} ${doge_resolve:<24}")
    
    print(f"{'Volume (USDC)':<25} {btc_market.get('volumeFormatted', 'N/A'):<25} {doge_market.get('volumeFormatted', 'N/A'):<25}")
    print(f"{'Liquidity (USDC)':<25} {btc_market.get('liquidityFormatted', 'N/A'):<25} {doge_market.get('liquidityFormatted', 'N/A'):<25}")
    print(f"{'Open Interest (USDC)':<25} {btc_market.get('openInterestFormatted', 'N/A'):<25} {doge_market.get('openInterestFormatted', 'N/A'):<25}")
    
    print(f"{'Created':<25} {btc_market.get('createdAt', 'N/A')[:19]:<25} {doge_market.get('createdAt', 'N/A')[:19]:<25}")
    print(f"{'Expired':<25} {btc_market.get('expired', 'N/A'):<25} {doge_market.get('expired', 'N/A'):<25}")
    
    # Trading activity comparison
    btc_events = btc_market.get('feedEvents', [])
    doge_events = doge_market.get('feedEvents', [])
    
    print(f"{'Total Trades':<25} {len(btc_events):<25} {len(doge_events):<25}")
    
    # Calculate unique traders
    btc_traders = len(set(event.get('user', {}).get('account') for event in btc_events))
    doge_traders = len(set(event.get('user', {}).get('account') for event in doge_events))
    print(f"{'Unique Traders':<25} {btc_traders:<25} {doge_traders:<25}")
    
    # Calculate total volume from trades
    btc_volume = sum(float(event.get('data', {}).get('tradeAmountUSD', 0)) for event in btc_events)
    doge_volume = sum(float(event.get('data', {}).get('tradeAmountUSD', 0)) for event in doge_events)
    print(f"{'Trade Volume (USDC)':<25} ${btc_volume:<24.2f} ${doge_volume:<24.2f}")
    
    # Trading outcomes analysis
    btc_outcomes = {}
    doge_outcomes = {}
    
    for event in btc_events:
        outcome = event.get('data', {}).get('outcome', 'UNKNOWN')
        btc_outcomes[outcome] = btc_outcomes.get(outcome, 0) + 1
    
    for event in doge_events:
        outcome = event.get('data', {}).get('outcome', 'UNKNOWN')
        doge_outcomes[outcome] = doge_outcomes.get(outcome, 0) + 1
    
    print(f"{'YES Trades':<25} {btc_outcomes.get('YES', 0):<25} {doge_outcomes.get('YES', 0):<25}")
    print(f"{'NO Trades':<25} {btc_outcomes.get('NO', 0):<25} {doge_outcomes.get('NO', 0):<25}")
    
    # Trading period analysis
    if btc_events:
        btc_timestamps = [event.get('timestamp') for event in btc_events if event.get('timestamp')]
        if btc_timestamps:
            try:
                btc_start = datetime.fromisoformat(btc_timestamps[-1].replace('Z', '+00:00'))
                btc_end = datetime.fromisoformat(btc_timestamps[0].replace('Z', '+00:00'))
                btc_duration = btc_end - btc_start
                btc_duration_str = str(btc_duration).split('.')[0]
            except:
                btc_duration_str = 'N/A'
        else:
            btc_duration_str = 'N/A'
    else:
        btc_duration_str = 'N/A'
    
    if doge_events:
        doge_timestamps = [event.get('timestamp') for event in doge_events if event.get('timestamp')]
        if doge_timestamps:
            try:
                doge_start = datetime.fromisoformat(doge_timestamps[-1].replace('Z', '+00:00'))
                doge_end = datetime.fromisoformat(doge_timestamps[0].replace('Z', '+00:00'))
                doge_duration = doge_end - doge_start
                doge_duration_str = str(doge_duration).split('.')[0]
            except:
                doge_duration_str = 'N/A'
        else:
            doge_duration_str = 'N/A'
    else:
        doge_duration_str = 'N/A'
    
    print(f"{'Trading Period':<25} {btc_duration_str:<25} {doge_duration_str:<25}")
    
    print("\n" + "=" * 80)
    print("KEY INSIGHTS")
    print("=" * 80)
    
    # Market outcome analysis
    btc_threshold = 116996.01
    btc_actual = btc_market.get('metadata', {}).get('resolvePrice', 0)
    btc_result = "YES" if btc_actual > btc_threshold else "NO"
    
    doge_threshold = 0.22223
    doge_actual = doge_market.get('metadata', {}).get('resolvePrice', 0)
    doge_result = "YES" if doge_actual > doge_threshold else "NO"
    
    print(f"• BTC Market: Price was ${btc_actual:,.2f} vs ${btc_threshold:,.2f} threshold → {btc_result}")
    print(f"• DOGE Market: Price was ${doge_actual:.5f} vs ${doge_threshold:.5f} threshold → {doge_result}")
    
    # Volume comparison
    btc_total_volume = float(btc_market.get('volumeFormatted', 0))
    doge_total_volume = float(doge_market.get('volumeFormatted', 0))
    
    if btc_total_volume > doge_total_volume:
        print(f"• BTC market had {btc_total_volume/doge_total_volume:.1f}x more volume than DOGE market")
    else:
        print(f"• DOGE market had {doge_total_volume/btc_total_volume:.1f}x more volume than BTC market")
    
    # Trading pattern analysis
    btc_yes_ratio = btc_outcomes.get('YES', 0) / len(btc_events) if btc_events else 0
    doge_yes_ratio = doge_outcomes.get('YES', 0) / len(doge_events) if doge_events else 0
    
    print(f"• BTC traders were {btc_yes_ratio*100:.0f}% bullish (YES positions)")
    print(f"• DOGE traders were {doge_yes_ratio*100:.0f}% bullish (YES positions)")
    
    # Accuracy analysis
    btc_accuracy = "correct" if btc_result == "YES" and btc_yes_ratio > 0.5 else "incorrect" if btc_result == "NO" and btc_yes_ratio < 0.5 else "mixed"
    doge_accuracy = "correct" if doge_result == "YES" and doge_yes_ratio > 0.5 else "incorrect" if doge_result == "NO" and doge_yes_ratio < 0.5 else "mixed"
    
    print(f"• BTC market sentiment was {btc_accuracy} (majority was {'bullish' if btc_yes_ratio > 0.5 else 'bearish'})")
    print(f"• DOGE market sentiment was {doge_accuracy} (majority was {'bullish' if doge_yes_ratio > 0.5 else 'bearish'})")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    compare_markets()
