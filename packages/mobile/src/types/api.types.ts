import type { ErrorCode } from '@padosipro/shared';

/** Codes produced on the device, in addition to the server's ErrorCode values. */
export type ClientErrorCode = 'NETWORK_ERROR' | 'TIMEOUT' | 'UNEXPECTED_RESPONSE';

export type AppErrorCode = ErrorCode | ClientErrorCode;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Skip the Authorization header (auth endpoints). */
  anonymous?: boolean;
}

export interface IHttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}
