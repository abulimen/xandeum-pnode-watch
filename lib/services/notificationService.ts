/**
 * Notification Service
 * Handles email (Brevo) and browser push notifications
 */

import webpush from 'web-push';

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ALERT_FROM_EMAIL = process.env.ALERT_FROM_EMAIL || 'xandeum@xpansive.com';
const ALERT_FROM_NAME = process.env.ALERT_FROM_NAME || 'pNode Watch';

// VAPID keys for web push
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:xandeum@xpansive.com';

// Configure web-push if keys are available
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface EmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
}

/**
 * Send email via Brevo API
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!BREVO_API_KEY) {
        console.error('[notifications] BREVO_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: ALERT_FROM_NAME,
                    email: ALERT_FROM_EMAIL,
                },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.htmlContent,
                textContent: options.textContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[notifications] Brevo API error:', error);
            return { success: false, error: `Email failed: ${response.status}` };
        }

        console.log(`[notifications] Email sent to ${options.to}`);
        return { success: true };

    } catch (error: any) {
        console.error('[notifications] Email error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send browser push notification
 */
export async function sendPushNotification(params: {
    endpoint: string;
    p256dh: string;
    auth: string;
    title: string;
    body: string;
    url?: string;
    nodeId?: string;
    alertType?: string;
}): Promise<{ success: boolean; error?: string }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return { success: false, error: 'VAPID keys not configured' };
    }

    const subscription = {
        endpoint: params.endpoint,
        keys: {
            p256dh: params.p256dh,
            auth: params.auth,
        },
    };

    const payload = JSON.stringify({
        title: params.title,
        body: params.body,
        url: params.url,
        nodeId: params.nodeId,
        alertType: params.alertType,
        tag: `alert-${params.nodeId || 'general'}`,
    });

    try {
        await webpush.sendNotification(subscription, payload);
        console.log(`[notifications] Push sent to ${params.endpoint.substring(0, 50)}...`);
        return { success: true };
    } catch (error: any) {
        console.error('[notifications] Push error:', error);

        // Handle expired subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
            return { success: false, error: 'subscription_expired' };
        }

        return { success: false, error: error.message };
    }
}

/**
 * Generate alert email HTML - Professional design matching website theme
 */
export function generateAlertEmail(params: {
    nodeId: string;
    nodeName?: string;
    alertType: 'offline' | 'score_drop' | 'version_change' | 'uptime_drop';
    details: string;
    dashboardUrl?: string;
    nodeIp?: string;
    nodeLocation?: string;
}): { subject: string; html: string; text: string } {
    const { nodeId, nodeName, alertType, details, nodeIp, nodeLocation } = params;

    // Always generate a node URL - use provided or fallback to default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://analytics.xandeum.network';
    const nodeUrl = params.dashboardUrl || `${baseUrl}/nodes/${nodeId}`;

    const alertTypeLabels = {
        offline: '🔴 Node Offline Alert',
        score_drop: '📉 Staking Score Drop',
        version_change: '🔄 Version Updated',
        uptime_drop: '⚠️ Uptime Drop Alert',
    };

    const alertBgColors = {
        offline: '#fef2f2',
        score_drop: '#fffbeb',
        version_change: '#eff6ff',
        uptime_drop: '#fff7ed',
    };

    const alertColors = {
        offline: '#ef4444',
        score_drop: '#f59e0b',
        version_change: '#3b82f6',
        uptime_drop: '#f97316',
    };

    const subject = `${alertTypeLabels[alertType]} - ${nodeName || nodeId}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0b;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">pNode Watch</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">pNode Network Monitoring</p>
                        </td>
                    </tr>
                    
                    <!-- Alert Banner -->
                    <tr>
                        <td style="background-color: ${alertColors[alertType]}; padding: 16px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">${alertTypeLabels[alertType]}</h2>
                                        <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0 0; font-size: 13px;">Detected at ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="background-color: #18181b; padding: 32px;">
                            <!-- Node Info Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #27272a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Node Details</p>
                                        
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                                                    <span style="color: #71717a; font-size: 13px;">Node ID</span>
                                                    <p style="color: #fafafa; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; margin: 4px 0 0 0; word-break: break-all;">${nodeId}</p>
                                                </td>
                                            </tr>
                                            ${nodeIp ? `
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                                                    <span style="color: #71717a; font-size: 13px;">IP Address</span>
                                                    <p style="color: #fafafa; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; margin: 4px 0 0 0;">${nodeIp}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            ${nodeLocation ? `
                                            <tr>
                                                <td style="padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                                                    <span style="color: #71717a; font-size: 13px;">Location</span>
                                                    <p style="color: #fafafa; font-size: 14px; margin: 4px 0 0 0;">📍 ${nodeLocation}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 12px 0 0 0;">
                                                    <span style="color: #71717a; font-size: 13px;">Status</span>
                                                    <p style="margin: 4px 0 0 0;">
                                                        <span style="display: inline-block; background-color: ${alertBgColors[alertType]}; color: ${alertColors[alertType]}; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px;">${alertType === 'offline' ? 'OFFLINE' : alertType === 'score_drop' ? 'SCORE DROPPED' : 'UPDATED'}</span>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alert Details -->
                            <div style="background-color: ${alertBgColors[alertType]}; border-left: 4px solid ${alertColors[alertType]}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
                                <p style="color: #18181b; font-size: 14px; line-height: 1.6; margin: 0;">${details}</p>
                            </div>
                            
                            
                            <!-- CTA Button - Always show -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="${nodeUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                                            🔍 View Node Details →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #27272a; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center;">
                            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">
                                You received this alert because you subscribed to notifications for this node.
                            </p>
                            <p style="margin: 0;">
                                <a href="${nodeUrl}" style="color: #a78bfa; font-size: 12px; text-decoration: none;">View Node</a>
                                <span style="color: #52525b; margin: 0 8px;">•</span>
                                <a href="${baseUrl}" style="color: #a78bfa; font-size: 12px; text-decoration: none;">Open Dashboard</a>
                            </p>
                            <p style="color: #52525b; font-size: 11px; margin: 16px 0 0 0;">
                                © ${new Date().getFullYear()} pNode Watch. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const text = `
${alertTypeLabels[alertType] || alertType}
================================

Node Details:
- Node ID: ${nodeId}${nodeIp ? `
- IP Address: ${nodeIp}` : ''}${nodeLocation ? `
- Location: ${nodeLocation}` : ''}

${details}

👉 VIEW NODE DETAILS: ${nodeUrl}

---
You received this alert because you subscribed to notifications for this node.
pNode Watch - ${baseUrl}
`;

    return { subject, html, text };
}

/**
 * Send node offline alert (email + push)
 */
export async function sendNodeOfflineAlert(params: {
    email?: string;
    pushSubscription?: { endpoint: string; p256dh: string; auth: string };
    nodeId: string;
    nodeName?: string;
    dashboardUrl?: string;
    nodeIp?: string;
    nodeLocation?: string;
}): Promise<{ emailSuccess: boolean; pushSuccess: boolean }> {
    const results = { emailSuccess: false, pushSuccess: false };

    // Send email
    if (params.email) {
        const { subject, html, text } = generateAlertEmail({
            nodeId: params.nodeId,
            nodeName: params.nodeName,
            alertType: 'offline',
            details: 'This node has gone offline and is no longer responding to the network. This may affect staking performance and rewards.',
            dashboardUrl: params.dashboardUrl,
            nodeIp: params.nodeIp,
            nodeLocation: params.nodeLocation,
        });

        const emailResult = await sendEmail({
            to: params.email,
            subject,
            htmlContent: html,
            textContent: text,
        });
        results.emailSuccess = emailResult.success;
    }

    // Send push notification
    if (params.pushSubscription) {
        const pushResult = await sendPushNotification({
            ...params.pushSubscription,
            title: '🔴 Node Offline',
            body: `Node ${params.nodeName || params.nodeId} has gone offline`,
            url: params.dashboardUrl,
            nodeId: params.nodeId,
            alertType: 'offline',
        });
        results.pushSuccess = pushResult.success;
    }

    return results;
}

/**
 * Send score drop alert (email + push)
 */
export async function sendScoreDropAlert(params: {
    email?: string;
    pushSubscription?: { endpoint: string; p256dh: string; auth: string };
    nodeId: string;
    nodeName?: string;
    oldScore: number;
    newScore: number;
    threshold: number;
    dashboardUrl?: string;
    nodeIp?: string;
    nodeLocation?: string;
}): Promise<{ emailSuccess: boolean; pushSuccess: boolean }> {
    const results = { emailSuccess: false, pushSuccess: false };

    // Send email
    if (params.email) {
        const { subject, html, text } = generateAlertEmail({
            nodeId: params.nodeId,
            nodeName: params.nodeName,
            alertType: 'score_drop',
            details: `Your node's staking score dropped from <strong>${params.oldScore.toFixed(1)}</strong> to <strong>${params.newScore.toFixed(1)}</strong>, falling below your alert threshold of ${params.threshold}. Consider checking your node's connectivity and uptime.`,
            dashboardUrl: params.dashboardUrl,
            nodeIp: params.nodeIp,
            nodeLocation: params.nodeLocation,
        });

        const emailResult = await sendEmail({
            to: params.email,
            subject,
            htmlContent: html,
            textContent: text,
        });
        results.emailSuccess = emailResult.success;
    }

    // Send push notification
    if (params.pushSubscription) {
        const pushResult = await sendPushNotification({
            ...params.pushSubscription,
            title: '📉 Score Drop Alert',
            body: `Node ${params.nodeName || params.nodeId} score dropped to ${params.newScore}`,
            url: params.dashboardUrl,
            nodeId: params.nodeId,
            alertType: 'score_drop',
        });
        results.pushSuccess = pushResult.success;
    }

    return results;
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string | null {
    return VAPID_PUBLIC_KEY || null;
}
