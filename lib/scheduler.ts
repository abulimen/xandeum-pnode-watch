/**
 * Cron Scheduler
 * Runs periodic tasks for the analytics platform
 * 
 * This module is imported by instrumentation.ts to start when the server starts.
 */

import cron from 'node-cron';

const SNAPSHOT_INTERVAL = process.env.SNAPSHOT_CRON_INTERVAL || '*/5 * * * *'; // Every 5 minutes by default
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || '';

let isSchedulerRunning = false;

/**
 * Start the cron scheduler
 * This is called once when the server starts
 */
export function startScheduler(): void {
    if (isSchedulerRunning) {
        console.log('[cron] Scheduler already running, skipping...');
        return;
    }

    // Validate cron expression
    if (!cron.validate(SNAPSHOT_INTERVAL)) {
        console.error(`[cron] Invalid cron expression: ${SNAPSHOT_INTERVAL}`);
        return;
    }

    console.log(`[cron] Starting scheduler with interval: ${SNAPSHOT_INTERVAL}`);

    // Schedule snapshot task
    cron.schedule(SNAPSHOT_INTERVAL, async () => {
        console.log(`[cron] Running snapshot task at ${new Date().toISOString()}`);

        try {
            const url = new URL('/api/cron/snapshot', BASE_URL);
            if (CRON_SECRET) {
                url.searchParams.set('key', CRON_SECRET);
            }

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                console.log(`[cron] Snapshot completed: ${result.data?.nodeCount || 0} nodes, ${result.data?.alertsSent || 0} alerts sent`);
            } else {
                console.error(`[cron] Snapshot failed: ${result.error}`);
            }
        } catch (error) {
            console.error('[cron] Error running snapshot:', error);
        }
    });

    isSchedulerRunning = true;
    console.log('[cron] Scheduler started successfully');
}

/**
 * Check if scheduler is running
 */
export function isRunning(): boolean {
    return isSchedulerRunning;
}
