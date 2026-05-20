import { describe, it, expect } from 'vitest';
import { pingCommand } from './ping.js';

describe('ping slash command', () => {
  it('has name "ping"', () => {
    expect(pingCommand.name).toBe('ping');
  });

  it('has a non-empty description', () => {
    expect(pingCommand.description.length).toBeGreaterThan(0);
  });

  it('serialises to valid JSON payload', () => {
    const json = pingCommand.toJSON();
    expect(json.name).toBe('ping');
    expect(typeof json.description).toBe('string');
  });
});
