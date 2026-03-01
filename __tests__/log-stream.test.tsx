import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LogStream } from '@/components/project-launcher/log-stream';

describe('LogStream', (): void => {
  it('renders all logs with uppercase levels and messages', (): void => {
    const html = renderToStaticMarkup(
      <LogStream
        logs={[
          { id: '1', level: 'info', message: 'Queued', timestamp: '2025-01-01T00:00:00.000Z' },
          { id: '2', level: 'warn', message: 'Slow install', timestamp: '2025-01-01T00:01:00.000Z' },
          { id: '3', level: 'error', message: 'Build failed', timestamp: '2025-01-01T00:02:00.000Z' }
        ]}
      />
    );

    expect(html).toContain('INFO');
    expect(html).toContain('WARN');
    expect(html).toContain('ERROR');
    expect(html).toContain('Queued');
    expect(html).toContain('Slow install');
    expect(html).toContain('Build failed');
  });

  it('applies level-specific tone classes', (): void => {
    const html = renderToStaticMarkup(
      <LogStream
        logs={[
          { id: '1', level: 'info', message: 'i', timestamp: '2025-01-01T00:00:00.000Z' },
          { id: '2', level: 'warn', message: 'w', timestamp: '2025-01-01T00:00:00.000Z' },
          { id: '3', level: 'error', message: 'e', timestamp: '2025-01-01T00:00:00.000Z' }
        ]}
      />
    );

    expect(html).toContain('text-cyan-300');
    expect(html).toContain('text-amber-300');
    expect(html).toContain('text-rose-300');
  });

  it('renders empty container when logs list is empty', (): void => {
    const html = renderToStaticMarkup(<LogStream logs={[]} />);
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('<article');
  });
});
