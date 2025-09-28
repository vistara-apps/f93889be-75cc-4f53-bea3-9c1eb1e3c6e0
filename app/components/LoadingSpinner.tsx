'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <Loader2
        className={cn(
          'animate-spin text-accent',
          sizeClasses[size]
        )}
      />

      {text && (
        <p className="text-muted text-center animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-bg bg-opacity-60 backdrop-blur-sm z-10 flex items-center justify-center rounded-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loading components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-cyber animate-pulse', className)}>
      <div className="h-48 bg-surface bg-opacity-50 rounded-sm mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-surface bg-opacity-50 rounded-sm w-3/4" />
        <div className="h-4 bg-surface bg-opacity-50 rounded-sm w-1/2" />
        <div className="h-4 bg-surface bg-opacity-50 rounded-sm w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-surface bg-opacity-50 rounded-sm',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <div className={cn('h-10 bg-surface bg-opacity-50 rounded-sm animate-pulse', className)} />
  );
}

// Loading states for specific components
export function VideoPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('cyber-border bg-surface overflow-hidden animate-pulse', className)}>
      <div className="aspect-video bg-surface bg-opacity-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="p-4 space-y-3">
        <SkeletonText lines={2} />
        <div className="flex justify-between">
          <SkeletonText lines={1} className="w-20" />
          <SkeletonText lines={1} className="w-16" />
        </div>
      </div>
    </div>
  );
}

export function PromptCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card-cyber animate-pulse', className)}>
      <VideoPreviewSkeleton className="mb-4" />
      <div className="space-y-4">
        <SkeletonText lines={3} />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-surface bg-opacity-50 rounded-full" />
            <SkeletonText lines={1} className="w-16" />
          </div>
          <SkeletonButton className="w-24" />
        </div>
      </div>
    </div>
  );
}

// Infinite loading indicator
export function InfiniteLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div className="flex items-center space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-muted">Loading more...</span>
      </div>
    </div>
  );
}

// Progress indicator
export function ProgressLoader({
  progress,
  text,
  className
}: {
  progress: number;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{text || 'Loading...'}</span>
        <span className="text-accent font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-surface bg-opacity-50 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

