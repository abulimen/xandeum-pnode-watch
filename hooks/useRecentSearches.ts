/**
 * Hook for managing recent node searches in localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'xandeum-recent-searches';
const MAX_RECENT = 5;

export interface RecentSearch {
    nodeId: string;
    nodeDisplayName: string;
    location?: string;
    timestamp: number;
}

export function useRecentSearches() {
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as RecentSearch[];
                setRecentSearches(parsed);
            }
        } catch (error) {
            console.error('Failed to load recent searches:', error);
        }
    }, []);

    // Add a new search to history
    const addRecent = useCallback((nodeId: string, nodeDisplayName: string, location?: string) => {
        setRecentSearches(prev => {
            // Remove if already exists
            const filtered = prev.filter(s => s.nodeId !== nodeId);

            // Add to front
            const updated: RecentSearch[] = [
                { nodeId, nodeDisplayName, location, timestamp: Date.now() },
                ...filtered
            ].slice(0, MAX_RECENT);

            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save recent searches:', error);
            }

            return updated;
        });
    }, []);

    // Clear all recent searches
    const clearRecent = useCallback(() => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear recent searches:', error);
        }
    }, []);

    // Remove a specific search
    const removeRecent = useCallback((nodeId: string) => {
        setRecentSearches(prev => {
            const updated = prev.filter(s => s.nodeId !== nodeId);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to update recent searches:', error);
            }
            return updated;
        });
    }, []);

    return {
        recentSearches,
        addRecent,
        clearRecent,
        removeRecent,
    };
}
