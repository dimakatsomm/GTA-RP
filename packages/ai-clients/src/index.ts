import type { AiTier } from '@gtarp/shared-types';

export interface GenerationRequest {
  purpose: string;
  tier: AiTier;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  cacheKey?: string;
}

export interface GenerationResult {
  text: string;
  provider: 'openai' | 'anthropic' | 'template';
  model: string;
  tier: AiTier;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  cacheHit: boolean;
}

export interface VoiceRequest {
  voiceId: string;
  text: string;
  purpose: string;
  cacheKey?: string;
}

export interface VoiceResult {
  audio: Buffer;
  durationSeconds: number;
  costUsd: number;
  cacheHit: boolean;
}

/**
 * Provider-agnostic generation contract. Concrete adapters live in
 * `./providers/{openai,anthropic,elevenlabs,template}.ts`.
 */
export interface TextProvider {
  generate(req: GenerationRequest): Promise<GenerationResult>;
}

export interface VoiceProvider {
  speak(req: VoiceRequest): Promise<VoiceResult>;
}

// Model selection by tier. Keep this list in sync with ADR-0004.
export const TIER_MODELS = {
  0: { provider: 'template' as const, model: 'template-v1' },
  1: { provider: 'anthropic' as const, model: 'claude-haiku-4-5-20251001' },
  2: { provider: 'anthropic' as const, model: 'claude-sonnet-4-6' },
  3: { provider: 'anthropic' as const, model: 'claude-opus-4-7' },
} as const;
