'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { PromptInput } from './components/PromptInput';
import { CommunityFeed } from './components/CommunityFeed';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar, Identity } from '@coinbase/onchainkit/identity';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAuthenticate } from '@coinbase/onchainkit/minikit';
import { Sparkles, Video, Users, TrendingUp, Zap } from 'lucide-react';

export default function VoteVisionApp() {
  const [activeTab, setActiveTab] = useState('feed');
  const { context, setFrameReady } = useMiniKit();
  const { user } = useAuthenticate();

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handlePromptSubmit = async (prompt: string, category: string, template?: string) => {
    if (!user) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.address,
          promptText: prompt,
          category,
          tags: template ? [template] : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit prompt');
      }

      // Switch to feed to show the new prompt
      setActiveTab('feed');

      // Show success message
      alert('Prompt submitted successfully! It will appear in the community feed for voting.');
    } catch (error: any) {
      alert(`Failed to submit prompt: ${error.message}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="card-cyber text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Video className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-accent text-shadow">
                    Welcome to VoteVision
                  </h1>
                  <p className="text-muted mt-1">
                    Shape the future of video content, democratically
                  </p>
                </div>
              </div>
              
              {!user && (
                <div className="bg-surface bg-opacity-50 p-6 rounded-sm border border-accent border-opacity-30">
                  <h3 className="text-lg font-medium text-fg mb-3">
                    Connect your wallet to get started
                  </h3>
                  <p className="text-muted mb-4">
                    Join the community and start voting on video prompts
                  </p>
                  <Wallet>
                    <ConnectWallet>
                      <button className="btn-primary">
                        Connect Wallet
                      </button>
                    </ConnectWallet>
                  </Wallet>
                </div>
              )}
            </div>

            {/* Community Feed */}
            <CommunityFeed variant="prompts" />
          </div>
        );

      case 'create':
        return (
          <div className="max-w-2xl mx-auto">
            {user ? (
              <PromptInput onSubmit={handlePromptSubmit} />
            ) : (
              <div className="card-cyber text-center">
                <Sparkles className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-fg mb-4">
                  Connect to Create
                </h2>
                <p className="text-muted mb-6">
                  Connect your wallet to submit video prompts and participate in the community
                </p>
                <Wallet>
                  <ConnectWallet>
                    <button className="btn-primary">
                      Connect Wallet to Continue
                    </button>
                  </ConnectWallet>
                </Wallet>
              </div>
            )}
          </div>
        );

      case 'trending':
        return (
          <div className="space-y-8">
            <div className="card-cyber text-center">
              <TrendingUp className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-accent text-shadow mb-2">
                Trending Content
              </h2>
              <p className="text-muted">
                Discover the most popular video prompts and generated content
              </p>
            </div>
            <CommunityFeed variant="results" />
          </div>
        );

      case 'community':
        return (
          <div className="space-y-8">
            <div className="card-cyber text-center">
              <Users className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-accent text-shadow mb-2">
                Community Hub
              </h2>
              <p className="text-muted mb-6">
                Connect with other creators and see community stats
              </p>
              
              {user && (
                <div className="bg-surface bg-opacity-50 p-6 rounded-sm border border-accent border-opacity-30">
                  <Identity 
                    address={user.address}
                    className="flex items-center justify-center space-x-4"
                  >
                    <Avatar className="w-12 h-12" />
                    <div className="text-left">
                      <Name className="text-lg font-medium text-fg" />
                      <p className="text-sm text-muted">Community Member</p>
                    </div>
                  </Identity>
                </div>
              )}
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 text-center">
                <Zap className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">1,247</div>
                <div className="text-sm text-muted">Total Votes Cast</div>
              </div>
              
              <div className="glass-card p-6 text-center">
                <Video className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">89</div>
                <div className="text-sm text-muted">Videos Generated</div>
              </div>
              
              <div className="glass-card p-6 text-center">
                <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">342</div>
                <div className="text-sm text-muted">Active Members</div>
              </div>
              
              <div className="glass-card p-6 text-center">
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">156</div>
                <div className="text-sm text-muted">Prompts Submitted</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AppShell>
  );
}
