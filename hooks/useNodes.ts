/**
 * useNodes Hook - Fetches and manages pNode data with React Query
 * Uses real pRPC data with automatic retry and user-friendly error messages
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { prpcService, NetworkError } from '@/lib/services/prpcService';
import { PNode } from '@/types/pnode';

const REFETCH_INTERVAL = 30000; // 30 seconds
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface UseNodesResult {
    nodes: PNode[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    errorMessage: string | null; // User-friendly error message
    refetch: () => void;
    lastUpdated: Date | null;
    isFetching: boolean;
    isStale: boolean;
    responseTime: number | null;
}

export function useNodes(): UseNodesResult {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        dataUpdatedAt,
        isFetching,
        isStale,
    } = useQuery({
        queryKey: ['pnodes'],
        queryFn: async () => {
            const response = await prpcService.fetchNodes();
            return response;
        },
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
        gcTime: STALE_TIME * 2,
        // Disable React Query retry - prpcService has its own retry logic
        retry: false,
    });

    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
    const nodes = data?.data?.nodes || [];
    const responseTime = data?.responseTime || null;

    // Extract user-friendly message from NetworkError, or use generic message
    const errorMessage = error
        ? (error instanceof NetworkError ? error.userMessage : 'Unable to fetch node data. Please try again later.')
        : null;

    return {
        nodes,
        isLoading,
        isError,
        error: error || null,
        errorMessage,
        refetch: () => refetch(),
        lastUpdated,
        isFetching,
        isStale,
        responseTime,
    };
}

/**
 * Prefetch nodes data (for SSR or preloading)
 */
export function usePrefetchNodes() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchQuery({
            queryKey: ['pnodes'],
            queryFn: () => prpcService.fetchNodes(),
        });
    };
}
