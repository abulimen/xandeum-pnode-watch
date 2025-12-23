import { NextRequest, NextResponse } from 'next/server';
import {
    handleStart,
    handleStats,
    handlePrice,
    handleNode,
    handleTop,
    BotResponse
} from '@/lib/bot/handlers';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Get base URL for API calls
function getBaseUrl() {
    if (process.env.BASE_URL) return `https://${process.env.BASE_URL}`;
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
    return 'http://localhost:3000';
}

// Send message to Telegram
async function sendMessage(chatId: number, response: BotResponse) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: response.text,
            parse_mode: response.markdown ? 'Markdown' : undefined,
            disable_web_page_preview: true
        })
    });
}

// Parse command from message
function parseCommand(text: string): { command: string; args: string } {
    const match = text.match(/^\/(\w+)(?:@\w+)?\s*(.*)?$/);
    if (match) {
        return { command: match[1].toLowerCase(), args: match[2]?.trim() || '' };
    }
    return { command: '', args: '' };
}

export async function POST(req: NextRequest) {
    try {
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('[telegram] Missing TELEGRAM_BOT_TOKEN');
            return NextResponse.json({ ok: false });
        }

        const update = await req.json();
        const message = update.message;

        if (!message?.text || !message?.chat?.id) {
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id;
        const { command, args } = parseCommand(message.text);
        const baseUrl = getBaseUrl();

        let response: BotResponse;

        switch (command) {
            case 'start':
            case 'help':
                response = await handleStart();
                break;
            case 'stats':
                response = await handleStats(baseUrl);
                break;
            case 'price':
                response = await handlePrice(baseUrl);
                break;
            case 'node':
                response = await handleNode(baseUrl, args);
                break;
            case 'top':
                const count = parseInt(args) || 5;
                response = await handleTop(baseUrl, count);
                break;
            default:
                // Ignore unknown commands
                return NextResponse.json({ ok: true });
        }

        await sendMessage(chatId, response);
        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('[telegram] Webhook error:', error);
        return NextResponse.json({ ok: false });
    }
}

// GET endpoint for health check
export async function GET() {
    return NextResponse.json({ status: 'Telegram webhook active' });
}
