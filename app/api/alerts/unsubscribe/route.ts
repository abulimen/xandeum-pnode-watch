/**
 * Alert Unsubscribe API Route
 * Allows users to unsubscribe from node alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscription } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId } = body;

        if (!subscriptionId || typeof subscriptionId !== 'number') {
            return NextResponse.json(
                { success: false, error: 'Subscription ID is required' },
                { status: 400 }
            );
        }

        deleteSubscription(subscriptionId);

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from alerts',
        });

    } catch (error: any) {
        console.error('[alerts/unsubscribe] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}

// Also handle GET for unsubscribe links in emails
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'Subscription ID required' },
            { status: 400 }
        );
    }

    const subscriptionId = parseInt(id, 10);
    if (isNaN(subscriptionId)) {
        return NextResponse.json(
            { success: false, error: 'Invalid subscription ID' },
            { status: 400 }
        );
    }

    try {
        deleteSubscription(subscriptionId);

        return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unsubscribed</title>
    <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f4f4f5; }
        .card { background: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #3b82f6; margin: 0 0 16px; }
        p { color: #6b7280; margin: 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>👋 Unsubscribed</h1>
        <p>You've been unsubscribed from these alerts.</p>
        <p style="margin-top: 16px; font-size: 14px;">You can always resubscribe from the dashboard.</p>
    </div>
</body>
</html>`,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
