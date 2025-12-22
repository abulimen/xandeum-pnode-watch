/**
 * useAutoSnapshot - Hook that checks for stale snapshots on page load
 * Triggers a snapshot automatically if the cron hasn't run in over an hour
 */

'use client';

import { useEffect, useState, useRef } from 'react';

interface AutoSnapshotStatus {
    isStale: boolean;
    lastSnapshotAgeMinutes: number | null;
    wasTriggered: boolean;
    isChecking: boolean;
    error?: string;
}

export function useAutoSnapshot() {
    const [status, setStatus] = useState<AutoSnapshotStatus>({
        isStale: false,
        lastSnapshotAgeMinutes: null,
        wasTriggered: false,
        isChecking: false,
    });
    const hasChecked = useRef(false);

    useEffect(() => {
        // Only run once per page load
        if (hasChecked.current) return;
        hasChecked.current = true;

        async function checkSnapshot() {
            setStatus(prev => ({ ...prev, isChecking: true }));

            try {
                // First check status
                const statusRes = await fetch('/api/auto-snapshot');
                const statusData = await statusRes.json();

                if (statusData.success && statusData.data.isStale) {
                    // Snapshot is stale, trigger a new one
                    console.log('[useAutoSnapshot] Snapshot is stale, triggering new one...');

                    const triggerRes = await fetch('/api/auto-snapshot', { method: 'POST' });
                    const triggerData = await triggerRes.json();

                    setStatus({
                        isStale: true,
                        lastSnapshotAgeMinutes: statusData.data.lastSnapshotAgeMinutes,
                        wasTriggered: triggerData.data?.snapshotTriggered || false,
                        isChecking: false,
                        error: triggerData.data?.error,
                    });

                    if (triggerData.data?.snapshotTriggered) {
                        console.log('[useAutoSnapshot] Snapshot triggered successfully');
                    }
                } else {
                    // Snapshot is fresh
                    setStatus({
                        isStale: false,
                        lastSnapshotAgeMinutes: statusData.data?.lastSnapshotAgeMinutes || null,
                        wasTriggered: false,
                        isChecking: false,
                    });
                }
            } catch (error) {
                console.error('[useAutoSnapshot] Error:', error);
                setStatus(prev => ({
                    ...prev,
                    isChecking: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                }));
            }
        }

        // Small delay to not block initial render
        const timer = setTimeout(checkSnapshot, 2000);
        return () => clearTimeout(timer);
    }, []);

    return status;
}
