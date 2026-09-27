import { API_ROUTES, type MeResponse, type MyTasksResponse, type ProfileInput } from '@padosipro/shared';
import type { IHttpClient } from '@/types';

export function createMeApi(http: IHttpClient) {
  return {
    getMe: () => http.request<MeResponse>(API_ROUTES.ME.ROOT),
    saveProfile: (body: ProfileInput) => http.request<MeResponse>(API_ROUTES.ME.PROFILE, { method: 'PUT', body }),
    getMyTasks: () => http.request<MyTasksResponse>(API_ROUTES.ME.TASKS),
    saveMyTasks: (taskIds: string[]) =>
      http.request<MyTasksResponse>(API_ROUTES.ME.TASKS, { method: 'PUT', body: { taskIds } }),
  };
}

export type MeApi = ReturnType<typeof createMeApi>;
