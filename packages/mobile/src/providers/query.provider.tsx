import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';
import { ApiError } from '@/services/api';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        // Retry only failures that might go away on their own.
        retry: (failureCount, error) => failureCount < 2 && error instanceof ApiError && error.isNetworkError,
      },
      mutations: { retry: false },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
