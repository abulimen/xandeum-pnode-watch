/**
 * useCredits Hook - Fetches official credits from Xandeum API
 * and enriches nodes with credits data
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PNode } from '@/types/pnode';

interface CreditsApiResponse {
    pods_credits: Array<{
        credits: number;
        pod_id: string;
    }>;
    status: string;
}

async function fetchCreditsFromAPI(): Promise<Map<string, number>> {
    // Use local proxy to bypass CORS
    const response = await fetch('/api/credits');

    if (!response.ok) {
        throw new Error('Failed to fetch credits');
    }

    const json: CreditsApiResponse = await response.json();

    if (json.status !== 'success' || !Array.isArray(json.pods_credits)) {
        throw new Error('Invalid credits response');
    }

    const creditsMap = new Map<string, number>();
    for (const item of json.pods_credits) {
        if (item.pod_id && typeof item.credits === 'number') {
            creditsMap.set(item.pod_id, item.credits);
        }
    }

    console.log(`[credits] Loaded ${creditsMap.size} credits from API`);
    return creditsMap;
}

interface UseCreditsResult {
    creditsMap: Map<string, number>;
    isLoading: boolean;
    error: Error | null;
    totalCredits: number;
    avgCredits: number;
    creditsThreshold: number;
}

export function useCredits(): UseCreditsResult {
    const { data: creditsMap, isLoading, error } = useQuery({
        queryKey: ['credits'],
        queryFn: fetchCreditsFromAPI,
        staleTime: 60000, // 1 minute
        refetchInterval: 120000, // 2 minutes
        refetchOnWindowFocus: false,
    });

    const stats = useMemo(() => {
        if (!creditsMap) {
            return { totalCredits: 0, avgCredits: 0, creditsThreshold: 0 };
        }

        const values = Array.from(creditsMap.values()).filter(v => v > 0);
        if (values.length === 0) {
            return { totalCredits: 0, avgCredits: 0, creditsThreshold: 0 };
        }

        values.sort((a, b) => a - b);
        const total = values.reduce((sum, v) => sum + v, 0);
        const avg = total / values.length;
        const p95Index = Math.floor(values.length * 0.95);
        const p95 = values[p95Index] || values[values.length - 1];
        const threshold = p95 * 0.8;

        return {
            totalCredits: total,
            avgCredits: Math.round(avg),
            creditsThreshold: Math.round(threshold),
        };
    }, [creditsMap]);

    return {
        creditsMap: creditsMap || new Map(),
        isLoading,
        error: error as Error | null,
        ...stats,
    };
}

/**
 * Enriches nodes with credits from the provided creditsMap
 */
export function enrichNodesWithCreditsData(
    nodes: PNode[],
    creditsMap: Map<string, number>
): PNode[] {
    return nodes.map(node => ({
        ...node,
        credits: creditsMap.get(node.publicKey) ?? 0,
    }));
}
