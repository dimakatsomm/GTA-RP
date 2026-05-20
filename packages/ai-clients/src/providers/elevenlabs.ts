import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { VoiceProvider, VoiceRequest, VoiceResult } from '../index.js';

const MAX_CHARS = 1500;
const CHARS_PER_SECOND = 15;
const COST_PER_CHAR = 0.00003;

interface ElevenLabsOptions {
  apiKey?: string;
  cacheDir?: string;
}

export class ElevenLabsVoiceProvider implements VoiceProvider {
  private readonly apiKey: string;
  private readonly cacheDir: string;

  constructor(opts: ElevenLabsOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env['ELEVENLABS_API_KEY'] ?? '';
    this.cacheDir =
      opts.cacheDir ??
      process.env['ELEVENLABS_CACHE_DIR'] ??
      join(tmpdir(), 'gtarp-tts-cache');

    mkdirSync(this.cacheDir, { recursive: true });
  }

  async speak(req: VoiceRequest): Promise<VoiceResult> {
    if (req.text.length > MAX_CHARS) {
      throw new Error(
        `ElevenLabs: text exceeds ${MAX_CHARS} character hard cap (got ${req.text.length})`,
      );
    }

    const cacheKey = createHash('sha256')
      .update(`${req.voiceId}:${req.text}`)
      .digest('hex');
    const cachePath = join(this.cacheDir, `${cacheKey}.mp3`);

    if (existsSync(cachePath)) {
      const audio = readFileSync(cachePath);
      return {
        audio,
        durationSeconds: req.text.length / CHARS_PER_SECOND,
        costUsd: req.text.length * COST_PER_CHAR,
        cacheHit: true,
      };
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${req.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: req.text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    writeFileSync(cachePath, audio);

    return {
      audio,
      durationSeconds: req.text.length / CHARS_PER_SECOND,
      costUsd: req.text.length * COST_PER_CHAR,
      cacheHit: false,
    };
  }
}
