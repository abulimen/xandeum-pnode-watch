/**
 * Alert Verify API Route
 * Handles email verification for alert subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySubscription, getSubscriptionByToken, deleteVerificationToken } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return new NextResponse(
            generateErrorHTML('Verification token required'),
            { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
    }

    try {
        // Look up token in database
        const tokenData = getSubscriptionByToken(token);

        if (!tokenData) {
            return new NextResponse(
                generateErrorHTML('Invalid or expired verification link'),
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Verify the subscription
        verifySubscription(tokenData.id);

        // Delete the token after use
        deleteVerificationToken(token);

        // Return success page
        const baseUrl = request.headers.get('origin') || '';
        return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="3;url=${baseUrl}/">
    <title>Subscription Verified</title>
    <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
        .card { background: white; padding: 48px; border-radius: 16px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); max-width: 400px; }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { color: #059669; margin: 0 0 12px; font-size: 24px; }
        p { color: #6b7280; margin: 0; line-height: 1.6; }
        .redirect { margin-top: 24px; font-size: 14px; color: #9ca3af; }
        a { color: #4f46e5; text-decoration: none; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>Subscription Verified!</h1>
        <p>You'll now receive alerts when your watched nodes go offline or experience score drops.</p>
        <p class="redirect">Redirecting to dashboard... <a href="${baseUrl}/">Click here</a> if not redirected.</p>
    </div>
</body>
</html>`,
            { status: 200, headers: { 'Content-Type': 'text/html' } }
        );

    } catch (error: any) {
        console.error('[alerts/verify] Error:', error);
        return new NextResponse(
            generateErrorHTML('An error occurred during verification'),
            { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
    }
}

function generateErrorHTML(message: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verification Failed</title>
    <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
        .card { background: white; padding: 48px; border-radius: 16px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); max-width: 400px; }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { color: #dc2626; margin: 0 0 12px; font-size: 24px; }
        p { color: #6b7280; margin: 0; line-height: 1.6; }
        a { display: inline-block; margin-top: 24px; color: #4f46e5; text-decoration: none; padding: 12px 24px; border: 1px solid #4f46e5; border-radius: 8px; }
        a:hover { background: #4f46e5; color: white; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">❌</div>
        <h1>Verification Failed</h1>
        <p>${message}</p>
        <a href="/">Back to Dashboard</a>
    </div>
</body>
</html>`;
}
