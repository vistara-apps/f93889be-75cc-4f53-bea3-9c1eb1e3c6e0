'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, Share2 } from 'lucide-react';
import { VideoPrompt } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  prompt: VideoPrompt;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export function VideoPreview({ 
  prompt, 
  autoPlay = false, 
  controls = true, 
  className 
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VoteVision: ${prompt.promptText.slice(0, 50)}...`,
          text: 'Check out this AI-generated video from VoteVision!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div 
      className={cn(
        'relative group cyber-border bg-surface overflow-hidden',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video/Placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-surface to-bg">
        {prompt.generatedVideoUrl ? (
          <video
            className="w-full h-full object-cover"
            poster={prompt.generatedVideoUrl}
            muted={isMuted}
            loop
            playsInline
          >
            <source src={prompt.generatedVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent bg-opacity-20 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-accent" />
              </div>
              <p className="text-muted text-sm">
                {prompt.status === 'generating' ? 'Generating video...' : 'Video will appear here'}
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {prompt.status === 'generating' && (
          <div className="absolute inset-0 bg-bg bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-accent font-medium">Generating your video...</p>
              <p className="text-muted text-sm mt-1">This may take a few minutes</p>
            </div>
          </div>
        )}

        {/* Play button overlay */}
        {!isPlaying && prompt.generatedVideoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-accent bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 neon-glow"
            >
              <Play className="w-8 h-8 text-bg ml-1" />
            </button>
          </div>
        )}

        {/* Controls */}
        {controls && prompt.generatedVideoUrl && (
          <div className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-200',
            showControls ? 'opacity-100' : 'opacity-0'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-accent transition-colors duration-200"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="text-white hover:text-accent transition-colors duration-200"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="text-white hover:text-accent transition-colors duration-200"
                >
                  <Share2 size={18} />
                </button>
                <button className="text-white hover:text-accent transition-colors duration-200">
                  <Download size={18} />
                </button>
                <button className="text-white hover:text-accent transition-colors duration-200">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-medium text-fg mb-2 line-clamp-2">
          {prompt.promptText}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="capitalize">{prompt.status}</span>
          <span>{prompt.totalVotes} votes</span>
        </div>
      </div>
    </div>
  );
}
