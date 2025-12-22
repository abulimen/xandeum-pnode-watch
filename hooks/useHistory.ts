/**
 * useNetworkHistory Hook
 * Fetches historical network data for trend charts
 */

import { useQuery } from '@tanstack/react-query';

interface NetworkHistoryPoint {
    timestamp: string;
    totalNodes: number;
    onlineNodes: number;
    degradedNodes: number;
    offlineNodes: number;
    onlinePercent: number;
    totalStorageTB: number;
    usedStorageTB: number;
    storageUtilization: number;
    avgUptime: number;
    avgStakingScore: number;
}

interface NetworkHistorySummary {
    dataPoints: number;
    periodDays: number;
    firstSnapshot: string;
    lastSnapshot: string;
    avgOnlinePercent: number;
    avgStakingScore: number;
    minNodes: number;
    maxNodes: number;
}

interface NetworkHistoryResponse {
    success: boolean;
    data: NetworkHistoryPoint[];
    summary: NetworkHistorySummary | null;
    latest: {
        timestamp: string;
        totalNodes: number;
        onlineNodes: number;
        avgStakingScore: number;
    } | null;
}

export function useNetworkHistory(days: number = 7) {
    return useQuery<NetworkHistoryResponse>({
        queryKey: ['networkHistory', days],
        queryFn: async () => {
            const response = await fetch(`/api/history/network?days=${days}`);
            if (!response.ok) {
                throw new Error('Failed to fetch network history');
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
}

/**
 * useNodeHistory Hook
 * Fetches historical data for a specific node
 */

interface NodeHistoryPoint {
    timestamp: string;
    status: string;
    uptimePercent: number;
    storageUsagePercent: number;
    stakingScore: number;
    version: string | null;
}

interface NodeHistorySummary {
    nodeId: string;
    dataPoints: number;
    periodDays: number;
    firstSnapshot: string;
    lastSnapshot: string;
    onlinePercent: number;
    avgStakingScore: number;
    minStakingScore: number;
    maxStakingScore: number;
    avgUptime: number;
    latestVersion: string | null;
}

interface NodeHistoryResponse {
    success: boolean;
    data: NodeHistoryPoint[];
    summary: NodeHistorySummary | null;
    message?: string;
}

export function useNodeHistory(nodeId: string | null, days: number = 7) {
    return useQuery<NodeHistoryResponse>({
        queryKey: ['nodeHistory', nodeId, days],
        queryFn: async () => {
            if (!nodeId) {
                return { success: true, data: [], summary: null };
            }
            const response = await fetch(`/api/history/node/${encodeURIComponent(nodeId)}?days=${days}`);
            if (!response.ok) {
                throw new Error('Failed to fetch node history');
            }
            return response.json();
        },
        enabled: !!nodeId,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
    });
}
