import type { AiTier } from '@gtarp/shared-types';
import type {
  GenerationRequest,
  GenerationResult,
  TextProvider,
  VoiceProvider,
  VoiceRequest,
  VoiceResult,
} from '@gtarp/ai-clients';

export interface RouterResult extends GenerationResult {
  usedTier: AiTier;
  requestedTier: AiTier;
  degraded: boolean;
}

export interface VoiceRouterResult extends VoiceResult {
  degraded: boolean;
}

export interface BudgetChecker {
  /** Returns true if within budget. */
  checkPlayer(playerId: string, tokens: number): Promise<boolean>;
  checkServer(tokens: number): Promise<boolean>;
  recordUsage(playerId: string | undefined, tokens: number): Promise<void>;
}

export interface UsageLogger {
  log(entry: AiUsageEntry): Promise<void>;
}

export interface AiUsageEntry {
  provider: string;
  model: string;
  tier: number;
  purpose: string;
  promptTokens: number;
  completionTokens: number;
  audioSeconds?: number;
  costUsd: number;
  cacheHit: boolean;
  cacheKey?: string;
}

export interface RouterDeps {
  textProviders: Map<AiTier, TextProvider>;
  voiceProviders: Map<string, VoiceProvider>;
  budgetChecker: BudgetChecker;
  usageLogger: UsageLogger;
}

function nextLowerTier(tier: AiTier): AiTier {
  if (tier <= 0) return 0;
  return (tier - 1) as AiTier;
}

export async function routeText(
  req: GenerationRequest,
  playerId: string | undefined,
  deps: RouterDeps,
): Promise<RouterResult> {
  const requestedTier = req.tier;
  const estimatedTokens = req.maxTokens ?? 1024;

  let effectiveTier = requestedTier;
  let degraded = false;

  // Check server budget (tier 0 = templates, always allowed)
  if (effectiveTier > 0) {
    const serverOk = await deps.budgetChecker.checkServer(estimatedTokens);
    if (!serverOk) {
      effectiveTier = nextLowerTier(effectiveTier);
      degraded = true;
    }
  }

  // Check player budget
  if (playerId !== undefined && effectiveTier > 0) {
    const playerOk = await deps.budgetChecker.checkPlayer(playerId, estimatedTokens);
    if (!playerOk) {
      effectiveTier = nextLowerTier(effectiveTier);
      degraded = true;
    }
  }

  // Fall back to tier 0 if requested tier's provider is missing
  const provider = deps.textProviders.get(effectiveTier) ?? deps.textProviders.get(0);
  if (provider === undefined) {
    throw new Error(`No text provider available (tried tier ${effectiveTier} and tier 0)`);
  }

  const modifiedReq: GenerationRequest = { ...req, tier: effectiveTier };
  const result = await provider.generate(modifiedReq);

  const usageEntry: AiUsageEntry = {
    provider: result.provider,
    model: result.model,
    tier: result.tier,
    purpose: req.purpose,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    costUsd: result.costUsd,
    cacheHit: result.cacheHit,
  };
  if (req.cacheKey !== undefined) {
    usageEntry.cacheKey = req.cacheKey;
  }
  await deps.usageLogger.log(usageEntry);

  await deps.budgetChecker.recordUsage(
    playerId,
    result.promptTokens + result.completionTokens,
  );

  return {
    ...result,
    usedTier: effectiveTier,
    requestedTier,
    degraded,
  };
}

export async function routeVoice(
  req: VoiceRequest,
  playerId: string | undefined,
  providerKey: string,
  deps: RouterDeps,
): Promise<VoiceRouterResult> {
  const estimatedTokens = 1024;
  let degraded = false;

  const serverOk = await deps.budgetChecker.checkServer(estimatedTokens);
  if (!serverOk) degraded = true;

  if (playerId !== undefined) {
    const playerOk = await deps.budgetChecker.checkPlayer(playerId, estimatedTokens);
    if (!playerOk) degraded = true;
  }

  const provider = deps.voiceProviders.get(providerKey);
  if (provider === undefined) {
    throw new Error(`No voice provider found for key: ${providerKey}`);
  }

  const result = await provider.speak(req);

  const usageEntry: AiUsageEntry = {
    provider: providerKey,
    model: providerKey,
    tier: 1,
    purpose: req.purpose,
    promptTokens: 0,
    completionTokens: 0,
    audioSeconds: result.durationSeconds,
    costUsd: result.costUsd,
    cacheHit: result.cacheHit,
  };
  if (req.cacheKey !== undefined) {
    usageEntry.cacheKey = req.cacheKey;
  }
  await deps.usageLogger.log(usageEntry);

  await deps.budgetChecker.recordUsage(playerId, 0);

  return { ...result, degraded };
}
