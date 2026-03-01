import { beforeEach, describe, expect, it, vi } from 'vitest';

const createBuildMock = vi.fn();
const getBuildMock = vi.fn();
const subscribeMock = vi.fn();
const createSseStreamMock = vi.fn();

vi.mock('@/lib/store/in-memory-project-store', () => ({
  inMemoryProjectStore: {
    createBuild: createBuildMock,
    getBuild: getBuildMock,
    subscribe: subscribeMock
  }
}));

vi.mock('@/lib/server/sse', async () => {
  const actual = await vi.importActual<typeof import('@/lib/server/sse')>('@/lib/server/sse');
  return {
    ...actual,
    createSseStream: createSseStreamMock,
    SSE_HEADERS: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  };
});

const buildFixture = {
  id: 'abc-123',
  projectName: 'Demo',
  repositoryUrl: 'https://github.com/acme/demo',
  branch: 'main',
  status: 'queued' as const,
  progress: 3,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  logs: []
};

describe('projects route handlers (unit)', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
  });

  it('POST /api/projects returns validation error for invalid json', async (): Promise<void> => {
    const { POST } = await import('@/app/api/projects/route');
    const response = await POST(new Request('http://localhost/api/projects', { method: 'POST', body: '{' }));
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('INVALID_JSON');
  });

  it('POST /api/projects creates build on success', async (): Promise<void> => {
    createBuildMock.mockReturnValue(buildFixture);
    const { POST } = await import('@/app/api/projects/route');

    const response = await POST(
      new Request('http://localhost/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: 'Demo',
          repositoryUrl: 'https://github.com/acme/demo',
          branch: 'main'
        })
      })
    );

    const body = (await response.json()) as { data: { id: string } };
    expect(response.status).toBe(201);
    expect(body.data.id).toBe('abc-123');
    expect(createBuildMock).toHaveBeenCalledTimes(1);
  });

  it('GET /api/projects/[id] returns 404 when not found', async (): Promise<void> => {
    getBuildMock.mockReturnValue(null);
    const { GET } = await import('@/app/api/projects/[id]/route');

    const response = await GET(new Request('http://localhost/api/projects/abc-123'), { params: { id: 'abc-123' } });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/projects/[id]/events returns SSE response for existing build', async (): Promise<void> => {
    getBuildMock.mockReturnValue(buildFixture);
    subscribeMock.mockReturnValue((): void => {});
    createSseStreamMock.mockReturnValue(new ReadableStream<Uint8Array>());

    const { GET } = await import('@/app/api/projects/[id]/events/route');

    const response = await GET(new Request('http://localhost/api/projects/abc-123/events'), {
      params: { id: 'abc-123' }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    expect(createSseStreamMock).toHaveBeenCalledTimes(1);
  });
});
