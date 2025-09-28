'use client';

import { useState } from 'react';
import { Send, Sparkles, Image, Video } from 'lucide-react';
import { PROMPT_TEMPLATES, VIDEO_CATEGORIES } from '@/lib/constants';

interface PromptInputProps {
  onSubmit: (prompt: string, category: string, template?: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSubmit, disabled = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(VIDEO_CATEGORIES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim(), selectedCategory, selectedTemplate);
      setPrompt('');
      setSelectedTemplate('');
    }
  };

  const applyTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.template);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  return (
    <div className="card-cyber">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-accent mb-2 text-shadow">
          Create Video Prompt
        </h3>
        <p className="text-muted">
          Describe your video idea and let the community vote on it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-fg mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-cyber w-full"
            disabled={disabled}
          >
            {VIDEO_CATEGORIES.map((category) => (
              <option key={category} value={category} className="bg-surface text-fg">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Template Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-fg">
              Templates (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-accent hover:text-fg transition-colors duration-200 text-sm"
            >
              {showTemplates ? 'Hide' : 'Show'} Templates
            </button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {PROMPT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  disabled={disabled}
                  className={`
                    p-3 text-left border-2 rounded-sm transition-all duration-200
                    ${selectedTemplate === template.id
                      ? 'border-accent bg-accent bg-opacity-20 text-accent'
                      : 'border-accent border-opacity-30 hover:border-opacity-60 text-fg'
                    }
                  `}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-fg mb-2">
            Video Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video idea in detail... (e.g., 'A futuristic cityscape at sunset with flying cars and neon lights')"
            className="input-cyber w-full h-32 resize-none"
            disabled={disabled}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-muted">
              {prompt.length}/500 characters
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted">
              <Image size={14} />
              <span>Images</span>
              <Video size={14} />
              <span>Videos</span>
              <Sparkles size={14} />
              <span>AI Enhanced</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          <span>Submit for Community Vote</span>
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-surface bg-opacity-30 rounded-sm border border-accent border-opacity-20">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-fg">How it works</h4>
            <p className="text-sm text-muted mt-1">
              Your prompt will be visible to the community for voting. Once it reaches the minimum vote threshold, 
              AI will generate your video using the most popular elements chosen by voters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
