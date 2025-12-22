/**
 * Auto-Snapshot Service
 * Checks if a snapshot is stale (>1 hour old) and triggers one automatically
 * This acts as a fallback in case the external cron fails
 */

import { getLatestSnapshot } from '@/lib/db/queries';

// Configuration
const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const CHECK_COOLDOWN_MS = 5 * 60 * 1000; // Don't trigger more than once per 5 minutes

// In-memory flag to prevent multiple simultaneous triggers
let lastCheckTime = 0;
let isSnapshotInProgress = false;

/**
 * Check if a snapshot is needed and trigger one if so
 * Returns true if a snapshot was triggered
 */
export async function checkAndTriggerSnapshot(baseUrl?: string): Promise<{
    needed: boolean;
    triggered: boolean;
    lastSnapshotAge?: number;
    error?: string;
}> {
    const now = Date.now();

    // Cooldown check - don't spam this
    if (now - lastCheckTime < CHECK_COOLDOWN_MS) {
        return { needed: false, triggered: false };
    }
    lastCheckTime = now;

    // Already in progress check
    if (isSnapshotInProgress) {
        return { needed: false, triggered: false };
    }

    try {
        // Get last snapshot
        const latestSnapshot = getLatestSnapshot();

        if (!latestSnapshot) {
            // No snapshots exist - definitely need one
            console.log('[auto-snapshot] No snapshots exist, triggering first snapshot');
            return await triggerSnapshot(baseUrl);
        }

        // Check age
        const snapshotTime = new Date(latestSnapshot.timestamp).getTime();
        const ageMs = now - snapshotTime;

        if (ageMs > STALE_THRESHOLD_MS) {
            const ageMinutes = Math.round(ageMs / 60000);
            console.log(`[auto-snapshot] Last snapshot is ${ageMinutes} minutes old, triggering new snapshot`);
            return await triggerSnapshot(baseUrl, ageMs);
        }

        // Snapshot is fresh enough
        return {
            needed: false,
            triggered: false,
            lastSnapshotAge: ageMs,
        };

    } catch (error) {
        console.error('[auto-snapshot] Error checking snapshot age:', error);
        return {
            needed: false,
            triggered: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Trigger a snapshot via internal API call
 */
async function triggerSnapshot(baseUrl?: string, ageMs?: number): Promise<{
    needed: boolean;
    triggered: boolean;
    lastSnapshotAge?: number;
    error?: string;
}> {
    isSnapshotInProgress = true;

    try {
        // Try to call the internal snapshot endpoint
        // In server context, we need an absolute URL
        const url = baseUrl
            ? `${baseUrl}/api/cron/snapshot`
            : '/api/cron/snapshot';

        console.log(`[auto-snapshot] Triggering snapshot at: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mark as internal auto-trigger
                'X-Auto-Snapshot': 'true',
            },
        });

        const result = await response.json();

        if (result.success) {
            console.log(`[auto-snapshot] Successfully created snapshot #${result.data?.snapshotId}`);
            return {
                needed: true,
                triggered: true,
                lastSnapshotAge: ageMs,
            };
        } else {
            console.error('[auto-snapshot] Failed to create snapshot:', result.error);
            return {
                needed: true,
                triggered: false,
                lastSnapshotAge: ageMs,
                error: result.error,
            };
        }

    } catch (error) {
        console.error('[auto-snapshot] Error triggering snapshot:', error);
        return {
            needed: true,
            triggered: false,
            lastSnapshotAge: ageMs,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    } finally {
        isSnapshotInProgress = false;
    }
}

/**
 * Get snapshot status info
 */
export function getSnapshotStatus(): {
    lastSnapshotAge: number | null;
    isStale: boolean;
    isCheckInProgress: boolean;
} {
    try {
        const latestSnapshot = getLatestSnapshot();

        if (!latestSnapshot) {
            return {
                lastSnapshotAge: null,
                isStale: true,
                isCheckInProgress: isSnapshotInProgress,
            };
        }

        const snapshotTime = new Date(latestSnapshot.timestamp).getTime();
        const ageMs = Date.now() - snapshotTime;

        return {
            lastSnapshotAge: ageMs,
            isStale: ageMs > STALE_THRESHOLD_MS,
            isCheckInProgress: isSnapshotInProgress,
        };
    } catch {
        return {
            lastSnapshotAge: null,
            isStale: true,
            isCheckInProgress: isSnapshotInProgress,
        };
    }
}

export const autoSnapshotService = {
    checkAndTriggerSnapshot,
    getSnapshotStatus,
    STALE_THRESHOLD_MS,
};
