/**
 * useNodeSort Hook - Sorting functionality for pNodes
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { PNode } from '@/types/pnode';
import { SortColumn, SortDirection } from '@/types/filters';

interface UseNodeSortResult {
    sortedNodes: PNode[];
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    setSort: (column: SortColumn) => void;
    setSortDirection: (direction: SortDirection) => void;
}

export function useNodeSort(nodes: PNode[]): UseNodeSortResult {
    const [sortColumn, setSortColumn] = useState<SortColumn>('uptime');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const setSort = useCallback((column: SortColumn) => {
        if (column === sortColumn) {
            // Toggle direction if clicking the same column
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // Default to descending for new column
            setSortColumn(column);
            setSortDirection('desc');
        }
    }, [sortColumn]);

    const sortedNodes = useMemo(() => {
        const sorted = [...nodes].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'id':
                    comparison = a.id.localeCompare(b.id);
                    break;
                case 'status':
                    const statusOrder = { online: 0, degraded: 1, offline: 2 };
                    comparison = statusOrder[a.status] - statusOrder[b.status];
                    break;
                case 'uptime':
                    comparison = a.uptime - b.uptime;
                    break;
                case 'stakingScore':
                    // Sort by credits first, fallback to stakingScore for backward compat
                    comparison = (a.credits ?? a.stakingScore ?? 0) - (b.credits ?? b.stakingScore ?? 0);
                    break;
                case 'responseTime':
                    // 'responseTime' column is actually 'Online For' (uptime duration)
                    comparison = (a.uptimeSeconds || 0) - (b.uptimeSeconds || 0);
                    break;
                case 'storage':
                    comparison = a.storage.total - b.storage.total;
                    break;
                case 'lastSeen':
                    comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [nodes, sortColumn, sortDirection]);

    return {
        sortedNodes,
        sortColumn,
        sortDirection,
        setSort,
        setSortDirection,
    };
}
