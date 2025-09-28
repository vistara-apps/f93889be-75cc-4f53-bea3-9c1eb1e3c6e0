import { VideoPrompt } from './types';

// AI Service configuration
const AI_SERVICE_CONFIG = {
  apiKey: process.env.AI_SERVICE_API_KEY || '',
  baseUrl: process.env.AI_SERVICE_BASE_URL || 'https://api.runwayml.com/v1',
  model: process.env.AI_SERVICE_MODEL || 'gen-3-alpha-turbo',
};

// Supported AI services
export enum AIService {
  RUNWAY = 'runway',
  PIKA = 'pika',
  CUSTOM = 'custom',
}

// Video generation request interface
export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
  model?: string;
}

// Video generation response interface
export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Generate video using AI service
 */
export async function generateVideo(
  prompt: VideoPrompt,
  options: Partial<VideoGenerationRequest> = {}
): Promise<VideoGenerationResponse> {
  const service = (process.env.AI_SERVICE_TYPE as AIService) || AIService.RUNWAY;

  switch (service) {
    case AIService.RUNWAY:
      return await generateWithRunway(prompt, options);
    case AIService.PIKA:
      return await generateWithPika(prompt, options);
    case AIService.CUSTOM:
      return await generateWithCustom(prompt, options);
    default:
      throw new Error(`Unsupported AI service: ${service}`);
  }
}

/**
 * Generate video using Runway ML
 */
async function generateWithRunway(
  prompt: VideoPrompt,
  options: Partial<VideoGenerationRequest>
): Promise<VideoGenerationResponse> {
  if (!AI_SERVICE_CONFIG.apiKey) {
    throw new Error('Runway API key not configured');
  }

  const requestBody = {
    model: options.model || AI_SERVICE_CONFIG.model,
    prompt_image: null, // For text-to-video
    prompt_text: prompt.promptText,
    duration: options.duration || 5, // seconds
    ratio: options.aspectRatio || '16:9',
    style: options.style || 'realistic',
    seed: Math.floor(Math.random() * 1000000), // For reproducibility
  };

  try {
    const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-03-06',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      status: 'pending',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Runway video generation failed:', error);
    throw error;
  }
}

/**
 * Generate video using Pika Labs
 */
async function generateWithPika(
  prompt: VideoPrompt,
  options: Partial<VideoGenerationRequest>
): Promise<VideoGenerationResponse> {
  if (!AI_SERVICE_CONFIG.apiKey) {
    throw new Error('Pika API key not configured');
  }

  const requestBody = {
    prompt: prompt.promptText,
    model: options.model || 'pika-1.0',
    duration: options.duration || 4,
    aspect_ratio: options.aspectRatio || '16:9',
    style: options.style || 'vivid',
  };

  try {
    const response = await fetch('https://api.pika.art/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pika API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      status: 'pending',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Pika video generation failed:', error);
    throw error;
  }
}

/**
 * Generate video using custom AI service
 */
async function generateWithCustom(
  prompt: VideoPrompt,
  options: Partial<VideoGenerationRequest>
): Promise<VideoGenerationResponse> {
  // Placeholder for custom AI service integration
  // This could be your own hosted model or another service

  const requestBody = {
    prompt: prompt.promptText,
    category: prompt.category,
    tags: prompt.tags,
    ...options,
  };

  try {
    const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}/generate-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      status: 'pending',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Custom AI video generation failed:', error);
    throw error;
  }
}

/**
 * Check video generation status
 */
export async function checkVideoStatus(generationId: string): Promise<VideoGenerationResponse> {
  const service = (process.env.AI_SERVICE_TYPE as AIService) || AIService.RUNWAY;

  switch (service) {
    case AIService.RUNWAY:
      return await checkRunwayStatus(generationId);
    case AIService.PIKA:
      return await checkPikaStatus(generationId);
    case AIService.CUSTOM:
      return await checkCustomStatus(generationId);
    default:
      throw new Error(`Unsupported AI service: ${service}`);
  }
}

/**
 * Check Runway video generation status
 */
async function checkRunwayStatus(generationId: string): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}/tasks/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
        'X-Runway-Version': '2024-03-06',
      },
    });

    if (!response.ok) {
      throw new Error(`Runway API error: ${response.status}`);
    }

    const data = await response.json();

    let status: 'pending' | 'processing' | 'complete' | 'failed';
    switch (data.status) {
      case 'PENDING':
        status = 'pending';
        break;
      case 'RUNNING':
        status = 'processing';
        break;
      case 'SUCCEEDED':
        status = 'complete';
        break;
      case 'FAILED':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    return {
      id: generationId,
      status,
      videoUrl: data.output?.[0] || undefined,
      error: data.failure_reason || undefined,
      createdAt: new Date(data.created_at * 1000),
      completedAt: data.completed_at ? new Date(data.completed_at * 1000) : undefined,
    };
  } catch (error) {
    console.error('Runway status check failed:', error);
    throw error;
  }
}

/**
 * Check Pika video generation status
 */
async function checkPikaStatus(generationId: string): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`https://api.pika.art/v1/video/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Pika API error: ${response.status}`);
    }

    const data = await response.json();

    let status: 'pending' | 'processing' | 'complete' | 'failed';
    switch (data.status) {
      case 'processing':
        status = 'processing';
        break;
      case 'complete':
        status = 'complete';
        break;
      case 'error':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    return {
      id: generationId,
      status,
      videoUrl: data.video_url || undefined,
      error: data.error || undefined,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    };
  } catch (error) {
    console.error('Pika status check failed:', error);
    throw error;
  }
}

/**
 * Check custom AI service status
 */
async function checkCustomStatus(generationId: string): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${AI_SERVICE_CONFIG.baseUrl}/video-status/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_CONFIG.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Custom AI API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: generationId,
      status: data.status,
      videoUrl: data.video_url || undefined,
      error: data.error || undefined,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    };
  } catch (error) {
    console.error('Custom AI status check failed:', error);
    throw error;
  }
}

/**
 * Get supported AI models for the current service
 */
export function getSupportedModels(): string[] {
  const service = (process.env.AI_SERVICE_TYPE as AIService) || AIService.RUNWAY;

  switch (service) {
    case AIService.RUNWAY:
      return ['gen-3-alpha-turbo', 'gen-2', 'gen-1'];
    case AIService.PIKA:
      return ['pika-1.0', 'pika-1.0-fast'];
    case AIService.CUSTOM:
      return ['custom-model-1', 'custom-model-2'];
    default:
      return [];
  }
}

/**
 * Validate video generation request
 */
export function validateVideoRequest(request: VideoGenerationRequest): string[] {
  const errors: string[] = [];

  if (!request.prompt || request.prompt.trim().length < 10) {
    errors.push('Prompt must be at least 10 characters long');
  }

  if (request.duration && (request.duration < 1 || request.duration > 10)) {
    errors.push('Duration must be between 1 and 10 seconds');
  }

  const supportedRatios = ['16:9', '9:16', '1:1', '4:3', '3:4'];
  if (request.aspectRatio && !supportedRatios.includes(request.aspectRatio)) {
    errors.push(`Aspect ratio must be one of: ${supportedRatios.join(', ')}`);
  }

  return errors;
}

