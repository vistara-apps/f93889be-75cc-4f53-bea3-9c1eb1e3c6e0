'use client';

import { useState } from 'react';
import { 
  Video, 
  Users, 
  Plus, 
  TrendingUp, 
  Settings2,
  Menu,
  X
} from 'lucide-react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { APP_CONFIG } from '@/lib/constants';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'feed', name: 'Live Stream', icon: Video, description: 'Community Feed' },
    { id: 'create', name: 'Create Idea', icon: Plus, description: 'Submit Prompt' },
    { id: 'trending', name: 'Trending', icon: TrendingUp, description: 'Popular Content' },
    { id: 'community', name: 'Community', icon: Users, description: 'User Profiles' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-secondary p-2"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-accent border-opacity-30 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-accent border-opacity-30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                <Video className="w-5 h-5 text-bg" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-accent text-shadow">
                  {APP_CONFIG.name}
                </h1>
                <p className="text-xs text-muted">
                  {APP_CONFIG.tagline.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left rounded-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-accent text-bg font-bold neon-glow' 
                      : 'text-fg hover:bg-surface hover:text-accent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-accent border-opacity-30">
            <Wallet>
              <ConnectWallet>
                <div className="flex items-center space-x-3 p-3 rounded-sm bg-surface bg-opacity-50 border border-accent border-opacity-30">
                  <Avatar className="w-8 h-8" />
                  <div className="flex-1 min-w-0">
                    <Name className="text-sm font-medium text-fg truncate" />
                    <div className="text-xs text-muted">Connected</div>
                  </div>
                </div>
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-surface bg-opacity-80 backdrop-blur-sm border-b border-accent border-opacity-30 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:hidden w-10"></div>
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-accent text-shadow">
                  {navigation.find(nav => nav.id === activeTab)?.name || 'VoteVision'}
                </h2>
                <p className="text-sm text-muted">
                  {navigation.find(nav => nav.id === activeTab)?.description || APP_CONFIG.tagline}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-muted hover:text-accent transition-colors duration-200">
                  <Settings2 size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
