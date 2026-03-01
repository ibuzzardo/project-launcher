import { describe, expect, it } from 'vitest';

import { createErrorResponse } from '@/lib/server/error-response';

describe('createErrorResponse', (): void => {
  it('returns structured error response with details', async (): Promise<void> => {
    const response = createErrorResponse(400, 'VALIDATION_ERROR', 'Invalid payload', ['field required']);
    const body = (await response.json()) as { error: { code: string; message: string; details?: string[] } };

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payload',
        details: ['field required']
      }
    });
  });

  it('omits details when not provided', async (): Promise<void> => {
    const response = createErrorResponse(404, 'NOT_FOUND', 'Build not found');
    const body = (await response.json()) as { error: { code: string; message: string; details?: string[] } };

    expect(response.status).toBe(404);
    expect(body.error.details).toBeUndefined();
  });
});
