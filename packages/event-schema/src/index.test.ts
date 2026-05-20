import { describe, it, expect } from 'vitest';
import { CrimeCommitted, DomainEvent, subjectFor } from './index.js';

describe('event-schema', () => {
  it('parses a valid crime.committed event', () => {
    const evt = CrimeCommitted.parse({
      id: '00000000-0000-4000-8000-000000000001',
      type: 'crime.committed',
      version: 1,
      occurredAt: '2026-05-19T10:00:00.000Z',
      data: {
        crimeId: '00000000-0000-4000-8000-000000000002',
        crimeType: 'hijack',
        severity: 'major',
        perpetrators: ['player_a'],
        location: { x: 0, y: 0, z: 0, province: 'GP', area: 'hillbrow' },
        witnessed: true,
        witnessIds: ['npc_1'],
      },
    });
    expect(evt.data.crimeType).toBe('hijack');
  });

  it('rejects unknown event types in the union', () => {
    expect(() =>
      DomainEvent.parse({
        id: '00000000-0000-4000-8000-000000000003',
        type: 'crime.invented',
        version: 1,
        occurredAt: '2026-05-19T10:00:00.000Z',
        data: {},
      }),
    ).toThrow();
  });

  it('builds NATS subjects from event type', () => {
    expect(subjectFor('crime.committed')).toBe('gtarp.crime.committed');
  });
});
