'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { VideoPrompt } from '@/lib/types';
import { VideoPreview } from './VideoPreview';
import { VoteButton } from './VoteButton';
import { LoadingSpinner, PromptCardSkeleton } from './LoadingSpinner';
import { formatTimeAgo, calculateVotingPercentage } from '@/lib/utils';
import { VIDEO_CATEGORIES } from '@/lib/constants';
import { useWalletAuth } from '@/lib/auth';

interface CommunityFeedProps {
  variant?: 'prompts' | 'results';
}

export function CommunityFeed({ variant = 'prompts' }: CommunityFeedProps) {
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { address, isAuthenticated } = useWalletAuth();

  // Fetch prompts from API
  const fetchPrompts = async (reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const params = new URLSearchParams({
        limit: '12',
        offset: reset ? '0' : ((page - 1) * 12).toString(),
      });

      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/prompts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch prompts');
      }

      const newPrompts = data.prompts.map((prompt: any) => ({
        ...prompt,
        createdAt: new Date(prompt.createdAt),
      }));

      if (reset) {
        setPrompts(newPrompts);
      } else {
        setPrompts(prev => [...prev, ...newPrompts]);
      }

      setHasMore(newPrompts.length === 12);
      if (!reset) setPage(prev => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrompts(true);
  }, [filterCategory, filterStatus]);

  // Handle voting
  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated || !address) {
      alert('Please connect your wallet to vote');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: address,
          promptId,
          voteType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert('You have already voted on this prompt');
          return;
        }
        throw new Error(data.error || 'Failed to cast vote');
      }

      // Update local state
      setPrompts(prev => prev.map(prompt => {
        if (prompt.promptId === promptId) {
          const newPrompt = { ...prompt };
          if (voteType === 'up') {
            newPrompt.votesUp = (newPrompt.votesUp || 0) + 1;
          } else {
            newPrompt.votesDown = (newPrompt.votesDown || 0) + 1;
          }
          newPrompt.totalVotes = (newPrompt.votesUp || 0) + (newPrompt.votesDown || 0);
          return newPrompt;
        }
        return prompt;
      }));
    } catch (err: any) {
      alert(`Voting failed: ${err.message}`);
    }
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
          return (b.totalVotes || 0) - (a.totalVotes || 0);
        case 'trending':
          return calculateVotingPercentage(b.votesUp || 0, b.totalVotes || 0) - calculateVotingPercentage(a.votesUp || 0, a.totalVotes || 0);
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  if (loading && prompts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-fg mb-2">Failed to load prompts</h3>
        <p className="text-muted mb-6">{error}</p>
        <button
          onClick={() => fetchPrompts(true)}
          className="btn-primary flex items-center space-x-2 mx-auto"
        >
          <RefreshCw size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

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
              {filteredAndSortedPrompts.reduce((sum, p) => sum + (p.totalVotes || 0), 0)}
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
                      ({calculateVotingPercentage(prompt.votesUp || 0, prompt.totalVotes || 0)}% approval)
                    </span>
                  )}
                </div>

                <VoteButton
                  promptId={prompt.promptId}
                  initialUpVotes={prompt.votesUp || 0}
                  initialDownVotes={prompt.votesDown || 0}
                  onVote={handleVote}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center py-6">
          <button
            onClick={() => fetchPrompts()}
            className="btn-secondary"
            disabled={loading}
          >
            Load More Prompts
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && prompts.length > 0 && (
        <div className="text-center py-6">
          <LoadingSpinner size="md" text="Loading more prompts..." />
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedPrompts.length === 0 && !loading && (
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

