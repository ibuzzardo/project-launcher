import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BuildEvent } from '@/lib/types/project';

describe('inMemoryProjectStore', (): void => {
  beforeEach((): void => {
    vi.useFakeTimers();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('build-123');
  });

  afterEach((): void => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.resetModules();
  });

  it('creates builds with default queued state', async (): Promise<void> => {
    const { inMemoryProjectStore } = await import('@/lib/store/in-memory-project-store');

    const build = inMemoryProjectStore.createBuild({
      projectName: 'Demo',
      repositoryUrl: 'https://github.com/acme/demo',
      branch: 'main'
    });

    expect(build.id).toBe('build-123');
    expect(build.status).toBe('queued');
    expect(build.progress).toBe(3);
    expect(build.logs[0]?.message).toBe('Build queued');
  });

  it('returns defensive copies from getBuild', async (): Promise<void> => {
    const { inMemoryProjectStore } = await import('@/lib/store/in-memory-project-store');

    inMemoryProjectStore.createBuild({
      projectName: 'Demo',
      repositoryUrl: 'https://github.com/acme/demo',
      branch: 'main'
    });

    const first = inMemoryProjectStore.getBuild('build-123');
    expect(first).not.toBeNull();

    first!.projectName = 'Mutated';
    first!.logs.push({ id: 'x', level: 'info', message: 'mutated', timestamp: new Date().toISOString() });

    const second = inMemoryProjectStore.getBuild('build-123');
    expect(second?.projectName).toBe('Demo');
    expect(second?.logs.some((log): boolean => log.id === 'x')).toBe(false);
  });

  it('notifies subscribers and supports unsubscribe', async (): Promise<void> => {
    const { inMemoryProjectStore } = await import('@/lib/store/in-memory-project-store');

    inMemoryProjectStore.createBuild({
      projectName: 'Demo',
      repositoryUrl: 'https://github.com/acme/demo',
      branch: 'main'
    });

    const events: BuildEvent[] = [];
    const unsubscribe = inMemoryProjectStore.subscribe('build-123', (event): void => {
      events.push(event);
    });

    await vi.advanceTimersByTimeAsync(1100);
    expect(events.length).toBeGreaterThan(0);

    const before = events.length;
    unsubscribe();

    await vi.advanceTimersByTimeAsync(6000);
    expect(events.length).toBe(before);
  });

  it('advances lifecycle to success', async (): Promise<void> => {
    const { inMemoryProjectStore } = await import('@/lib/store/in-memory-project-store');

    inMemoryProjectStore.createBuild({
      projectName: 'Demo',
      repositoryUrl: 'https://github.com/acme/demo',
      branch: 'main'
    });

    await vi.advanceTimersByTimeAsync(5600);

    const finalBuild = inMemoryProjectStore.getBuild('build-123');
    expect(finalBuild?.status).toBe('success');
    expect(finalBuild?.progress).toBe(100);
    expect(finalBuild?.logs.at(-1)?.message).toBe('Build complete');
  });

  it('returns null for unknown id', async (): Promise<void> => {
    const { inMemoryProjectStore } = await import('@/lib/store/in-memory-project-store');
    expect(inMemoryProjectStore.getBuild('missing')).toBeNull();
  });
});
