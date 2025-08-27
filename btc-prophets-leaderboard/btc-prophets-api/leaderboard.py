"""Leaderboard data calculation module."""

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import Engine
from typing import List, Dict, Any

def get_roi_df(leaderboard_date: str, prod_engine: Engine) -> pd.DataFrame:
    """
    Calculate ROI data for Bitcoin-related markets on the given date.
    
    Parameters
    ----------
    leaderboard_date : str
        Date in 'YYYY-MM-DD' format
    prod_engine : Engine
        SQLAlchemy engine for production database
        
    Returns
    -------
    pd.DataFrame
        DataFrame with wallet_address, display_name, total_buy_volume_usd,
        total_profit_usd, and roi columns
    """
    roi_query = text(f"""
    WITH 
    btc_markets as (
    select id as market_id, title
    from public.markets 
    where status = 'RESOLVED'
        and created_at::date = '{leaderboard_date}'::date
        and ((deadline)::date - (created_at)::date) <= 1
        and (lower(title) LIKE '%btc%' or lower(description) LIKE '%bitcoin%')
    ),
    resolutions AS (
    SELECT
        id as market_id,
        title,
        status,
        CASE WHEN winning_index = 1 THEN 'NO' ELSE 'YES' END as resolution
    FROM public.markets
    ),
    user_trades_amm AS (
        SELECT 
            TO_TIMESTAMP(t.block_timestamp) as tx_date,
            t.account as wallet_address,
            m.id as market_id,
            t.strategy as side,
            t.outcome,
            t.token_usd_rate,
            CASE WHEN strategy = 'BUY' THEN trade_amount_usd ELSE 0 END as buy_amount_usd,
            CASE 
                WHEN strategy = 'BUY' THEN -trade_amount_usd
                WHEN strategy = 'SELL' THEN trade_amount_usd
            END as cash_flow_usd,
            CASE 
                WHEN strategy = 'BUY' THEN contracts
                WHEN strategy = 'SELL' THEN -contracts
            END as positions
        FROM analytic.market_trades t 
        left join public.markets m 
        on t.market_address = m.address
        where m.id in (select market_id from btc_markets)
    ),
    clob_raw_taker as (
    SELECT
        t.created_at,
        t.id_taker_owner as profile_id,
        t.id_market::int as market_id,
        o.side,
        case when o.token = c.main_token then 'YES'
            when o.token = c.complementary_token then 'NO'
            else null end as outcome,
        t.matched_size / POWER(10, 6) as matched_size_contracts,
        case when o.type = 'GTC' then t.matched_size / POWER(10, 6) * o.price
            else t.filled_amount / POWER(10, 6) end as matched_size_usd
    FROM ome.trade_events t
    left join public.trade_events pt
        on t.id_taker_order = pt.taker_order_id
    left join ome.orders o
        on o.id = t.id_taker_order
    left join ome.market_configs c
        on o.id_market = c.id_market
    where pt.status = 'MINED'
        and t.id_market::int in (select market_id from btc_markets)
    ),
    clob_raw_maker as (
    SELECT
        te.created_at,
        t.id_maker_owner as profile_id,
        o.id_market::int as market_id,
        o.side,
        case when o.token = c.main_token then 'YES'
            when o.token = c.complementary_token then 'NO'
            else null end as outcome,
        t.matched_size / POWER(10, 6) as matched_size_contracts,
        case when o.type = 'GTC' then t.matched_size / POWER(10, 6) * o.price
            else t.filled_amount / POWER(10, 6) end as matched_size_usd
    FROM ome.trade_events_maker t
    left join public.maker_matches mm
        on t.id_maker_order = mm.order_id
    left join public.trade_events te
        on te.id = mm.trade_event_id
    left join ome.orders o
        on o.id = t.id_maker_order
    left join ome.market_configs c
        on o.id_market = c.id_market
    where te.status = 'MINED'
        and o.id_market::int in (select market_id from btc_markets)
    ),
    user_trades_clob AS (
    SELECT
        clob_all.created_at as tx_date,
        p.account as wallet_address,
        market_id::int,
        side,
        outcome,
        1 as token_usd_rate,
        CASE WHEN side = 'BUY' THEN matched_size_usd ELSE 0 END as buy_amount_usd, 
        CASE 
            WHEN side = 'BUY' THEN -matched_size_usd
            WHEN side = 'SELL' THEN matched_size_usd
        END as cash_flow_usd,
        CASE 
            WHEN side = 'BUY' THEN matched_size_contracts
            WHEN side = 'SELL' THEN -matched_size_contracts
        END as positions
    FROM (
        select *, 'taker' as clob_side from clob_raw_taker
        UNION ALL
        select *, 'maker' as clob_side from clob_raw_maker
        ) clob_all
    left join public.profiles p 
        on p.id = clob_all.profile_id
    ),
    user_trades as (
    select * from user_trades_amm
    UNION ALL 
    select * from user_trades_clob
    ),
    outcomes as (
    SELECT
        wallet_address,
        market_id,
        outcome,
        SUM(cash_flow_usd) as trade_profit_usd,
        SUM(positions) as net_position,
        CASE 
            WHEN SUM(positions) = 0 THEN 0
            ELSE SUM(positions * token_usd_rate) / NULLIF(SUM(positions), 0)
        END as weighted_positions_usd_rate,

        SUM(buy_amount_usd) as total_buy_usd
    FROM user_trades
    GROUP BY 1,2,3
    ),
    profits as (
    select 
        o.*, 
        r.resolution,
        CASE 
        WHEN resolution = outcome THEN net_position * weighted_positions_usd_rate
        WHEN resolution != outcome THEN 0
        END as resolution_profit_usd
    from outcomes o 
    left join resolutions r 
        on o.market_id = r.market_id
    ),
    final as (
    SELECT 
    p.wallet_address,
    display_name,
    SUM(trade_profit_usd) as trade_profit_usd,
    SUM(resolution_profit_usd) as resolution_profit_usd,
    SUM(trade_profit_usd + resolution_profit_usd) as total_profit_usd,

    SUM(total_buy_usd) as total_buy_volume_usd
    FROM profits p 
    left join public.profiles u
    on p.wallet_address = u.account
    group by 1, 2
    )

    select 
    wallet_address,
    display_name,
    total_buy_volume_usd,
    total_profit_usd,
    total_profit_usd / total_buy_volume_usd as roi
    from final
    order by 5 desc
    """)

    roi_df = pd.read_sql(roi_query, prod_engine)
    return roi_df

def get_leaderboard_data(date: str, prod_engine: Engine) -> List[Dict[str, Any]]:
    """
    Get formatted leaderboard data for the API.
    
    Parameters
    ----------
    date : str
        Date in 'YYYY-MM-DD' format
    prod_engine : Engine
        SQLAlchemy engine for production database
        
    Returns
    -------
    List[Dict[str, Any]]
        List of leaderboard entries formatted for API response
    """
    try:
        df = get_roi_df(date, prod_engine)
        
        # Convert DataFrame to list of dictionaries
        return df.to_dict('records')
    
    except Exception as e:
        print(f"Error fetching leaderboard data: {e}")
        return []