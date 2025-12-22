/**
 * Benchmark Service - Compare individual nodes against the network
 */

import { PNode } from '@/types/pnode';

export interface BenchmarkResult {
    node: PNode;
    networkAverages: {
        uptime: number;
        storage: number;
        credits: number;
        healthScore: number;
    };
    percentiles: {
        uptime: number;
        storage: number;
        credits: number;
        healthScore: number;
    };
    rankings: {
        uptime: { rank: number; total: number };
        storage: { rank: number; total: number };
        credits: { rank: number; total: number };
        healthScore: { rank: number; total: number };
        overall: { rank: number; total: number };
    };
    strengths: string[];
    weaknesses: string[];
    overallRating: 'excellent' | 'good' | 'average' | 'below_average';
    improvements: {
        metric: string;
        current: number;
        target: number;
        benefit: string;
        unit: string;
    }[];
}

/**
 * Calculate percentile position (what % of nodes are BELOW this value)
 */
function calculatePercentile(value: number, distribution: number[], higherIsBetter: boolean = true): number {
    if (distribution.length === 0) return 50;

    const sorted = [...distribution].sort((a, b) => a - b);
    let belowCount = 0;

    for (const v of sorted) {
        if (value > v) belowCount++;
        else break;
    }

    const percentile = (belowCount / sorted.length) * 100;
    return Math.round(higherIsBetter ? percentile : 100 - percentile);
}

/**
 * Calculate rank position (1 = best)
 * Properly handles ties - nodes with equal values get the same rank
 */
function calculateRank(value: number, allValues: number[], higherIsBetter: boolean = true): number {
    // Sort in descending order for "higher is better", ascending for "lower is better"
    const sorted = [...allValues].sort((a, b) => higherIsBetter ? b - a : a - b);

    // Find how many nodes have a BETTER value than this node
    let betterCount = 0;
    for (const v of sorted) {
        if (higherIsBetter ? v > value : v < value) {
            betterCount++;
        } else {
            break;
        }
    }

    // Rank is 1 + number of nodes that are better
    return betterCount + 1;
}

/**
 * Benchmark a node against the network
 */
export function benchmarkNode(node: PNode, allNodes: PNode[]): BenchmarkResult {
    // Get distributions (exclude the target node)
    const otherNodes = allNodes.filter(n => n.id !== node.id);

    const uptimes = otherNodes.map(n => n.uptime);
    const storages = otherNodes.map(n => n.storage?.total || 0);
    const credits = otherNodes.map(n => n.credits || 0);
    const healthScores = otherNodes.map(n => n.healthScore);

    // Calculate averages
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const networkAverages = {
        uptime: avg(uptimes),
        storage: avg(storages),
        credits: avg(credits),
        healthScore: avg(healthScores),
    };

    // Calculate percentiles
    const percentiles = {
        uptime: calculatePercentile(node.uptime, uptimes, true),
        storage: calculatePercentile(node.storage?.total || 0, storages, true),
        credits: calculatePercentile(node.credits || 0, credits, true),
        healthScore: calculatePercentile(node.healthScore, healthScores, true),
    };

    // Calculate rankings (position among all nodes)
    const allUptimes = allNodes.map(n => n.uptime);
    const allStorages = allNodes.map(n => n.storage?.total || 0);
    const allCredits = allNodes.map(n => n.credits || 0);
    const allHealthScores = allNodes.map(n => n.healthScore);
    const totalNodes = allNodes.length;

    const nodeCredits = node.credits || 0;

    const rankings = {
        uptime: { rank: calculateRank(node.uptime, allUptimes, true), total: totalNodes },
        storage: { rank: calculateRank(node.storage?.total || 0, allStorages, true), total: totalNodes },
        credits: { rank: calculateRank(nodeCredits, allCredits, true), total: totalNodes },
        healthScore: { rank: calculateRank(node.healthScore, allHealthScores, true), total: totalNodes },
        // Overall rank is based on CREDITS (primary metric)
        overall: { rank: calculateRank(nodeCredits, allCredits, true), total: totalNodes },
    };

    // Identify strengths and weaknesses
    // IMPORTANT: Use ABSOLUTE values, not just percentiles
    // 100% uptime is NEVER a weakness, even if many nodes have it
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Uptime - check ABSOLUTE value first, then compare to average
    if (node.uptime >= 99) {
        strengths.push(`Excellent uptime (${node.uptime.toFixed(1)}%)`);
    } else if (node.uptime >= 95) {
        strengths.push(`Good uptime (${node.uptime.toFixed(1)}%)`);
    } else if (node.uptime >= 90 && node.uptime >= networkAverages.uptime) {
        // 90%+ uptime that's above average is still good, just not elite
        strengths.push(`Above average uptime (${node.uptime.toFixed(1)}%)`);
    } else if (node.uptime < 80) {
        weaknesses.push(`Low uptime (${node.uptime.toFixed(1)}% - below 80% threshold)`);
    } else if (node.uptime < networkAverages.uptime) {
        // Only flag as weakness if actually BELOW network average
        weaknesses.push(`Uptime below network average (${node.uptime.toFixed(1)}% vs ${networkAverages.uptime.toFixed(1)}% avg)`);
    }

    // Storage - check percentile rank
    if (percentiles.storage >= 75) {
        strengths.push(`High storage capacity (top ${100 - percentiles.storage}%)`);
    } else if (percentiles.storage < 25) {
        weaknesses.push(`Low storage capacity (bottom ${percentiles.storage}%)`);
    }

    // Credits - check percentile rank
    if (percentiles.credits >= 75) {
        strengths.push(`High credits (top ${100 - percentiles.credits}%)`);
    } else if (percentiles.credits < 40) {
        weaknesses.push(`Low credits (bottom ${percentiles.credits}%)`);
    }



    if (node.versionType === 'mainnet') {
        strengths.push('Running Mainnet version');
    } else if (node.versionType === 'trynet' || node.versionType === 'devnet') {
        weaknesses.push(`Running ${node.versionType} version (30% score penalty)`);
    }

    // Calculate overall rating based on credits percentile (primary metric)
    let overallRating: 'excellent' | 'good' | 'average' | 'below_average';
    if (percentiles.credits >= 75) overallRating = 'excellent';
    else if (percentiles.credits >= 50) overallRating = 'good';
    else if (percentiles.credits >= 25) overallRating = 'average';
    else overallRating = 'below_average';

    // Generate improvement suggestions
    const improvements: BenchmarkResult['improvements'] = [];

    // Only suggest uptime improvement if ACTUALLY below elite threshold
    if (node.uptime < 99.5) {
        improvements.push({
            metric: 'Uptime',
            current: node.uptime,
            target: 99.5,
            benefit: 'Achieve Elite badge',
            unit: '%',
        });
    }

    if (percentiles.storage < 75) {
        const top25Storage = [...storages].sort((a, b) => b - a)[Math.floor(storages.length * 0.25)] || 0;
        if (top25Storage > (node.storage?.total || 0)) {
            improvements.push({
                metric: 'Storage',
                current: (node.storage?.total || 0) / 1e12,
                target: top25Storage / 1e12,
                benefit: 'Reach top 25%',
                unit: 'TB',
            });
        }
    }



    return {
        node,
        networkAverages,
        percentiles,
        rankings,
        strengths,
        weaknesses,
        overallRating,
        improvements,
    };
}

/**
 * Find similar nodes based on ranking position (nearby in credits ranking)
 * Shows nodes ranked just above (better alternatives) and just below (current node beats these)
 * 
 * @param node - The node to find similar nodes for
 * @param allNodes - All nodes in the network
 * @param aboveCount - Number of better-ranked nodes to show (default: 2)
 * @param belowCount - Number of lower-ranked nodes to show (default: 1)
 */
function findSimilarNodes(
    node: PNode,
    allNodes: PNode[],
    aboveCount: number = 2,
    belowCount: number = 1
): PNode[] {
    // Sort all nodes by credits (highest first)
    const sortedByCredits = [...allNodes]
        .filter(n => n.id !== node.id) // Exclude the current node
        .sort((a, b) => (b.credits || 0) - (a.credits || 0));

    const nodeCredits = node.credits || 0;

    // Find nodes ranked above (have MORE credits than this node)
    const nodesAbove = sortedByCredits
        .filter(n => (n.credits || 0) > nodeCredits)
        .slice(-aboveCount) // Get the closest ones (last 2 in the "above" list)
        .reverse(); // Closest first

    // Find nodes ranked below (have LESS credits than this node)
    const nodesBelow = sortedByCredits
        .filter(n => (n.credits || 0) < nodeCredits)
        .slice(0, belowCount); // Get the closest ones (first in the "below" list)

    // Combine: above nodes first, then below
    return [...nodesAbove, ...nodesBelow];
}

export const benchmarkService = {
    benchmarkNode,
    calculatePercentile,
    findSimilarNodes,
    compareNodes,
};

/**
 * Compare two nodes against each other
 */
export function compareNodes(nodeA: PNode, nodeB: PNode, allNodes: PNode[]) {
    const resultA = benchmarkNode(nodeA, allNodes);
    const resultB = benchmarkNode(nodeB, allNodes);

    const metrics = [
        { key: 'uptime', label: 'Uptime', unit: '%', higherIsBetter: true },
        { key: 'storage', label: 'Storage', unit: 'TB', higherIsBetter: true, format: (v: number) => (v / 1e12).toFixed(1) },
        { key: 'credits', label: 'Credits', unit: '', higherIsBetter: true, format: (v: number) => v.toLocaleString() },
        { key: 'healthScore', label: 'Health Score', unit: '', higherIsBetter: true, format: (v: number) => v.toFixed(0) },
    ];

    const comparison = metrics.map(m => {
        const valA = m.key === 'storage' ? (nodeA.storage?.total || 0) : (nodeA[m.key as keyof PNode] as number || 0);
        const valB = m.key === 'storage' ? (nodeB.storage?.total || 0) : (nodeB[m.key as keyof PNode] as number || 0);

        let winner: 'A' | 'B' | 'tie' = 'tie';
        if (valA !== valB) {
            if (m.higherIsBetter) winner = valA > valB ? 'A' : 'B';
            else winner = valA < valB ? 'A' : 'B';
        }

        const diff = Math.abs(valA - valB);
        const diffPct = Math.max(valA, valB) > 0 ? (diff / Math.max(valA, valB)) * 100 : 0;

        return {
            metric: m.label,
            valA,
            valB,
            winner,
            diff,
            diffPct,
            unit: m.unit,
            format: m.format
        };
    });

    return {
        nodeA: resultA,
        nodeB: resultB,
        comparison
    };
}
