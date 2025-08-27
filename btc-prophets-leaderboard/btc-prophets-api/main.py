"""FastAPI server for BTC Prophets leaderboard."""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import text
import uvicorn

from database import db_config
from leaderboard import get_leaderboard_data

app = FastAPI(
    title="BTC Prophets Leaderboard API",
    description="API for fetching BTC trading leaderboard data",
    version="1.0.0"
)

# CORS middleware to allow React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LeaderboardEntry(BaseModel):
    wallet_address: str
    display_name: Optional[str]
    total_buy_volume_usd: float
    total_profit_usd: float
    roi: float

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "BTC Prophets Leaderboard API is running", "status": "healthy"}

@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    date: str = Query(..., description="Date in YYYY-MM-DD format", regex=r"^\d{4}-\d{2}-\d{2}$")
):
    """
    Get leaderboard data for a specific date.
    
    Parameters
    ----------
    date : str
        Date in YYYY-MM-DD format
        
    Returns
    -------
    List[LeaderboardEntry]
        List of leaderboard entries sorted by ROI descending
    """
    try:
        # Validate date format
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    try:
        prod_engine = db_config.get_prod_engine()
        data = get_leaderboard_data(date, prod_engine)
        
        if not data:
            raise HTTPException(status_code=404, detail=f"No leaderboard data found for date {date}")
        
        return data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard data: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Extended health check with database connectivity."""
    try:
        # Test database connections
        prod_engine = db_config.get_prod_engine()
        with prod_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connections on shutdown."""
    db_config.close_connections()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )