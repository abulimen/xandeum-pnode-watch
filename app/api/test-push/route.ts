/**
 * Test Push Notification API
 * Used to verify push notifications are working
 * 
 * GET /api/test-push - Show configuration status
 * GET /api/test-push?type=vapid - Check VAPID configuration
 * GET /api/test-push?email=your@email.com - Send test email notification
 * POST /api/test-push - Send test push notification (requires subscription in body)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendPushNotification, getVapidPublicKey } from '@/lib/services/notificationService';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type');
    const email = searchParams.get('email');

    // Check VAPID configuration
    if (testType === 'vapid') {
        const publicKey = getVapidPublicKey();
        return NextResponse.json({
            success: true,
            vapidConfigured: !!publicKey,
            publicKeyPrefix: publicKey ? publicKey.substring(0, 20) + '...' : null,
            brevoConfigured: !!process.env.BREVO_API_KEY,
        });
    }

    // Send test email
    if (email) {
        if (!process.env.BREVO_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'BREVO_API_KEY not configured. Add it to .env.local',
            }, { status: 500 });
        }

        try {
            const result = await sendEmail({
                to: email,
                subject: '🔔 Test Notification - pNode Watch',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #7c3aed;">Push Notification Test</h1>
                        <p>This is a test email from pNode Watch.</p>
                        <p>If you received this, email notifications are working correctly! ✅</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
                    </div>
                `,
                textContent: 'Test notification from pNode Watch. If you received this, notifications are working!',
            });

            return NextResponse.json({
                success: result.success,
                message: result.success ? `Test email sent to ${email}!` : result.error,
            });
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }, { status: 500 });
        }
    }

    // Default: show status and instructions
    return NextResponse.json({
        success: true,
        message: 'Push Notification Test API',
        endpoints: {
            'GET /api/test-push?type=vapid': 'Check VAPID and Brevo configuration',
            'GET /api/test-push?email=your@email.com': 'Send test email notification',
            'POST /api/test-push': 'Send test browser push (requires push subscription in body)',
        },
        configuration: {
            vapidConfigured: !!getVapidPublicKey(),
            brevoConfigured: !!process.env.BREVO_API_KEY,
        },
        instructions: 'To test browser push: 1) Go to the app, 2) Subscribe to a node, 3) POST to this endpoint with your push subscription',
    });
}

/**
 * POST endpoint to test browser push notifications directly
 * Body should contain: { endpoint, p256dh, auth }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpoint, p256dh, auth } = body;

        if (!endpoint || !p256dh || !auth) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: endpoint, p256dh, auth',
                hint: 'You can get these by subscribing to a node and checking the browser console',
            }, { status: 400 });
        }

        if (!getVapidPublicKey()) {
            return NextResponse.json({
                success: false,
                error: 'VAPID keys not configured. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env.local',
            }, { status: 500 });
        }

        const result = await sendPushNotification({
            endpoint,
            p256dh,
            auth,
            title: '🎉 Test Notification',
            body: 'Push notifications are working! You will receive alerts when your watched nodes go offline.',
            url: '/',
            nodeId: 'test-node',
            alertType: 'test',
        });

        return NextResponse.json({
            success: result.success,
            message: result.success ? 'Test push notification sent! Check your browser.' : result.error,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
