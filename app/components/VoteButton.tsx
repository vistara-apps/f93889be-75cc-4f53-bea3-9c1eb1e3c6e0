'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  promptId: string;
  initialUpVotes: number;
  initialDownVotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (promptId: string, voteType: 'up' | 'down') => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VoteButton({ 
  promptId, 
  initialUpVotes, 
  initialDownVotes, 
  userVote, 
  onVote, 
  disabled = false,
  size = 'md'
}: VoteButtonProps) {
  const [upVotes, setUpVotes] = useState(initialUpVotes);
  const [downVotes, setDownVotes] = useState(initialDownVotes);
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote || null);
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = upVotes + downVotes;
  const upPercentage = totalVotes > 0 ? (upVotes / totalVotes) * 100 : 0;

  const handleVote = async (voteType: 'up' | 'down') => {
    if (disabled || isVoting) return;

    setIsVoting(true);
    try {
      // Optimistic update
      if (currentVote === voteType) {
        // Remove vote
        if (voteType === 'up') {
          setUpVotes(prev => prev - 1);
        } else {
          setDownVotes(prev => prev - 1);
        }
        setCurrentVote(null);
      } else {
        // Add or change vote
        if (currentVote === 'up') {
          setUpVotes(prev => prev - 1);
          setDownVotes(prev => prev + 1);
        } else if (currentVote === 'down') {
          setDownVotes(prev => prev - 1);
          setUpVotes(prev => prev + 1);
        } else {
          if (voteType === 'up') {
            setUpVotes(prev => prev + 1);
          } else {
            setDownVotes(prev => prev + 1);
          }
        }
        setCurrentVote(voteType);
      }

      await onVote(promptId, voteType);
    } catch (error) {
      // Revert optimistic update on error
      setUpVotes(initialUpVotes);
      setDownVotes(initialDownVotes);
      setCurrentVote(userVote || null);
      console.error('Voting failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Vote Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleVote('up')}
          disabled={disabled || isVoting}
          className={cn(
            'flex items-center space-x-1 rounded-sm border-2 transition-all duration-200 font-medium',
            sizeClasses[size],
            currentVote === 'up'
              ? 'border-accent bg-accent text-bg neon-glow'
              : 'border-accent border-opacity-30 text-accent hover:border-opacity-60 hover:bg-accent hover:bg-opacity-20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronUp size={iconSizes[size]} />
          <span>{upVotes}</span>
        </button>

        <button
          onClick={() => handleVote('down')}
          disabled={disabled || isVoting}
          className={cn(
            'flex items-center space-x-1 rounded-sm border-2 transition-all duration-200 font-medium',
            sizeClasses[size],
            currentVote === 'down'
              ? 'border-red-500 bg-red-500 text-white'
              : 'border-red-500 border-opacity-30 text-red-400 hover:border-opacity-60 hover:bg-red-500 hover:bg-opacity-20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronDown size={iconSizes[size]} />
          <span>{downVotes}</span>
        </button>
      </div>

      {/* Vote Progress Bar */}
      {totalVotes > 0 && (
        <div className="w-full max-w-24">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>{Math.round(upPercentage)}%</span>
            <Zap size={10} className="text-accent" />
            <span>{Math.round(100 - upPercentage)}%</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${upPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Total Votes */}
      <div className="text-xs text-muted">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
