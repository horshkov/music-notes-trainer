# Limitless iOS Widgets Setup Guide

## Quick Start

This project provides a lightweight backend + iOS widgets solution for displaying Limitless trading data.

### 1. Backend Setup (5 minutes)

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The backend will run on `http://localhost:3001` and provide widget-optimized API endpoints.

### 2. iOS Widget Setup (10 minutes)

1. **Create iOS Project in Xcode**:
   - New Project → iOS → App
   - Name: "LimitlessWidgets" 
   - Bundle ID: "com.limitless.widgets"

2. **Add Widget Extension**:
   - File → New → Target
   - Choose "Widget Extension"
   - Name: "LimitlessWidget"
   - Include Configuration Intent: No

3. **Copy Widget Files**:
   - Copy all files from `ios-widget/` to your Xcode project
   - Add to both app target and widget extension target

4. **Configure App Groups**:
   - In project settings, add App Groups capability
   - Group ID: `group.com.limitless.widgets`
   - Add to both main app and widget extension

## Architecture Overview

```
Backend (Node.js + Express)
├── Fetches data from Limitless API
├── Caches for widget performance  
├── Provides simplified endpoints
└── Handles rate limiting

iOS Widgets (SwiftUI + WidgetKit)
├── Small: Single market price
├── Medium: 3 markets + portfolio summary
├── Large: 5 markets + detailed portfolio
└── Updates every 15 minutes
```

## API Endpoints

**Backend provides these widget-optimized endpoints:**

- `GET /api/markets/widget/summary` - Top markets for widgets
- `GET /api/portfolio/:address/widget` - Portfolio summary for widgets  
- `GET /health` - Backend health check

**Data is automatically cached and optimized for:**
- Fast widget loading
- Minimal data transfer
- iOS display constraints

## Widget Features

### Small Widget (2x2)
- Single top market
- Current price & probability
- 24h change indicator
- Active/inactive status

### Medium Widget (4x2)  
- 3 top markets with prices
- Portfolio summary (if configured)
- Win rate & total value
- Real-time updates

### Large Widget (4x4)
- 5 top markets
- Detailed portfolio metrics
- Top positions with P&L
- Complete trading overview

## Configuration

### Set Wallet Address for Portfolio
```swift
// In your main iOS app
WidgetApiService.setWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
```

### Production Configuration
```swift
// Point to your production API
WidgetApiService.configureForProduction()
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Widget Development
- Use Xcode widget simulator
- Test all three widget sizes
- Check with/without portfolio data

## Testing

### Test Backend
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/markets/widget/summary
```

### Test Widgets
- Add widgets to iOS simulator home screen
- Test with airplane mode (cached data)
- Verify update intervals

## Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js host
- Set `LIMITLESS_API_URL` environment variable
- Configure CORS for iOS widget requests

### iOS App Store
- Standard iOS app submission process
- Include widget extension in bundle
- Test on physical devices

## Troubleshooting

**Widget not updating?**
- Check backend is running
- Verify App Groups configuration
- Check Xcode console for API errors

**API errors?**
- Ensure backend is accessible from iOS simulator
- Check CORS settings
- Verify endpoint URLs

**No data showing?**
- Widgets will show sample data as fallback
- Check network connectivity
- Verify cache is working

## Next Steps

1. **Customize for your needs**:
   - Modify widget layouts
   - Add your branding
   - Configure update intervals

2. **Add features**:
   - Push notifications for price alerts
   - Multiple wallet support
   - Custom market watchlists

3. **Deploy to production**:
   - Host backend API
   - Submit iOS app to App Store
   - Configure production API endpoints