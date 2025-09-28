export interface User {
  userId: string;
  walletAddress: string;
  username: string;
  voteBalance: number;
}

export interface VideoPrompt {
  promptId: string;
  userId: string;
  promptText: string;
  status: 'pending' | 'voting' | 'generating' | 'completed';
  generatedVideoUrl?: string;
  createdAt: Date;
  votesUp: number;
  votesDown: number;
  totalVotes: number;
  category?: string;
  tags?: string[];
}

export interface Vote {
  voteId: string;
  userId: string;
  promptId: string;
  voteType: 'up' | 'down';
  timestamp: Date;
  weight: number;
}

export interface MediaAsset {
  assetId: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  tags: string[];
  category: string;
}

export interface VotingStats {
  totalVotes: number;
  upVotes: number;
  downVotes: number;
  percentage: number;
}
