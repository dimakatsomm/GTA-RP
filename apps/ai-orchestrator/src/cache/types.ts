import type { GenerationResult } from '@gtarp/ai-clients';

export interface CacheEntry {
  result: GenerationResult;
  storedAt: number;
}

export interface L1Cache {
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void>;
}

export interface L2Cache {
  find(userPrompt: string, threshold?: number): Promise<CacheEntry | null>;
  store(userPrompt: string, entry: CacheEntry): Promise<void>;
}
