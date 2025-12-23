/**
 * User Alerts API
 * Fetch and manage alerts for a user by email or subscription ID
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getUserAlertsByEmail,
    getUnreadAlertCountByEmail,
    markAlertRead,
    markAllAlertsRead,
    deleteUserAlert,
    getSubscriptionByEmail
} from '@/lib/db/queries';

// GET: Fetch alerts for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Verify email has a verified subscription
        const subscription = await getSubscriptionByEmail(email);
        if (!subscription || !subscription.verified) {
            return NextResponse.json(
                { error: 'No verified subscription found for this email' },
                { status: 404 }
            );
        }

        const alerts = await getUserAlertsByEmail(email, limit);
        const unreadCount = await getUnreadAlertCountByEmail(email);

        return NextResponse.json({
            alerts,
            unreadCount,
            total: alerts.length
        });
    } catch (error) {
        console.error('[alerts/list] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

// POST: Manage alerts (mark read, delete)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, alertId, email, subscriptionId } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'markRead':
                if (!alertId) {
                    return NextResponse.json(
                        { error: 'Alert ID is required' },
                        { status: 400 }
                    );
                }
                await markAlertRead(alertId);
                return NextResponse.json({ success: true });

            case 'markAllRead':
                if (!subscriptionId) {
                    return NextResponse.json(
                        { error: 'Subscription ID is required' },
                        { status: 400 }
                    );
                }
                await markAllAlertsRead(subscriptionId);
                return NextResponse.json({ success: true });

            case 'delete':
                if (!alertId) {
                    return NextResponse.json(
                        { error: 'Alert ID is required' },
                        { status: 400 }
                    );
                }
                await deleteUserAlert(alertId);
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[alerts/list] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
