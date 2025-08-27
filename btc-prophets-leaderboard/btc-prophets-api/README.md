# BTC Prophets Leaderboard API

FastAPI server that provides leaderboard data for the BTC Prophets React frontend.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env` file (already created)

3. Start the server:
```bash
python main.py
```

## API Endpoints

- `GET /` - Health check
- `GET /api/leaderboard?date=YYYY-MM-DD` - Get leaderboard data for specific date
- `GET /api/health` - Extended health check with database connectivity

## Usage

The API will be available at `http://localhost:8000` and will serve data to the React frontend running at `http://localhost:3000`.

Example request:
```bash
curl "http://localhost:8000/api/leaderboard?date=2025-08-16"
```