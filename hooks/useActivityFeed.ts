/**
 * useActivityFeed - Hook for managing the real-time activity feed
 * Detects network changes and generates events
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PNode } from '@/types/pnode';
import {
    ActivityEvent,
    NetworkSnapshot,
    createSnapshot,
    detectChanges,
    loadStoredEvents,
    saveStoredEvents,
    loadStoredSnapshot,
    saveSnapshot,
} from '@/lib/services/activityService';

const MAX_EVENTS = 50;

export function useActivityFeed(nodes: PNode[], isLoading: boolean) {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const previousSnapshotRef = useRef<NetworkSnapshot | null>(null);
    const lastNodeCountRef = useRef<number>(0);

    // Load stored events on mount
    useEffect(() => {
        const storedEvents = loadStoredEvents();
        const storedSnapshot = loadStoredSnapshot();

        if (storedEvents.length > 0) {
            setEvents(storedEvents);
        }

        if (storedSnapshot) {
            previousSnapshotRef.current = storedSnapshot;
        }

        setIsInitialized(true);
    }, []);

    // Detect changes when nodes update
    useEffect(() => {
        if (isLoading || !isInitialized || nodes.length === 0) return;

        // Skip if node count hasn't changed significantly (avoid noise during initial load)
        if (lastNodeCountRef.current === 0) {
            lastNodeCountRef.current = nodes.length;
            // First load - just create snapshot without generating events
            const snapshot = createSnapshot(nodes);
            previousSnapshotRef.current = snapshot;
            saveSnapshot(snapshot);
            return;
        }

        const currentSnapshot = createSnapshot(nodes);

        // Only detect changes if we have a previous snapshot
        if (previousSnapshotRef.current) {
            const newEvents = detectChanges(
                previousSnapshotRef.current,
                currentSnapshot,
                nodes
            );

            if (newEvents.length > 0) {
                setEvents(prev => {
                    const updated = [...newEvents, ...prev].slice(0, MAX_EVENTS);
                    saveStoredEvents(updated);
                    return updated;
                });
            }
        }

        // Update references
        previousSnapshotRef.current = currentSnapshot;
        lastNodeCountRef.current = nodes.length;
        saveSnapshot(currentSnapshot);
    }, [nodes, isLoading, isInitialized]);

    // Clear all events
    const clearEvents = useCallback(() => {
        setEvents([]);
        saveStoredEvents([]);
    }, []);

    // Add a manual event (for testing or custom events)
    const addEvent = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
        const newEvent: ActivityEvent = {
            ...event,
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            timestamp: new Date(),
        };

        setEvents(prev => {
            const updated = [newEvent, ...prev].slice(0, MAX_EVENTS);
            saveStoredEvents(updated);
            return updated;
        });
    }, []);

    return {
        events,
        clearEvents,
        addEvent,
        isInitialized,
        eventCount: events.length,
    };
}
