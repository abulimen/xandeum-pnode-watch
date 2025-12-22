/**
 * Badge Service
 * Calculates and returns achievement badges for nodes
 */

import { PNode } from '@/types/pnode';

export type BadgeType =
    | 'elite-uptime'
    | 'speed-demon'
    | 'storage-champion'
    | 'hot-streak'
    | 'credits-leader';

export interface Badge {
    id: BadgeType;
    name: string;
    description: string;
    color: string;
    earned: boolean;
    progress?: number; // 0-100 percentage towards earning
}

const BADGE_DEFINITIONS: Record<BadgeType, {
    name: string;
    description: string;
    color: string;
    check: (node: PNode, allNodes: PNode[]) => { earned: boolean; progress: number };
}> = {
    'elite-uptime': {
        name: 'Elite Uptime',
        description: '99.5%+ uptime',
        color: '#FFD700', // Gold
        check: (node) => {
            const threshold = 99.5;
            const progress = Math.min(100, (node.uptime / threshold) * 100);
            return { earned: node.uptime >= threshold, progress };
        }
    },
    'speed-demon': {
        name: 'Speed Demon',
        description: 'Response time < 50ms',
        color: '#00BFFF', // Deep Sky Blue
        check: (node) => {
            const threshold = 50;
            // Lower is better, so invert the progress
            const progress = node.responseTime <= threshold
                ? 100
                : Math.max(0, 100 - ((node.responseTime - threshold) / threshold) * 100);
            return { earned: node.responseTime < threshold, progress };
        }
    },
    'storage-champion': {
        name: 'Storage Champion',
        description: '> 1TB committed',
        color: '#9B59B6', // Purple
        check: (node) => {
            const threshold = 1e12; // 1TB in bytes
            const progress = Math.min(100, (node.storage.total / threshold) * 100);
            return { earned: node.storage.total >= threshold, progress };
        }
    },
    'hot-streak': {
        name: 'Hot Streak',
        description: '7+ days online',
        color: '#FF6B35', // Orange-Red
        check: (node) => {
            const threshold = 7 * 24 * 60 * 60; // 7 days in seconds
            const progress = Math.min(100, ((node.uptimeSeconds || 0) / threshold) * 100);
            return { earned: (node.uptimeSeconds || 0) >= threshold, progress };
        }
    },
    'credits-leader': {
        name: 'Credits Leader',
        description: 'Top 10% in credits',
        color: '#00D9A5', // Emerald
        check: (node, allNodes) => {
            const credits = node.credits ?? 0;
            const allCredits = allNodes
                .map(n => n.credits ?? 0)
                .filter(c => c > 0)
                .sort((a, b) => b - a);

            if (allCredits.length === 0) return { earned: false, progress: 0 };

            const top10Threshold = allCredits[Math.floor(allCredits.length * 0.1)] || 0;
            const rank = allCredits.findIndex(c => c <= credits);
            const percentile = ((allCredits.length - rank) / allCredits.length) * 100;

            return {
                earned: credits >= top10Threshold && credits > 0,
                progress: Math.min(100, (credits / (top10Threshold || 1)) * 100)
            };
        }
    }
};

/**
 * Calculate all badges for a node
 */
export function calculateBadges(node: PNode, allNodes: PNode[]): Badge[] {
    return Object.entries(BADGE_DEFINITIONS).map(([id, def]) => {
        const result = def.check(node, allNodes);
        return {
            id: id as BadgeType,
            name: def.name,
            description: def.description,
            color: def.color,
            earned: result.earned,
            progress: result.progress
        };
    });
}

/**
 * Get earned badges only
 */
export function getEarnedBadges(node: PNode, allNodes: PNode[]): Badge[] {
    return calculateBadges(node, allNodes).filter(b => b.earned);
}

/**
 * Count total badges earned
 */
export function countBadges(node: PNode, allNodes: PNode[]): number {
    return getEarnedBadges(node, allNodes).length;
}

export const badgeService = {
    calculateBadges,
    getEarnedBadges,
    countBadges,
    BADGE_DEFINITIONS
};
