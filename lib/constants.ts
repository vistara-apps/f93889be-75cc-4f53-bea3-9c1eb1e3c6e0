export const APP_CONFIG = {
  name: 'VoteVision',
  tagline: 'Shape the future of video content, democratically.',
  version: '1.0.0',
  network: 'Base',
} as const;

export const VOTING_CONFIG = {
  minVotesToGenerate: 10,
  votingPeriod: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxPromptsPerUser: 5,
  voteWeight: {
    basic: 1,
    premium: 2,
    vip: 5,
  },
} as const;

export const VIDEO_CATEGORIES = [
  'Entertainment',
  'Educational',
  'Music',
  'Gaming',
  'Technology',
  'Art & Design',
  'Comedy',
  'Documentary',
] as const;

export const PROMPT_TEMPLATES = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Professional movie-style video',
    template: 'Create a cinematic video with dramatic lighting and camera movements',
  },
  {
    id: 'animated',
    name: 'Animated',
    description: 'Cartoon or 3D animated style',
    template: 'Generate an animated video with vibrant colors and smooth motion',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Educational and informative style',
    template: 'Produce a documentary-style video with clear narration and facts',
  },
  {
    id: 'music-video',
    name: 'Music Video',
    description: 'Synchronized with rhythm and beats',
    template: 'Create a music video with dynamic visuals synchronized to audio',
  },
] as const;
