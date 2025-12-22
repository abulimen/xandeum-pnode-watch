/**
 * Auto-Snapshot Check API Route
 * Called by the frontend to check if a snapshot is needed and trigger one
 * This provides a fallback mechanism if the external cron fails
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAndTriggerSnapshot, getSnapshotStatus } from '@/lib/services/autoSnapshotService';

export async function GET(request: NextRequest) {
    try {
        // Get current status
        const status = getSnapshotStatus();

        return NextResponse.json({
            success: true,
            data: {
                lastSnapshotAgeMinutes: status.lastSnapshotAge
                    ? Math.round(status.lastSnapshotAge / 60000)
                    : null,
                isStale: status.isStale,
                isCheckInProgress: status.isCheckInProgress,
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get base URL for internal API calls
        const origin = request.headers.get('origin')
            || request.headers.get('referer')?.split('/').slice(0, 3).join('/')
            || process.env.NEXT_PUBLIC_APP_URL
            || 'http://localhost:3000';

        // Check and trigger if needed
        const result = await checkAndTriggerSnapshot(origin);

        return NextResponse.json({
            success: true,
            data: {
                snapshotNeeded: result.needed,
                snapshotTriggered: result.triggered,
                lastSnapshotAgeMinutes: result.lastSnapshotAge
                    ? Math.round(result.lastSnapshotAge / 60000)
                    : null,
                error: result.error,
            },
        });
    } catch (error) {
        console.error('[auto-snapshot] API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
