/**
 * Credits History Service
 * Stores and retrieves historical credits data
 * Uses localStorage for client-side persistence
 */

import { PNode } from '@/types/pnode';

export interface CreditsSnapshot {
    timestamp: number;
    nodeId: string;
    publicKey: string;
    credits: number;
}

export interface NetworkCreditsSnapshot {
    timestamp: number;
    totalCredits: number;
    avgCredits: number;
    nodeCount: number;
    top10AvgCredits: number;
}

const STORAGE_KEY = 'credits_history';
const NETWORK_STORAGE_KEY = 'network_credits_history';
const MAX_HISTORY_DAYS = 30;
const MAX_ENTRIES_PER_NODE = 720; // 30 days at 1 hour intervals

/**
 * Store a credits snapshot for a node
 */
export function storeNodeCreditsSnapshot(node: PNode, credits: number): void {
    if (typeof window === 'undefined') return;

    const snapshot: CreditsSnapshot = {
        timestamp: Date.now(),
        nodeId: node.id,
        publicKey: node.publicKey,
        credits
    };

    const history = getNodeCreditsHistory(node.publicKey);
    history.push(snapshot);

    // Keep only last N entries
    while (history.length > MAX_ENTRIES_PER_NODE) {
        history.shift();
    }

    const allHistory = getAllNodeHistory();
    allHistory[node.publicKey] = history;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    } catch {
        // Storage full - clear old data
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Store network-wide credits snapshot
 */
export function storeNetworkCreditsSnapshot(
    creditsMap: Map<string, number>,
    nodes: PNode[]
): void {
    if (typeof window === 'undefined') return;

    const allCredits = Array.from(creditsMap.values()).filter(c => c > 0);
    if (allCredits.length === 0) return;

    allCredits.sort((a, b) => b - a);
    const top10Count = Math.ceil(allCredits.length * 0.1);
    const top10Avg = allCredits.slice(0, top10Count).reduce((a, b) => a + b, 0) / top10Count;

    const snapshot: NetworkCreditsSnapshot = {
        timestamp: Date.now(),
        totalCredits: allCredits.reduce((a, b) => a + b, 0),
        avgCredits: allCredits.reduce((a, b) => a + b, 0) / allCredits.length,
        nodeCount: allCredits.length,
        top10AvgCredits: top10Avg
    };

    const history = getNetworkCreditsHistory();

    // Only add if enough time has passed (at least 30 minutes)
    const lastEntry = history[history.length - 1];
    if (!lastEntry || (snapshot.timestamp - lastEntry.timestamp) > 30 * 60 * 1000) {
        history.push(snapshot);

        // Keep only last N days
        const cutoff = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
        const filtered = history.filter(s => s.timestamp > cutoff);

        try {
            localStorage.setItem(NETWORK_STORAGE_KEY, JSON.stringify(filtered));
        } catch {
            localStorage.removeItem(NETWORK_STORAGE_KEY);
        }
    }
}

/**
 * Get credits history for a specific node
 */
export function getNodeCreditsHistory(publicKey: string): CreditsSnapshot[] {
    if (typeof window === 'undefined') return [];

    const allHistory = getAllNodeHistory();
    return allHistory[publicKey] || [];
}

/**
 * Get network-wide credits history
 */
export function getNetworkCreditsHistory(): NetworkCreditsSnapshot[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Get all node history from storage
 */
function getAllNodeHistory(): Record<string, CreditsSnapshot[]> {
    if (typeof window === 'undefined') return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Calculate credits trend (positive = growing, negative = declining)
 */
export function calculateCreditsTrend(history: CreditsSnapshot[], hours: number = 24): {
    change: number;
    percentChange: number;
    trend: 'up' | 'down' | 'stable';
} {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const recentHistory = history.filter(s => s.timestamp > cutoff);

    if (recentHistory.length < 2) {
        return { change: 0, percentChange: 0, trend: 'stable' };
    }

    const oldest = recentHistory[0].credits;
    const newest = recentHistory[recentHistory.length - 1].credits;
    const change = newest - oldest;
    const percentChange = oldest > 0 ? ((newest - oldest) / oldest) * 100 : 0;

    return {
        change,
        percentChange,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
}

export const creditsHistoryService = {
    storeNodeCreditsSnapshot,
    storeNetworkCreditsSnapshot,
    getNodeCreditsHistory,
    getNetworkCreditsHistory,
    calculateCreditsTrend
};
