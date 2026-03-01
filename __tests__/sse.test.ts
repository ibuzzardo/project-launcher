import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildEventToMessage, createSseStream, toSseMessage } from '@/lib/server/sse';
import type { BuildRecord } from '@/lib/types/project';

const decoder = new TextDecoder();

function buildFixture(): BuildRecord {
  return {
    id: 'build-1',
    projectName: 'Example',
    repositoryUrl: 'https://example.com/repo',
    branch: 'main',
    status: 'queued',
    progress: 3,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    logs: []
  };
}

describe('toSseMessage', (): void => {
  it('formats event payload with id', (): void => {
    const text = toSseMessage({ event: 'build.updated', id: '1', data: { ok: true } });
    expect(text).toContain('id: 1');
    expect(text).toContain('event: build.updated');
    expect(text).toContain('data: {"ok":true}');
    expect(text.endsWith('\n\n')).toBe(true);
  });

  it('formats event payload without id', (): void => {
    const text = toSseMessage({ event: 'heartbeat', data: { ts: 1 } });
    expect(text).not.toContain('id:');
    expect(text).toContain('event: heartbeat');
  });
});

describe('buildEventToMessage', (): void => {
  it('maps build event to SSE message shape', (): void => {
    const payload = buildFixture();
    const message = buildEventToMessage({ type: 'build.updated', payload });

    expect(message.event).toBe('build.updated');
    expect(message.id).toBe(payload.updatedAt);
    expect(message.data).toEqual(payload);
  });
});

describe('createSseStream', (): void => {
  beforeEach((): void => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  it('sends messages emitted by onStart', async (): Promise<void> => {
    const controller = new AbortController();
    const stream = createSseStream({
      request: new Request('http://localhost/events', { signal: controller.signal }),
      heartbeatMs: 60_000,
      onStart(send): void {
        send({ event: 'build.updated', data: { ok: true }, id: 'evt-1' });
      }
    });

    const reader = stream.getReader();
    const first = await reader.read();
    const text = decoder.decode(first.value);

    expect(first.done).toBe(false);
    expect(text).toContain('event: build.updated');
    expect(text).toContain('id: evt-1');
  });

  it('emits heartbeat events at configured interval', async (): Promise<void> => {
    const controller = new AbortController();
    const stream = createSseStream({
      request: new Request('http://localhost/events', { signal: controller.signal }),
      heartbeatMs: 100,
      onStart(): void {}
    });

    const reader = stream.getReader();
    await vi.advanceTimersByTimeAsync(100);

    const first = await reader.read();
    const text = decoder.decode(first.value);

    expect(first.done).toBe(false);
    expect(text).toContain('event: heartbeat');
  });

  it('runs teardown and closes when aborted', async (): Promise<void> => {
    const controller = new AbortController();
    const teardown = vi.fn();

    const stream = createSseStream({
      request: new Request('http://localhost/events', { signal: controller.signal }),
      heartbeatMs: 60_000,
      onStart(): () => void {
        return teardown;
      }
    });

    const reader = stream.getReader();
    controller.abort();
    await vi.runAllTimersAsync();

    const done = await reader.read();
    expect(done.done).toBe(true);
    expect(teardown).toHaveBeenCalledTimes(1);
  });
});
