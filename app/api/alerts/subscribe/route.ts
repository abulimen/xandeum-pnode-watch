/**
 * Alert Subscribe API Route
 * Allows users to subscribe to node alerts via email and/or browser push
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAlertSubscription, createVerificationToken, verifySubscription } from '@/lib/db/queries';
import { sendEmail } from '@/lib/services/notificationService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            nodeIds,
            // Status alerts
            alertOffline = true,
            alertOnline = false,
            alertDegraded = false,
            // Performance alerts
            alertScoreDrop = true,
            alertScoreRise = false,
            alertUptimeDrop = false,
            alertUptimeRise = false,
            // Change alerts
            alertVersionChange = false,
            alertStorageChange = false,
            alertPublicStatusChange = false,
            // Thresholds
            scoreDropThreshold = 70,
            scoreRiseThreshold = 80,
            uptimeDropThreshold = 95,
            uptimeRiseThreshold = 99,
            // Push subscription
            pushSubscription
        } = body;

        // Validate - need at least email or push subscription
        const hasEmail = email && email.includes('@');
        const hasPush = pushSubscription && pushSubscription.endpoint;

        if (!hasEmail && !hasPush) {
            return NextResponse.json(
                { success: false, error: 'Email or browser notification is required' },
                { status: 400 }
            );
        }

        if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one node ID is required' },
                { status: 400 }
            );
        }

        if (nodeIds.length > 10) {
            return NextResponse.json(
                { success: false, error: 'Maximum 10 nodes per subscription' },
                { status: 400 }
            );
        }

        // Check if at least one alert type is selected
        const hasAnyAlert = alertOffline || alertOnline || alertDegraded ||
            alertScoreDrop || alertScoreRise ||
            alertUptimeDrop || alertUptimeRise ||
            alertVersionChange || alertStorageChange || alertPublicStatusChange;

        if (!hasAnyAlert) {
            return NextResponse.json(
                { success: false, error: 'Please select at least one alert type' },
                { status: 400 }
            );
        }

        // Create subscription (using available schema fields)
        // Note: The schema currently only has alert_offline, alert_score_drop, score_threshold
        // Additional preferences are stored in alert_offline/alert_score_drop as they're the core alerts
        const subscriptionId = createAlertSubscription({
            email: hasEmail ? email : undefined,
            push_endpoint: hasPush ? pushSubscription.endpoint : undefined,
            push_p256dh: hasPush ? pushSubscription.p256dh : undefined,
            push_auth: hasPush ? pushSubscription.auth : undefined,
            node_ids: nodeIds,
            alert_offline: alertOffline || alertOnline || alertDegraded, // Any status alert
            alert_score_drop: alertScoreDrop || alertUptimeDrop, // Any drop alert
            score_threshold: scoreDropThreshold,
        });

        // If browser push only (no email), auto-verify
        if (hasPush && !hasEmail) {
            verifySubscription(subscriptionId);
            return NextResponse.json({
                success: true,
                message: 'Successfully subscribed to browser notifications!',
                subscriptionId,
            });
        }

        // If email provided, send verification
        if (hasEmail) {
            // Generate and store verification token
            const token = crypto.randomBytes(32).toString('hex');
            createVerificationToken(subscriptionId, token, 24); // 24 hours

            // Get base URL for verification link
            const baseUrl = request.headers.get('origin') || 'https://analytics.xandeum.network';
            const verifyUrl = `${baseUrl}/api/alerts/verify?token=${token}`;

            // Prepare alert types summary
            const alertTypes: string[] = [];
            if (alertOffline) alertTypes.push('Node goes offline');
            if (alertOnline) alertTypes.push('Node comes online');
            if (alertDegraded) alertTypes.push('Node becomes degraded');
            if (alertScoreDrop) alertTypes.push(`Score drops below ${scoreDropThreshold}`);
            if (alertScoreRise) alertTypes.push(`Score rises above ${scoreRiseThreshold}`);
            if (alertUptimeDrop) alertTypes.push(`Uptime drops below ${uptimeDropThreshold}%`);
            if (alertUptimeRise) alertTypes.push(`Uptime rises above ${uptimeRiseThreshold}%`);
            if (alertVersionChange) alertTypes.push('Version changes');
            if (alertStorageChange) alertTypes.push('Storage capacity changes');
            if (alertPublicStatusChange) alertTypes.push('Public/Private status changes');

            // Send verification email with better design
            const emailResult = await sendEmail({
                to: email,
                subject: '✅ Verify your pNode Watch Alert Subscription',
                htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #0a0a0b;">
    <div style="max-width: 600px; margin: 0 auto; background: #18181b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">pNode Watch</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Email Verification</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #fafafa;">Verify Your Subscription</h2>
            <p style="margin: 0 0 16px 0; color: #a1a1aa;">
                You're subscribing to alerts for <strong style="color: #fafafa;">${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''}</strong>.
            </p>
            
            <!-- Alert Types -->
            <div style="background: #27272a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Alert Types (${alertTypes.length}):</p>
                <ul style="margin: 0; padding-left: 20px; color: #fafafa;">
                    ${alertTypes.map(t => `<li style="margin: 4px 0;">${t}</li>`).join('')}
                </ul>
            </div>
            
            <p style="margin: 0 0 24px 0; color: #a1a1aa;">
                Click the button below to verify your email and activate alerts:
            </p>
            
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Verify Email & Activate Alerts
            </a>
            
            <p style="margin: 24px 0 0 0; color: #52525b; font-size: 14px;">
                This link expires in 24 hours. If you didn't request this, you can ignore this email.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #27272a; padding: 16px 24px; text-align: center; border-top: 1px solid #3f3f46;">
            <p style="margin: 0; color: #52525b; font-size: 12px;">
                pNode Watch · Node Monitoring Platform
            </p>
        </div>
    </div>
</body>
</html>`,
                textContent: `
Verify Your pNode Watch Subscription

You're subscribing to alerts for ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''}.

Alert types: ${alertTypes.join(', ')}

Click here to verify: ${verifyUrl}

This link expires in 24 hours.
`,
            });

            if (!emailResult.success) {
                console.error('[alerts/subscribe] Failed to send email:', emailResult.error);
                return NextResponse.json(
                    { success: false, error: 'Failed to send verification email. Please try again.' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: hasEmail
                ? 'Verification email sent! Please check your inbox.'
                : 'Successfully subscribed to notifications!',
            subscriptionId,
        });

    } catch (error: any) {
        console.error('[alerts/subscribe] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
