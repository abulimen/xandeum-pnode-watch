/**
 * Filter, sort, and UI state type definitions
 */

export type StatusFilter = 'all' | 'online' | 'offline' | 'degraded';

export type SortColumn =
    | 'id'
    | 'status'
    | 'uptime'
    | 'stakingScore'
    | 'responseTime'
    | 'storage'
    | 'lastSeen';

export type SortDirection = 'asc' | 'desc';

export type TimeRange = '24h' | '7d' | '30d';

export interface FilterState {
    searchQuery: string;
    statusFilter: StatusFilter;
    regionFilter: string[];
}

export interface SortState {
    column: SortColumn;
    direction: SortDirection;
}

export interface PaginationState {
    page: number;
    pageSize: number;
}
