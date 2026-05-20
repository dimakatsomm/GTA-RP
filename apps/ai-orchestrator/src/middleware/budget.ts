import type { FastifyRequest, FastifyReply } from 'fastify';
import type { BudgetChecker } from '../router.js';
import type { AiTier } from '@gtarp/shared-types';

declare module 'fastify' {
  interface FastifyRequest {
    budgetCtx?: {
      effectiveTier: AiTier;
      playerId: string | undefined;
      degraded: boolean;
    };
  }
}

export interface BudgetMiddlewareOptions {
  budgetChecker: BudgetChecker;
  /** Header carrying the player ID. Defaults to 'x-player-id'. */
  playerIdHeader?: string;
}

function isAiTier(v: unknown): v is AiTier {
  return v === 0 || v === 1 || v === 2 || v === 3;
}

function nextLowerTier(tier: AiTier): AiTier {
  if (tier <= 0) return 0;
  return (tier - 1) as AiTier;
}

const ESTIMATED_TOKENS = 1024;

export function createBudgetMiddleware(opts: BudgetMiddlewareOptions) {
  const headerName = opts.playerIdHeader ?? 'x-player-id';

  return async function budgetGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    // Extract tier from parsed body (Fastify parses before preHandlers)
    const body = request.body as Record<string, unknown> | null | undefined;
    const rawTier: unknown = body != null ? body['tier'] : undefined;
    const requestedTier: AiTier = isAiTier(rawTier) ? rawTier : 1;

    // Extract playerId from header
    const rawPlayerId = request.headers[headerName];
    const playerId = typeof rawPlayerId === 'string' ? rawPlayerId : undefined;

    let effectiveTier = requestedTier;
    let degraded = false;

    // Check server budget
    if (effectiveTier > 0) {
      const serverOk = await opts.budgetChecker.checkServer(ESTIMATED_TOKENS);
      if (!serverOk) {
        effectiveTier = nextLowerTier(effectiveTier);
        degraded = true;
      }
    }

    // Check player budget
    if (playerId !== undefined && effectiveTier > 0) {
      const playerOk = await opts.budgetChecker.checkPlayer(playerId, ESTIMATED_TOKENS);
      if (!playerOk) {
        effectiveTier = nextLowerTier(effectiveTier);
        degraded = true;
      }
    }

    request.budgetCtx = { effectiveTier, playerId, degraded };
  };
}
