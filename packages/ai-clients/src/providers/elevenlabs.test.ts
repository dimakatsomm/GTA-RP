import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VoiceRequest } from '../index.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const fsMod = await import('node:fs');
const mockExistsSync = vi.mocked(fsMod.existsSync);
const mockReadFileSync = vi.mocked(fsMod.readFileSync);
const mockWriteFileSync = vi.mocked(fsMod.writeFileSync);

const { ElevenLabsVoiceProvider } = await import('./elevenlabs.js');

const BASE_REQ: VoiceRequest = {
  voiceId: 'voice-abc',
  text: 'Eish, sharp sharp bra.',
  purpose: 'dispatch',
};

function makeFetchResponse(data: Buffer): Response {
  // Slice to exact byte range to avoid returning the entire pooled ArrayBuffer
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    arrayBuffer: () => Promise.resolve(ab),
  } as unknown as Response;
}

describe('ElevenLabsVoiceProvider', () => {
  beforeEach(() => {
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue(Buffer.from('cached-audio'));
    mockWriteFileSync.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('throws if text exceeds 1500 characters', async () => {
    const provider = new ElevenLabsVoiceProvider({ apiKey: 'test-key', cacheDir: '/fake/cache' });
    const longText = 'a'.repeat(1501);
    await expect(
      provider.speak({ ...BASE_REQ, text: longText }),
    ).rejects.toThrow('hard cap');
  });

  it('returns cached audio on cache hit', async () => {
    const cachedBuffer = Buffer.from('mp3-bytes-cached');
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(cachedBuffer);

    const provider = new ElevenLabsVoiceProvider({ apiKey: 'test-key', cacheDir: '/fake/cache' });
    const result = await provider.speak(BASE_REQ);

    expect(result.cacheHit).toBe(true);
    expect(result.audio).toEqual(cachedBuffer);
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  it('calls ElevenLabs API on cache miss and caches result', async () => {
    const audioData = Buffer.from('fresh-mp3-bytes');
    mockExistsSync.mockReturnValue(false);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(audioData)));

    const provider = new ElevenLabsVoiceProvider({ apiKey: 'test-key', cacheDir: '/fake/cache' });
    const result = await provider.speak(BASE_REQ);

    expect(result.cacheHit).toBe(false);
    expect(result.audio).toEqual(audioData);
    expect(mockWriteFileSync).toHaveBeenCalledOnce();

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.elevenlabs.io/v1/text-to-speech/${BASE_REQ.voiceId}`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'xi-api-key': 'test-key' }),
      }),
    );
  });

  it('calculates cost correctly', async () => {
    mockExistsSync.mockReturnValue(false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(Buffer.from('x'))));

    const provider = new ElevenLabsVoiceProvider({ apiKey: 'test-key', cacheDir: '/fake/cache' });
    const text = 'Hello kasi!'; // 11 chars
    const result = await provider.speak({ ...BASE_REQ, text });

    expect(result.costUsd).toBeCloseTo(text.length * 0.00003, 10);
    expect(result.durationSeconds).toBeCloseTo(text.length / 15, 10);
  });
});
