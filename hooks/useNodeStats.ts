/**
 * useNodeStats Hook - Fetch detailed stats for a specific node
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// Actual API response structure (flat, not nested)
export interface NodeStats {
    cpu_percent: number;
    ram_used: number;
    ram_total: number;
    uptime: number;
    packets_received: number;
    packets_sent: number;
    active_streams: number;
    file_size: number;
    total_bytes: number;
    total_pages: number;
    last_updated: number;
    current_index: number;
}

async function fetchNodeStats(ipAddress: string, rpcPort?: number): Promise<NodeStats | null> {
    try {
        const response = await fetch('/api/node-stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ipAddress, rpcPort }),
        });

        if (!response.ok) {
            console.warn(`[useNodeStats] Failed to fetch stats for ${ipAddress}`);
            return null;
        }

        const result = await response.json();

        if (!result.success) {
            console.warn(`[useNodeStats] Error: ${result.error}`);
            return null;
        }

        return result.data;
    } catch (error) {
        console.warn(`[useNodeStats] Error fetching stats:`, error);
        return null;
    }
}

export function useNodeStats(ipAddress: string | undefined, rpcPort?: number) {
    const query = useQuery({
        queryKey: ['node-stats', ipAddress],
        queryFn: () => fetchNodeStats(ipAddress!, rpcPort),
        enabled: !!ipAddress,
        staleTime: 60 * 1000, // 1 minute - don't refetch too often
        refetchInterval: false, // Don't auto-refetch - user can refresh manually
        retry: false, // Don't retry on failure - node might be unreachable
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
