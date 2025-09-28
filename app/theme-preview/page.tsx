'use client';

import { useTheme } from '../components/ThemeProvider';
import { Video, Users, TrendingUp, Sparkles } from 'lucide-react';

const themes = [
  { id: 'default', name: 'Cyberpunk Gaming', description: 'Dark purple with neon green accents' },
  { id: 'celo', name: 'Celo', description: 'Black background with yellow accents' },
  { id: 'solana', name: 'Solana', description: 'Dark purple with magenta accents' },
  { id: 'base', name: 'Base', description: 'Dark blue with Base blue accents' },
  { id: 'coinbase', name: 'Coinbase', description: 'Dark navy with Coinbase blue accents' },
] as const;

export default function ThemePreview() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-accent text-shadow mb-4">
            VoteVision Theme Preview
          </h1>
          <p className="text-muted">
            Preview different blockchain themes for the VoteVision app
          </p>
        </div>

        {/* Theme Selector */}
        <div className="card-cyber">
          <h2 className="text-xl font-bold text-fg mb-4">Select Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`
                  p-4 text-left border-2 rounded-sm transition-all duration-200
                  ${theme === t.id
                    ? 'border-accent bg-accent bg-opacity-20 text-accent'
                    : 'border-accent border-opacity-30 hover:border-opacity-60 text-fg'
                  }
                `}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted mt-1">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Component Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-fg">Cards & Components</h3>
            
            <div className="card-cyber">
              <div className="flex items-center space-x-3 mb-4">
                <Video className="w-6 h-6 text-accent" />
                <h4 className="font-medium text-fg">Video Prompt Card</h4>
              </div>
              <p className="text-muted mb-4">
                A cyberpunk cityscape at night with neon lights reflecting on wet streets
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-accent bg-opacity-20 text-accent rounded-sm">
                  Entertainment
                </span>
                <span className="text-sm text-muted">24 votes</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-accent mr-2" />
                <span className="text-2xl font-bold text-accent">342</span>
              </div>
              <p className="text-sm text-muted text-center">Active Members</p>
            </div>
          </div>

          {/* Buttons & Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-fg">Buttons & Inputs</h3>
            
            <div className="space-y-3">
              <button className="btn-primary w-full">
                Primary Button
              </button>
              
              <button className="btn-secondary w-full">
                Secondary Button
              </button>
              
              <input
                type="text"
                placeholder="Cyber input field..."
                className="input-cyber w-full"
              />
              
              <textarea
                placeholder="Describe your video idea..."
                className="input-cyber w-full h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-accent mb-1">1,247</div>
            <div className="text-sm text-muted">Total Votes</div>
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

        {/* Color Palette */}
        <div className="card-cyber">
          <h3 className="text-lg font-bold text-fg mb-4">Current Theme Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-bg border border-accent rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Background</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-surface border border-accent rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Surface</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Accent</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fg rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Foreground</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-border rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Border</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-sm mx-auto mb-2"></div>
              <div className="text-xs text-muted">Muted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
