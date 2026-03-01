import { afterEach, describe, expect, it, vi } from 'vitest';

describe('createProject client', (): void => {
  afterEach((): void => {
    vi.restoreAllMocks();
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('posts payload and returns parsed project response', async (): Promise<void> => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: '1',
            projectName: 'Demo',
            repositoryUrl: 'https://github.com/acme/demo',
            branch: 'main',
            status: 'queued',
            progress: 3,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            logs: []
          }
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { createProject } = await import('@/lib/api/client');
    const result = await createProject({
      projectName: 'Demo',
      repositoryUrl: 'https://github.com/acme/demo',
      branch: 'main'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.data.id).toBe('1');
  });

  it('throws API error message when server responds non-OK', async (): Promise<void> => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request' } }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const { createProject } = await import('@/lib/api/client');

    await expect(
      createProject({
        projectName: 'Demo',
        repositoryUrl: 'https://github.com/acme/demo',
        branch: 'main'
      })
    ).rejects.toThrow('Invalid request');
  });

  it('rethrows Error instances and normalizes unknown errors', async (): Promise<void> => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const { createProject } = await import('@/lib/api/client');

    await expect(
      createProject({
        projectName: 'Demo',
        repositoryUrl: 'https://github.com/acme/demo',
        branch: 'main'
      })
    ).rejects.toThrow('network down');

    vi.resetModules();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('boom'));

    const reloaded = await import('@/lib/api/client');
    await expect(
      reloaded.createProject({
        projectName: 'Demo',
        repositoryUrl: 'https://github.com/acme/demo',
        branch: 'main'
      })
    ).rejects.toThrow('Unknown client error');
  });
});
