import type { DomainEvent } from '@gtarp/event-schema';
import type { Job } from 'bullmq';

export interface ConsumerRegistration {
  name: string;
  subjects: string[];
  handler: (job: Job<DomainEvent>) => Promise<void>;
}

export const CONSUMER_NAMES = [
  'reputation',
  'story',
  'media',
  'gang',
  'economy',
  'dispatch',
] as const;
export type ConsumerName = (typeof CONSUMER_NAMES)[number];

const registryMap = new Map<string, ConsumerRegistration>();

export function registerConsumer(reg: ConsumerRegistration): void {
  registryMap.set(reg.name, reg);
}

export function getRegisteredConsumers(): ConsumerRegistration[] {
  return [...registryMap.values()];
}

export function getConsumersForSubject(subject: string): ConsumerRegistration[] {
  return [...registryMap.values()].filter((r) =>
    r.subjects.some((s) => subjectMatches(s, subject)),
  );
}

/**
 * NATS-style wildcard matching.
 *  - `*`  matches exactly one token
 *  - `>`  must be the final token and matches one OR MORE remaining tokens
 *         (so `gtarp.>` does NOT match the bare subject `gtarp`)
 */
function subjectMatches(pattern: string, subject: string): boolean {
  if (pattern === subject) return true;
  const patParts = pattern.split('.');
  const subParts = subject.split('.');
  for (let i = 0; i < patParts.length; i++) {
    const p = patParts[i];
    if (p === '>') {
      // `>` is only legal as the final token and must match at least one token.
      return i === patParts.length - 1 && subParts.length > i;
    }
    if (i >= subParts.length) return false;
    if (p === '*') continue;
    if (p !== subParts[i]) return false;
  }
  return patParts.length === subParts.length;
}
