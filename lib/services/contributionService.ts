/**
 * Network Contribution Score Service
 * Calculates overall network contribution based on multiple factors
 */

import { PNode } from '@/types/pnode';

export interface ContributionScore {
    total: number; // 0-100 overall score
    components: {
        uptime: number;
        credits: number;
        storage: number;
        longevity: number;
    };
    percentile: number; // 0-100
    tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
}

// Weight configuration for contribution calculation
const CONTRIBUTION_WEIGHTS = {
    uptime: 0.30,      // 30% - Reliability is key
    credits: 0.35,     // 35% - Credits are the primary metric
    storage: 0.20,     // 20% - Storage commitment
    longevity: 0.15,   // 15% - Long-term commitment bonus
};

/**
 * Calculate contribution score for a single node
 */
export function calculateContributionScore(
    node: PNode,
    allNodes: PNode[]
): ContributionScore {
    // Calculate component scores (each 0-100)

    // 1. Uptime score - already 0-100
    const uptimeScore = Math.min(100, node.uptime);

    // 2. Credits score - normalized against network
    const allCredits = allNodes.map(n => n.credits ?? 0).filter(c => c > 0);
    const maxCredits = Math.max(...allCredits, 1);
    const creditsScore = maxCredits > 0
        ? ((node.credits ?? 0) / maxCredits) * 100
        : 0;

    // 3. Storage score - normalized against network
    const allStorage = allNodes.map(n => n.storage?.total ?? 0).filter(s => s > 0);
    const maxStorage = Math.max(...allStorage, 1);
    const storageScore = maxStorage > 0
        ? ((node.storage?.total ?? 0) / maxStorage) * 100
        : 0;

    // 4. Longevity score - based on uptime seconds (max 30 days = 100%)
    const maxLongevity = 30 * 24 * 60 * 60; // 30 days in seconds
    const longevityScore = Math.min(100, ((node.uptimeSeconds ?? 0) / maxLongevity) * 100);

    // Calculate weighted total
    const total = (
        uptimeScore * CONTRIBUTION_WEIGHTS.uptime +
        creditsScore * CONTRIBUTION_WEIGHTS.credits +
        storageScore * CONTRIBUTION_WEIGHTS.storage +
        longevityScore * CONTRIBUTION_WEIGHTS.longevity
    );

    // Calculate percentile
    const allScores = allNodes.map(n =>
        calculateRawScore(n, maxCredits, maxStorage, maxLongevity)
    );
    allScores.sort((a, b) => a - b);
    const rank = allScores.filter(s => s < total).length;
    const percentile = (rank / allScores.length) * 100;

    // Determine tier
    const tier = getTier(percentile);

    return {
        total: Math.round(total * 10) / 10,
        components: {
            uptime: Math.round(uptimeScore * 10) / 10,
            credits: Math.round(creditsScore * 10) / 10,
            storage: Math.round(storageScore * 10) / 10,
            longevity: Math.round(longevityScore * 10) / 10,
        },
        percentile: Math.round(percentile),
        tier,
    };
}

function calculateRawScore(
    node: PNode,
    maxCredits: number,
    maxStorage: number,
    maxLongevity: number
): number {
    const uptimeScore = Math.min(100, node.uptime);
    const creditsScore = maxCredits > 0 ? ((node.credits ?? 0) / maxCredits) * 100 : 0;
    const storageScore = maxStorage > 0 ? ((node.storage?.total ?? 0) / maxStorage) * 100 : 0;
    const longevityScore = Math.min(100, ((node.uptimeSeconds ?? 0) / maxLongevity) * 100);

    return (
        uptimeScore * CONTRIBUTION_WEIGHTS.uptime +
        creditsScore * CONTRIBUTION_WEIGHTS.credits +
        storageScore * CONTRIBUTION_WEIGHTS.storage +
        longevityScore * CONTRIBUTION_WEIGHTS.longevity
    );
}

function getTier(percentile: number): ContributionScore['tier'] {
    if (percentile >= 95) return 'diamond';
    if (percentile >= 80) return 'platinum';
    if (percentile >= 60) return 'gold';
    if (percentile >= 40) return 'silver';
    return 'bronze';
}

/**
 * Get top contributors by contribution score
 */
export function getTopContributors(nodes: PNode[], count: number = 10): Array<{
    node: PNode;
    score: ContributionScore;
}> {
    const withScores = nodes.map(node => ({
        node,
        score: calculateContributionScore(node, nodes)
    }));

    return withScores
        .sort((a, b) => b.score.total - a.score.total)
        .slice(0, count);
}

/**
 * Get tier display info
 */
export const TIER_INFO: Record<ContributionScore['tier'], {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}> = {
    diamond: {
        label: 'Diamond',
        color: '#00D9FF',
        bgColor: 'bg-cyan-500/10',
        icon: '💎'
    },
    platinum: {
        label: 'Platinum',
        color: '#E5E4E2',
        bgColor: 'bg-slate-300/10',
        icon: '⚪'
    },
    gold: {
        label: 'Gold',
        color: '#FFD700',
        bgColor: 'bg-yellow-500/10',
        icon: '🥇'
    },
    silver: {
        label: 'Silver',
        color: '#C0C0C0',
        bgColor: 'bg-gray-400/10',
        icon: '🥈'
    },
    bronze: {
        label: 'Bronze',
        color: '#CD7F32',
        bgColor: 'bg-orange-600/10',
        icon: '🥉'
    }
};

export const contributionService = {
    calculateContributionScore,
    getTopContributors,
    TIER_INFO,
    CONTRIBUTION_WEIGHTS
};
