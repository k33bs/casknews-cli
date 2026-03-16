import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { sanitize } from '../src/lib/api.ts';

// Save and restore global fetch
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('request error handling', () => {
  test('surfaces JSON error message from API', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await expect(fetchNewCasks()).rejects.toThrow('Rate limit exceeded');
  });

  test('surfaces plain text error from API', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Service Unavailable', { status: 503 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await expect(fetchNewCasks()).rejects.toThrow('Service Unavailable');
  });

  test('falls back to status code on empty body', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('', { status: 500 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await expect(fetchNewCasks()).rejects.toThrow('API error 500');
  });

  test('sanitizes error messages from API', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ error: '\x1b[31mevil\x1b[0m' }), { status: 400 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await expect(fetchNewCasks()).rejects.toThrow('evil');
  });

  test('handles HTML 404 pages with friendly message', async () => {
    const html = '<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>';
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(html, { status: 404 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await expect(fetchNewCasks()).rejects.toThrow('API endpoint not found');
  });

  test('does not dump raw HTML into error message', async () => {
    const html = '<html><body>Server Error</body></html>';
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(html, { status: 500 }))
    ) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    try {
      await fetchNewCasks();
    } catch (err: any) {
      expect(err.message).not.toContain('<html>');
      expect(err.message).toContain('API error 500');
    }
  });
});

describe('request URL construction', () => {
  test('fetchNewCasks builds correct query string', async () => {
    let capturedUrl = '';
    globalThis.fetch = mock((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }) as any;

    const { fetchNewCasks } = await import('../src/lib/api.ts');
    await fetchNewCasks({ limit: 5, days: 14, category: 'Developer Tools' });
    expect(capturedUrl).toContain('/api/cli/new?');
    expect(capturedUrl).toContain('limit=5');
    expect(capturedUrl).toContain('days=14');
    expect(capturedUrl).toContain('category=Developer+Tools');
  });

  test('fetchSearchCasks encodes query', async () => {
    let capturedUrl = '';
    globalThis.fetch = mock((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }) as any;

    const { fetchSearchCasks } = await import('../src/lib/api.ts');
    await fetchSearchCasks('foo bar', 10);
    expect(capturedUrl).toContain('q=foo+bar');
    expect(capturedUrl).toContain('limit=10');
  });

  test('fetchCaskDetail encodes token', async () => {
    let capturedUrl = '';
    globalThis.fetch = mock((url: string) => {
      capturedUrl = url;
      return Promise.resolve(new Response(JSON.stringify({ cask: {}, review: null, github: null }), { status: 200 }));
    }) as any;

    const { fetchCaskDetail } = await import('../src/lib/api.ts');
    await fetchCaskDetail('some@token');
    expect(capturedUrl).toContain('/api/cli/cask/some%40token');
  });
});
