/**
 * useHistoricalData - Hook for fetching historical network data
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface HistoricalSnapshot {
    id: number;
    timestamp: string;
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    degradedNodes: number;
    totalStorage: number;
    usedStorage: number;
    avgUptime: number;
    avgStakingScore: number;
    onlinePercentage: string;
    storageUtilization: string;
}

export interface HistoricalTrends {
    nodeCountChange: number;
    onlineChange: number;
    uptimeChange: number;
    stakingScoreChange: number;
    storageChange: number;
}

export interface HistoricalDataResponse {
    success: boolean;
    data: {
        snapshots: HistoricalSnapshot[];
        latest: {
            totalNodes: number;
            onlineNodes: number;
            avgUptime: number;
            avgStakingScore: number;
            timestamp: string;
        } | null;
        trends: HistoricalTrends | null;
        range: string;
        count: number;
    };
}

async function fetchHistoricalData(range: string): Promise<HistoricalDataResponse> {
    const response = await fetch(`/api/history/snapshots?range=${range}`);
    if (!response.ok) {
        throw new Error('Failed to fetch historical data');
    }
    return response.json();
}

export function useHistoricalData(range: '24h' | '7d' | '30d' = '7d') {
    const query = useQuery({
        queryKey: ['historicalData', range],
        queryFn: () => fetchHistoricalData(range),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });

    return {
        snapshots: query.data?.data?.snapshots || [],
        latest: query.data?.data?.latest || null,
        trends: query.data?.data?.trends || null,
        count: query.data?.data?.count || 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// Helper to format trend for display
export function formatTrend(value: number, suffix: string = ''): { text: string; isPositive: boolean } {
    const isPositive = value >= 0;
    const sign = isPositive ? '+' : '';
    const formatted = typeof value === 'number' ? value.toFixed(1) : '0';
    return {
        text: `${sign}${formatted}${suffix}`,
        isPositive,
    };
}
