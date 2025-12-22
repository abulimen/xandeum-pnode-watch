/**
 * useNetworkStats Hook - Computes network statistics from node data
 */

'use client';

import { useMemo } from 'react';
import { PNode, NetworkStats } from '@/types/pnode';
import { NodeIssue } from '@/types/issues';
import {
    calculateNetworkStats,
    calculateNetworkHealth,
    detectIssues
} from '@/lib/services/analyticsService';

interface UseNetworkStatsResult {
    stats: NetworkStats;
    healthScore: number;
    issues: NodeIssue[];
    issueCount: number;
    highSeverityCount: number;
}

export function useNetworkStats(nodes: PNode[]): UseNetworkStatsResult {
    const stats = useMemo(() => {
        const baseStats = calculateNetworkStats(nodes);

        // Calculate avgStakingScore from enriched nodes (nodes with stakingScore already set)
        const nodesWithStakingScore = nodes.filter(n => n.stakingScore !== undefined);
        if (nodesWithStakingScore.length > 0) {
            const avgStakingScore = nodesWithStakingScore.reduce(
                (sum, n) => sum + (n.stakingScore || 0), 0
            ) / nodesWithStakingScore.length;
            baseStats.avgStakingScore = Math.round(avgStakingScore * 10) / 10;
        }

        return baseStats;
    }, [nodes]);

    const healthScore = useMemo(() => calculateNetworkHealth(nodes), [nodes]);
    const issues = useMemo(() => detectIssues(nodes), [nodes]);

    const issueCount = issues.length;
    const highSeverityCount = issues.filter(i => i.severity === 'high').length;

    return {
        stats,
        healthScore,
        issues,
        issueCount,
        highSeverityCount,
    };
}

