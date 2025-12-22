/**
 * Next.js Instrumentation
 * This file is automatically loaded by Next.js when the server starts.
 * Used to initialize background tasks like the cron scheduler.
 * 
 * Note: This only runs on the server side.
 */

export async function register() {
    // Only run on the server, not during build
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[instrumentation] Initializing server-side features...');

        // Start the cron scheduler
        const { startScheduler } = await import('@/lib/scheduler');
        startScheduler();

        console.log('[instrumentation] Server initialization complete');
    }
}
