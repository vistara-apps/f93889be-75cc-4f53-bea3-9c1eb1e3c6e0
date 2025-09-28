import { Pool } from 'pg';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Database schema types
export interface User {
  userId: string;
  walletAddress: string;
  username?: string;
  voteBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoPrompt {
  promptId: string;
  userId: string;
  promptText: string;
  status: 'pending' | 'voting' | 'generating' | 'completed';
  generatedVideoUrl?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  voteId: string;
  userId: string;
  promptId: string;
  voteType: 'up' | 'down';
  weight: number;
  transactionHash?: string;
  createdAt: Date;
}

export interface MediaAsset {
  assetId: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  tags: string[];
  category: string;
  uploadedBy: string;
  createdAt: Date;
}

// Database operations
export class Database {
  // User operations
  static async createUser(walletAddress: string, username?: string): Promise<User> {
    const query = `
      INSERT INTO users (wallet_address, username, vote_balance)
      VALUES ($1, $2, 10)
      ON CONFLICT (wallet_address) DO UPDATE SET
        username = COALESCE(EXCLUDED.username, users.username),
        updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [walletAddress, username]);
    return this.mapUserRow(result.rows[0]);
  }

  static async getUser(walletAddress: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows.length > 0 ? this.mapUserRow(result.rows[0]) : null;
  }

  // Video prompt operations
  static async createPrompt(
    userId: string,
    promptText: string,
    category: string,
    tags: string[] = []
  ): Promise<VideoPrompt> {
    const query = `
      INSERT INTO video_prompts (user_id, prompt_text, category, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, promptText, category, tags]);
    return this.mapPromptRow(result.rows[0]);
  }

  static async getPrompts(
    status?: string,
    category?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<VideoPrompt[]> {
    let query = `
      SELECT vp.*, u.wallet_address, u.username,
             COUNT(v.vote_id) as total_votes,
             COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as up_votes,
             COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as down_votes
      FROM video_prompts vp
      LEFT JOIN users u ON vp.user_id = u.user_id
      LEFT JOIN votes v ON vp.prompt_id = v.prompt_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND vp.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category && category !== 'all') {
      query += ` AND vp.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += `
      GROUP BY vp.prompt_id, u.wallet_address, u.username
      ORDER BY vp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...this.mapPromptRow(row),
      totalVotes: parseInt(row.total_votes),
      votesUp: parseInt(row.up_votes),
      votesDown: parseInt(row.down_votes),
    }));
  }

  static async updatePromptStatus(
    promptId: string,
    status: string,
    generatedVideoUrl?: string
  ): Promise<VideoPrompt> {
    const query = `
      UPDATE video_prompts
      SET status = $1, generated_video_url = $2, updated_at = NOW()
      WHERE prompt_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, generatedVideoUrl, promptId]);
    return this.mapPromptRow(result.rows[0]);
  }

  // Vote operations
  static async createVote(
    userId: string,
    promptId: string,
    voteType: 'up' | 'down',
    weight: number = 1,
    transactionHash?: string
  ): Promise<Vote> {
    const query = `
      INSERT INTO votes (user_id, prompt_id, vote_type, weight, transaction_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, promptId, voteType, weight, transactionHash]);
    return this.mapVoteRow(result.rows[0]);
  }

  static async getVotesForPrompt(promptId: string): Promise<Vote[]> {
    const query = 'SELECT * FROM votes WHERE prompt_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [promptId]);
    return result.rows.map(row => this.mapVoteRow(row));
  }

  // Media asset operations
  static async createMediaAsset(
    url: string,
    type: string,
    tags: string[],
    category: string,
    uploadedBy: string
  ): Promise<MediaAsset> {
    const query = `
      INSERT INTO media_assets (url, type, tags, category, uploaded_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [url, type, tags, category, uploadedBy]);
    return this.mapAssetRow(result.rows[0]);
  }

  static async getMediaAssets(
    type?: string,
    category?: string,
    limit: number = 50
  ): Promise<MediaAsset[]> {
    let query = 'SELECT * FROM media_assets WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows.map(row => this.mapAssetRow(row));
  }

  // Helper methods to map database rows to TypeScript interfaces
  private static mapUserRow(row: any): User {
    return {
      userId: row.user_id,
      walletAddress: row.wallet_address,
      username: row.username,
      voteBalance: row.vote_balance,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static mapPromptRow(row: any): VideoPrompt {
    return {
      promptId: row.prompt_id,
      userId: row.user_id,
      promptText: row.prompt_text,
      status: row.status,
      generatedVideoUrl: row.generated_video_url,
      category: row.category,
      tags: row.tags || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static mapVoteRow(row: any): Vote {
    return {
      voteId: row.vote_id,
      userId: row.user_id,
      promptId: row.prompt_id,
      voteType: row.vote_type,
      weight: row.weight,
      transactionHash: row.transaction_hash,
      createdAt: new Date(row.created_at),
    };
  }

  private static mapAssetRow(row: any): MediaAsset {
    return {
      assetId: row.asset_id,
      url: row.url,
      type: row.type,
      tags: row.tags || [],
      category: row.category,
      uploadedBy: row.uploaded_by,
      createdAt: new Date(row.created_at),
    };
  }
}

// Initialize database tables
export async function initDatabase() {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_address VARCHAR(42) UNIQUE NOT NULL,
      username VARCHAR(50),
      vote_balance INTEGER DEFAULT 10,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Video prompts table
    `CREATE TABLE IF NOT EXISTS video_prompts (
      prompt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      prompt_text TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'voting',
      generated_video_url TEXT,
      category VARCHAR(50) NOT NULL,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Votes table
    `CREATE TABLE IF NOT EXISTS votes (
      vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      prompt_id UUID REFERENCES video_prompts(prompt_id) ON DELETE CASCADE,
      vote_type VARCHAR(4) NOT NULL CHECK (vote_type IN ('up', 'down')),
      weight INTEGER DEFAULT 1,
      transaction_hash VARCHAR(66),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, prompt_id)
    )`,

    // Media assets table
    `CREATE TABLE IF NOT EXISTS media_assets (
      asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url TEXT NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'audio')),
      tags TEXT[] DEFAULT '{}',
      category VARCHAR(50) NOT NULL,
      uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Indexes for performance
    `CREATE INDEX IF NOT EXISTS idx_video_prompts_status ON video_prompts(status)`,
    `CREATE INDEX IF NOT EXISTS idx_video_prompts_category ON video_prompts(category)`,
    `CREATE INDEX IF NOT EXISTS idx_votes_prompt_id ON votes(prompt_id)`,
    `CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type)`,
  ];

  for (const query of queries) {
    await pool.query(query);
  }
}

