import { ERROR_CODES } from '@padosipro/shared';
import { COPY } from '@/constants';
import type { IHttpClient, RequestOptions } from '@/types';
import { ApiError, isApiErrorBody } from './api-error';

export interface HttpClientConfig {
  baseUrl: string;
  timeoutMs: number;
  getToken: () => string | null;
  /** Called when an authenticated request is rejected, so the app can sign out. */
  onUnauthorized: () => void;
}

/** Thin fetch wrapper: JSON in and out, timeouts, bearer token, and one error type. */
export class HttpClient implements IHttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async request<T>(path: string, { method = 'GET', body, anonymous = false }: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const token = anonymous ? null : this.config.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      throw new ApiError(timedOut ? 'TIMEOUT' : 'NETWORK_ERROR', timedOut ? COPY.TIMEOUT_ERROR : COPY.NETWORK_ERROR);
    } finally {
      clearTimeout(timer);
    }

    const payload: unknown = await response.json().catch(() => null);

    if (response.ok) return payload as T;

    const error = isApiErrorBody(payload)
      ? ApiError.fromBody(response.status, payload)
      : new ApiError('UNEXPECTED_RESPONSE', COPY.GENERIC_ERROR, response.status);

    if (token && error.code === ERROR_CODES.UNAUTHORIZED) this.config.onUnauthorized();
    throw error;
  }
}
