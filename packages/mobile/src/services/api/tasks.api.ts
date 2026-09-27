import { API_ROUTES, type CatalogueResponse } from '@padosipro/shared';
import type { IHttpClient } from '@/types';

export function createTasksApi(http: IHttpClient) {
  return {
    getCatalogue: () => http.request<CatalogueResponse>(API_ROUTES.TASKS.CATALOGUE),
  };
}

export type TasksApi = ReturnType<typeof createTasksApi>;
