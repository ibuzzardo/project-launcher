import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', (): void => {
  it('merges class names and resolves Tailwind conflicts', (): void => {
    const result = cn('p-2 text-sm', 'p-4', 'text-lg');
    expect(result).toContain('p-4');
    expect(result).toContain('text-lg');
    expect(result).not.toContain('p-2');
    expect(result).not.toContain('text-sm');
  });

  it('handles conditional and falsy values', (): void => {
    const result = cn('base', false && 'hidden', undefined, null, ['flex', 'items-center']);
    expect(result).toBe('base flex items-center');
  });
});
