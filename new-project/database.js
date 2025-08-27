const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/reddit_enricher.db' 
      : path.join(__dirname, 'reddit_enricher.db');
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database at:', this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createTablesSQL = `
        -- Enriched posts table
        CREATE TABLE IF NOT EXISTS enriched_posts (
          id TEXT PRIMARY KEY,
          post_data TEXT NOT NULL,
          enrichment_data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- General analyses table
        CREATE TABLE IF NOT EXISTS general_analyses (
          id TEXT PRIMARY KEY,
          posts_analyzed INTEGER NOT NULL,
          prompt_type TEXT NOT NULL,
          analysis TEXT NOT NULL,
          posts_context TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Reddit posts cache table
        CREATE TABLE IF NOT EXISTS reddit_posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT,
          subreddit TEXT,
          score INTEGER,
          num_comments INTEGER,
          url TEXT,
          selftext TEXT,
          created_date DATETIME,
          query_source TEXT,
          cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_enriched_posts_created_at ON enriched_posts(created_at);
        CREATE INDEX IF NOT EXISTS idx_general_analyses_created_at ON general_analyses(created_at);
        CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit ON reddit_posts(subreddit);
        CREATE INDEX IF NOT EXISTS idx_reddit_posts_query_source ON reddit_posts(query_source);
      `;

      this.db.exec(createTablesSQL, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables initialized successfully');
          resolve();
        }
      });
    });
  }

  async saveEnrichedPost(postId, postData, enrichmentData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO enriched_posts (id, post_data, enrichment_data, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(sql, [
        postId,
        JSON.stringify(postData),
        JSON.stringify(enrichmentData)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ postId, changes: this.changes });
        }
      });
    });
  }

  async getEnrichedPost(postId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM enriched_posts WHERE id = ?';
      
      this.db.get(sql, [postId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            post_id: row.id,
            original_post: JSON.parse(row.post_data),
            enrichment: JSON.parse(row.enrichment_data),
            created_at: row.created_at,
            updated_at: row.updated_at
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async getAllEnrichedPosts() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM enriched_posts ORDER BY updated_at DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const enrichedData = {};
          rows.forEach(row => {
            enrichedData[row.id] = {
              post_id: row.id,
              original_post: JSON.parse(row.post_data),
              enrichment: JSON.parse(row.enrichment_data),
              created_at: row.created_at,
              updated_at: row.updated_at
            };
          });
          resolve(enrichedData);
        }
      });
    });
  }

  async saveGeneralAnalysis(analysisId, postsAnalyzed, promptType, analysis, postsContext) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO general_analyses (id, posts_analyzed, prompt_type, analysis, posts_context)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        analysisId,
        postsAnalyzed,
        promptType,
        analysis,
        JSON.stringify(postsContext)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ analysisId, changes: this.changes });
        }
      });
    });
  }

  async getGeneralAnalyses(limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM general_analyses ORDER BY created_at DESC LIMIT ?';
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const analyses = {};
          rows.forEach(row => {
            analyses[row.id] = {
              id: row.id,
              posts_analyzed: row.posts_analyzed,
              prompt_type: row.prompt_type,
              analysis: row.analysis,
              posts_context: JSON.parse(row.posts_context),
              timestamp: row.created_at
            };
          });
          resolve(analyses);
        }
      });
    });
  }

  async deleteEnrichedPost(postId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM enriched_posts WHERE id = ?';
      
      this.db.run(sql, [postId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ postId, changes: this.changes });
        }
      });
    });
  }

  async cacheRedditPosts(posts, querySource) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO reddit_posts 
        (id, title, author, subreddit, score, num_comments, url, selftext, created_date, query_source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = this.db.prepare(sql);
      let completed = 0;
      let errors = [];

      posts.forEach(post => {
        stmt.run([
          post.id,
          post.title,
          post.author,
          post.subreddit,
          post.score,
          post.num_comments,
          post.url,
          post.selftext,
          post.created,
          querySource
        ], function(err) {
          if (err) {
            errors.push(err);
          }
          completed++;
          
          if (completed === posts.length) {
            stmt.finalize();
            if (errors.length > 0) {
              reject(errors);
            } else {
              resolve({ cached: posts.length });
            }
          }
        });
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;