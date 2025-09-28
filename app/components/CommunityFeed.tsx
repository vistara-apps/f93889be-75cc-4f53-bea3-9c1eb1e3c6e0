'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users, Filter } from 'lucide-react';
import { VideoPrompt } from '@/lib/types';
import { VideoPreview } from './VideoPreview';
import { VoteButton } from './VoteButton';
import { formatTimeAgo, calculateVotingPercentage } from '@/lib/utils';
import { VIDEO_CATEGORIES } from '@/lib/constants';

interface CommunityFeedProps {
  variant?: 'prompts' | 'results';
}

// Mock data for demonstration
const mockPrompts: VideoPrompt[] = [
  {
    promptId: '1',
    userId: 'user1',
    promptText: 'A cyberpunk cityscape at night with neon lights reflecting on wet streets, flying cars in the distance',
    status: 'voting',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    votesUp: 24,
    votesDown: 3,
    totalVotes: 27,
    category: 'Entertainment',
    tags: ['cyberpunk', 'city', 'neon', 'futuristic'],
  },
  {
    promptId: '2',
    userId: 'user2',
    promptText: 'A peaceful forest scene with magical creatures and glowing mushrooms, ethereal lighting',
    status: 'completed',
    generatedVideoUrl: 'https://via.placeholder.com/640x360/1a0d2e/00ff41?text=Forest+Magic',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    votesUp: 45,
    votesDown: 2,
    totalVotes: 47,
    category: 'Art & Design',
    tags: ['fantasy', 'forest', 'magic', 'nature'],
  },
  {
    promptId: '3',
    userId: 'user3',
    promptText: 'An epic space battle with massive starships, laser beams, and explosions against a starfield backdrop',
    status: 'generating',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    votesUp: 18,
    votesDown: 1,
    totalVotes: 19,
    category: 'Gaming',
    tags: ['space', 'battle', 'sci-fi', 'action'],
  },
  {
    promptId: '4',
    userId: 'user4',
    promptText: 'A cozy coffee shop interior with warm lighting, people working on laptops, steam rising from cups',
    status: 'voting',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    votesUp: 12,
    votesDown: 5,
    totalVotes: 17,
    category: 'Documentary',
    tags: ['cozy', 'coffee', 'lifestyle', 'warm'],
  },
];

export function CommunityFeed({ variant = 'prompts' }: CommunityFeedProps) {
  const [prompts, setPrompts] = useState<VideoPrompt[]>(mockPrompts);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPrompts(prev => prev.map(prompt => {
      if (prompt.promptId === promptId) {
        const newPrompt = { ...prompt };
        if (voteType === 'up') {
          newPrompt.votesUp += 1;
        } else {
          newPrompt.votesDown += 1;
        }
        newPrompt.totalVotes = newPrompt.votesUp + newPrompt.votesDown;
        return newPrompt;
      }
      return prompt;
    }));
  };

  const filteredAndSortedPrompts = prompts
    .filter(prompt => {
      if (variant === 'results' && prompt.status !== 'completed') return false;
      if (filterCategory !== 'all' && prompt.category !== filterCategory) return false;
      if (filterStatus !== 'all' && prompt.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.totalVotes - a.totalVotes;
        case 'trending':
          return calculateVotingPercentage(b.votesUp, b.totalVotes) - calculateVotingPercentage(a.votesUp, a.totalVotes);
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="card-cyber">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-cyber"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-cyber"
            >
              <option value="all">All Categories</option>
              {VIDEO_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {variant === 'prompts' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-cyber"
              >
                <option value="all">All Status</option>
                <option value="voting">Voting</option>
                <option value="generating">Generating</option>
                <option value="completed">Completed</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-accent mr-2" />
            <span className="text-2xl font-bold text-accent">
              {filteredAndSortedPrompts.length}
            </span>
          </div>
          <p className="text-sm text-muted">Active Prompts</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-accent mr-2" />
            <span className="text-2xl font-bold text-accent">
              {filteredAndSortedPrompts.reduce((sum, p) => sum + p.totalVotes, 0)}
            </span>
          </div>
          <p className="text-sm text-muted">Total Votes</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-accent mr-2" />
            <span className="text-2xl font-bold text-accent">
              {filteredAndSortedPrompts.filter(p => p.status === 'generating').length}
            </span>
          </div>
          <p className="text-sm text-muted">Generating</p>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedPrompts.map((prompt) => (
          <div key={prompt.promptId} className="card-cyber">
            {/* Video Preview */}
            <VideoPreview prompt={prompt} className="mb-4" />
            
            {/* Prompt Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-accent bg-opacity-20 text-accent rounded-sm font-medium">
                    {prompt.category}
                  </span>
                  <span className="text-xs text-muted">
                    {formatTimeAgo(prompt.createdAt)}
                  </span>
                </div>
                
                <p className="text-fg leading-relaxed">
                  {prompt.promptText}
                </p>
                
                {prompt.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-surface text-muted rounded-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Status and Voting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${prompt.status === 'voting' ? 'bg-yellow-500' : ''}
                    ${prompt.status === 'generating' ? 'bg-blue-500 animate-pulse' : ''}
                    ${prompt.status === 'completed' ? 'bg-green-500' : ''}
                  `} />
                  <span className="text-sm text-muted capitalize">
                    {prompt.status}
                  </span>
                  {prompt.status === 'voting' && (
                    <span className="text-xs text-muted">
                      ({calculateVotingPercentage(prompt.votesUp, prompt.totalVotes)}% approval)
                    </span>
                  )}
                </div>
                
                <VoteButton
                  promptId={prompt.promptId}
                  initialUpVotes={prompt.votesUp}
                  initialDownVotes={prompt.votesDown}
                  onVote={handleVote}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedPrompts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-medium text-fg mb-2">No prompts found</h3>
          <p className="text-muted">
            Try adjusting your filters or be the first to create a prompt!
          </p>
        </div>
      )}
    </div>
  );
}
