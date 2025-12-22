/**
 * Additional statistics type definitions
 * Note: NetworkStats is defined in pnode.ts
 */

export interface TimeSeriesDataPoint {
    timestamp: string;
    value: number;
}

export interface HistoricalSnapshot {
    timestamp: string;
    stats: import('./pnode').NetworkStats;
    nodeStatuses: Record<string, 'online' | 'offline' | 'degraded'>;
}
