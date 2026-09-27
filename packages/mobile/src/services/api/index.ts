import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants';
import { createAuthApi } from './auth.api';
import { HttpClient } from './http-client';
import { createMeApi } from './me.api';
import { sessionBridge } from './session-bridge';
import { createTasksApi } from './tasks.api';

const http = new HttpClient({
  baseUrl: API_BASE_URL,
  timeoutMs: REQUEST_TIMEOUT_MS,
  getToken: sessionBridge.getToken,
  onUnauthorized: sessionBridge.notifyUnauthorized,
});

export const authApi = createAuthApi(http);
export const meApi = createMeApi(http);
export const tasksApi = createTasksApi(http);

export { ApiError } from './api-error';
export { sessionBridge } from './session-bridge';
