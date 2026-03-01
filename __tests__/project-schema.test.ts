import { describe, expect, it } from 'vitest';

import { createProjectSchema, projectIdSchema } from '@/lib/validation/project-schemas';

describe('createProjectSchema', (): void => {
  it('accepts a valid payload', (): void => {
    const result = createProjectSchema.safeParse({
      projectName: 'Project Alpha',
      repositoryUrl: 'https://github.com/acme/project-alpha',
      branch: 'main'
    });

    expect(result.success).toBe(true);
  });

  it('fails on invalid payload with all relevant errors', (): void => {
    const result = createProjectSchema.safeParse({
      projectName: 'x',
      repositoryUrl: 'bad',
      branch: ''
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue): string => issue.message);
      expect(messages).toContain('projectName must be at least 2 characters');
      expect(messages).toContain('repositoryUrl must be a valid URL');
      expect(messages).toContain('branch is required');
    }
  });

  it('enforces max lengths', (): void => {
    const result = createProjectSchema.safeParse({
      projectName: 'p'.repeat(101),
      repositoryUrl: 'https://example.com/repo',
      branch: 'b'.repeat(101)
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue): string => issue.message);
      expect(messages).toContain('projectName is too long');
      expect(messages).toContain('branch is too long');
    }
  });
});

describe('projectIdSchema', (): void => {
  it('accepts valid project ids', (): void => {
    const result = projectIdSchema.safeParse({ id: 'abc-123-XYZ' });
    expect(result.success).toBe(true);
  });

  it('rejects too-short ids', (): void => {
    const result = projectIdSchema.safeParse({ id: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid characters', (): void => {
    const result = projectIdSchema.safeParse({ id: 'abc_123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('id contains invalid characters');
    }
  });
});
