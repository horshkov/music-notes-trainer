# Limitless iOS Widgets Backend

A lightweight backend service to provide data for iOS widgets showing Limitless trading information.

## Architecture

```
limitless-ios-widgets/
├── backend/              # Express.js API server
│   ├── server.js        # Main server
│   ├── routes/          # API endpoints
│   └── services/        # Data fetching from Limitless API
├── ios-widget/          # iOS Widget Extension
│   ├── LimitlessWidget/ # Widget implementation
│   └── Models/          # Data models
└── shared/              # Shared data structures
```

## Features

### Backend API
- Fetch market data from Limitless API
- Cache data for widget performance
- Provide simplified endpoints for widgets
- Handle authentication and rate limiting

### iOS Widgets
- **Small Widget**: Single market price/probability
- **Medium Widget**: 2-3 top markets
- **Large Widget**: Portfolio summary + top markets

## Quick Start

1. **Backend Setup**:
```bash
cd backend
npm install
npm start
```

2. **iOS Widget Setup**:
- Open Xcode
- Add Widget Extension to your iOS app
- Use the provided widget code

## API Endpoints

- `GET /api/markets` - Top markets for widgets
- `GET /api/portfolio/:address` - User portfolio summary
- `GET /api/market/:id` - Specific market data