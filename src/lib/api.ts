import { getApiToken } from './config.ts';
import { MOCK_ENABLED, getMockNewCasks, getMockTrendingCasks, getMockSearchCasks, getMockCaskDetail } from './mock.ts';
import type {
  Cask,
  CaskDetail,
  TrendingCask,
  AuthStartResponse,
  AuthPollResponse,
  SyncResponse,
} from '../types.ts';

const BASE_URL = process.env.CASKNEWS_API_URL ?? 'https://cask.news';
const REQUEST_TIMEOUT_MS = 15_000;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const token = getApiToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `API error ${res.status}`;
    try {
      const json = JSON.parse(body);
      if (json.error) message = String(json.error);
    } catch {
      // Ignore HTML responses (404 pages etc.) — keep the generic status message
      if (body && !body.trimStart().startsWith('<')) message = body;
    }
    if (res.status === 404) {
      message = 'API endpoint not found — the cask.news API may not be deployed yet.';
    }
    throw new Error(sanitize(message));
  }

  try {
    return await res.json() as T;
  } catch {
    throw new Error('Unexpected response from API (not JSON)');
  }
}

/** Strip ANSI/OSC escape sequences, CR, and ASCII control chars from untrusted text */
export function sanitize(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b[\[\(][0-9;?]*[A-Za-z]|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b[^[\](][A-Za-z]?|[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\r]/g, '');
}

export async function fetchNewCasks(options: { limit?: number; days?: number; category?: string } = {}): Promise<Cask[]> {
  if (MOCK_ENABLED) return getMockNewCasks(options);
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.days) params.set('days', String(options.days));
  if (options.category) params.set('category', options.category);
  const qs = params.toString();
  return request<Cask[]>(`/api/cli/new${qs ? `?${qs}` : ''}`);
}

export async function fetchTrendingCasks(limit?: number): Promise<TrendingCask[]> {
  if (MOCK_ENABLED) return getMockTrendingCasks(limit);
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return request<TrendingCask[]>(`/api/cli/trending${qs ? `?${qs}` : ''}`);
}

export async function fetchSearchCasks(query: string, limit?: number): Promise<Cask[]> {
  if (MOCK_ENABLED) return getMockSearchCasks(query, limit);
  const params = new URLSearchParams({ q: query });
  if (limit) params.set('limit', String(limit));
  return request<Cask[]>(`/api/cli/search?${params}`);
}

export async function fetchCaskDetail(token: string): Promise<CaskDetail> {
  if (MOCK_ENABLED) {
    const detail = getMockCaskDetail(token);
    if (!detail) throw new Error(`Cask '${token}' not found`);
    return detail;
  }
  return request<CaskDetail>(`/api/cli/cask/${encodeURIComponent(token)}`);
}

export async function authStart(): Promise<AuthStartResponse> {
  return request<AuthStartResponse>('/api/cli/auth/start', { method: 'POST' });
}

export async function authPoll(deviceCode: string): Promise<AuthPollResponse> {
  return request<AuthPollResponse>('/api/cli/auth/poll', {
    method: 'POST',
    body: JSON.stringify({ deviceCode }),
  });
}

export async function syncCasks(tokens: string[], title?: string): Promise<SyncResponse> {
  return request<SyncResponse>('/api/cli/sync', {
    method: 'POST',
    body: JSON.stringify({ tokens, title }),
  });
}
