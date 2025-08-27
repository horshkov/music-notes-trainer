const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class RedditDataPuller {
  constructor() {
    this.searchBaseUrl = 'https://www.reddit.com/search.json';
    this.userAgent = 'reddit-data-puller/1.0.0';
  }

  async fetchSearchData(query, limit = 25, sort = 'hot') {
    try {
      const url = `${this.searchBaseUrl}?q=${encodeURIComponent(query)}&limit=${limit}&sort=${sort}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      return response.data.data.children.map(post => ({
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        created: new Date(post.data.created_utc * 1000),
        score: post.data.score,
        num_comments: post.data.num_comments,
        url: post.data.url,
        selftext: post.data.selftext,
        subreddit: post.data.subreddit,
        permalink: `https://reddit.com${post.data.permalink}`
      }));
    } catch (error) {
      console.error(`Error fetching search data for "${query}":`, error.message);
      return [];
    }
  }

  async fetchMultipleQueries(queries, limit = 25, sort = 'hot') {
    const results = {};
    
    for (const query of queries) {
      console.log(`Searching for "${query}"...`);
      const data = await this.fetchSearchData(query, limit, sort);
      results[query] = data;
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  saveToFile(data, filename = 'reddit_data.json') {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
  }

  saveToCSV(data, filename = 'reddit_data.csv') {
    const filePath = path.join(__dirname, filename);
    const csvHeader = 'query,subreddit,id,title,author,created,score,num_comments,url,permalink\n';
    
    let csvContent = csvHeader;
    
    Object.entries(data).forEach(([query, posts]) => {
      posts.forEach(post => {
        const row = [
          `"${query.replace(/"/g, '""')}"`,
          post.subreddit,
          post.id,
          `"${post.title.replace(/"/g, '""')}"`,
          post.author,
          post.created.toISOString(),
          post.score,
          post.num_comments,
          post.url,
          post.permalink
        ].join(',');
        csvContent += row + '\n';
      });
    });
    
    fs.writeFileSync(filePath, csvContent);
    console.log(`CSV data saved to ${filePath}`);
  }

  loadPreviousResults(query) {
    const filePath = path.join(__dirname, `previous_${query.replace(/\s+/g, '_')}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error loading previous results for "${query}":`, error.message);
    }
    return [];
  }

  savePreviousResults(query, posts) {
    const filePath = path.join(__dirname, `previous_${query.replace(/\s+/g, '_')}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
      console.log(`Previous results saved for "${query}"`);
    } catch (error) {
      console.error(`Error saving previous results for "${query}":`, error.message);
    }
  }

  findFreshPosts(query, currentPosts, previousPosts) {
    const previousIds = new Set(previousPosts.map(post => post.id));
    const freshPosts = currentPosts.filter(post => !previousIds.has(post.id));
    
    if (freshPosts.length > 0) {
      console.log(`Found ${freshPosts.length} fresh posts for "${query}"`);
      freshPosts.forEach(post => {
        console.log(`- Fresh: ${post.title} (${post.subreddit})`);
      });
    } else {
      console.log(`No fresh posts found for "${query}"`);
    }
    
    return freshPosts;
  }

  async checkForFreshPosts(query, limit = 25, sort = 'new') {
    console.log(`Checking for fresh posts in "${query}"...`);
    
    const currentPosts = await this.fetchSearchData(query, limit, sort);
    const previousPosts = this.loadPreviousResults(query);
    
    const freshPosts = this.findFreshPosts(query, currentPosts, previousPosts);
    
    this.savePreviousResults(query, currentPosts);
    
    if (freshPosts.length > 0) {
      this.saveToFile({[query]: freshPosts}, `fresh_posts_${query.replace(/\s+/g, '_')}_${Date.now()}.json`);
      this.saveToCSV({[query]: freshPosts}, `fresh_posts_${query.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    }
    
    return freshPosts;
  }
}

// Configuration
const searchQueries = [
  'bitcoin trading'
];

const config = {
  limit: 25,
  sort: 'hot' // hot, new, rising, top
};

// Main execution
async function main() {
  const puller = new RedditDataPuller();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--check-fresh')) {
    console.log('Checking for fresh posts...');
    for (const query of searchQueries) {
      await puller.checkForFreshPosts(query, config.limit, 'new');
    }
    console.log('Fresh post check completed!');
  } else {
    console.log('Starting Reddit search data pull...');
    console.log(`Search queries: ${searchQueries.join(', ')}`);
    console.log(`Limit: ${config.limit} posts per query`);
    console.log(`Sort: ${config.sort}`);
    
    const data = await puller.fetchMultipleQueries(searchQueries, config.limit, config.sort);
    
    // Save data in multiple formats
    puller.saveToFile(data, `reddit_search_data_${Date.now()}.json`);
    puller.saveToCSV(data, `reddit_search_data_${Date.now()}.csv`);
    
    console.log('Data pull completed!');
  }
}

// API function for fresh post checking
async function checkFreshPosts() {
  const puller = new RedditDataPuller();
  const freshPosts = await puller.checkForFreshPosts('bitcoin trading', 25, 'new');
  return freshPosts;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RedditDataPuller, checkFreshPosts };