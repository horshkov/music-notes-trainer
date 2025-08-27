# Reddit Data Puller

A Node.js application to pull data from specific subreddits using Reddit's public API.

## Features

- Fetch posts from multiple subreddits
- Support for different sorting options (hot, new, rising, top)
- Export data to JSON and CSV formats
- Rate limiting to respect Reddit's API guidelines
- No authentication required for basic public data

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure subreddits in `index.js`:
```javascript
const subreddits = [
  'javascript',
  'programming',
  'webdev',
  'reactjs',
  'nodejs'
];
```

## Usage

Run the application:
```bash
npm start
```

The application will:
- Fetch posts from configured subreddits
- Save data to timestamped JSON and CSV files
- Display progress in the console

## Configuration

Edit the configuration in `index.js`:
- `subreddits`: Array of subreddit names
- `limit`: Number of posts per subreddit (max 100)
- `sort`: Sorting method ('hot', 'new', 'rising', 'top')

## Output

The application generates two files:
- `reddit_data_[timestamp].json`: Complete post data
- `reddit_data_[timestamp].csv`: Tabular format for analysis

## Rate Limiting

The application includes a 1-second delay between API requests to respect Reddit's rate limits.