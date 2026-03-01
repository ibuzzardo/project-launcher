import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('projects API integration', (): void => {
  beforeEach((): void => {
    vi.useFakeTimers();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('it-build-1');
  });

  afterEach((): void => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.resetModules();
  });

  it('creates, fetches, and streams a build lifecycle', async (): Promise<void> => {
    const { POST } = await import('@/app/api/projects/route');
    const byId = await import('@/app/api/projects/[id]/route');
    const events = await import('@/app/api/projects/[id]/events/route');

    const createRes = await POST(
      new Request('http://localhost/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: 'Integration Build',
          repositoryUrl: 'https://github.com/acme/integration-build',
          branch: 'main'
        })
      })
    );

    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { data: { id: string } };
    expect(created.data.id).toBe('it-build-1');

    const getRes = await byId.GET(new Request('http://localhost/api/projects/it-build-1'), {
      params: { id: 'it-build-1' }
    });
    expect(getRes.status).toBe(200);

    const controller = new AbortController();
    const eventRes = await events.GET(new Request('http://localhost/api/projects/it-build-1/events', { signal: controller.signal }), {
      params: { id: 'it-build-1' }
    });

    expect(eventRes.status).toBe(200);
    expect(eventRes.headers.get('Content-Type')).toContain('text/event-stream');

    const reader = eventRes.body?.getReader();
    expect(reader).toBeDefined();

    const first = await reader!.read();
    const firstText = new TextDecoder().decode(first.value);
    expect(firstText).toContain('event: build.updated');
    expect(firstText).toContain('it-build-1');

    await vi.advanceTimersByTimeAsync(1000);
    const next = await reader!.read();
    const nextText = new TextDecoder().decode(next.value);
    expect(nextText).toContain('event: build.updated');

    controller.abort();
  });

  it('rejects invalid id path in GET /api/projects/[id]', async (): Promise<void> => {
    const byId = await import('@/app/api/projects/[id]/route');
    const response = await byId.GET(new Request('http://localhost/api/projects/x!'), { params: { id: 'x!' } });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
