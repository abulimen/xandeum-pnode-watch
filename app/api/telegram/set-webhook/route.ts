import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(req: NextRequest) {
    if (!TELEGRAM_BOT_TOKEN) {
        return NextResponse.json({ error: 'Missing TELEGRAM_BOT_TOKEN' }, { status: 500 });
    }

    // Get webhook URL from query params or construct from host
    const { searchParams } = new URL(req.url);
    let webhookUrl = searchParams.get('url');

    if (!webhookUrl) {
        // Try to construct from environment
        const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL;
        if (!host) {
            return NextResponse.json({
                error: 'Please provide webhook URL via ?url= parameter or set VERCEL_URL/NEXT_PUBLIC_BASE_URL'
            }, { status: 400 });
        }
        webhookUrl = host.startsWith('http') ? host : `https://${host}`;
        webhookUrl += '/api/telegram/webhook';
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: ['message']
            })
        });

        const result = await response.json();

        return NextResponse.json({
            success: result.ok,
            webhookUrl,
            telegramResponse: result
        });
    } catch (error) {
        console.error('[telegram] Failed to set webhook:', error);
        return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 });
    }
}
