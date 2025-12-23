import { NextRequest, NextResponse } from 'next/server';
import {
    handleStart,
    handleStats,
    handlePrice,
    handleNode,
    handleTop,
    BotResponse
} from '@/lib/bot/handlers';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// Get base URL for API calls
function getBaseUrl() {
    if (process.env.BASE_URL) return `https://${process.env.BASE_URL}`;
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
    return 'http://localhost:3000';
}

// Verify Discord signature
async function verifyDiscordSignature(req: NextRequest, body: string): Promise<boolean> {
    if (!DISCORD_PUBLIC_KEY) return false;

    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');

    if (!signature || !timestamp) return false;

    try {
        const encoder = new TextEncoder();
        const message = encoder.encode(timestamp + body);

        // Convert hex signature and public key to Uint8Array
        const signatureBytes = new Uint8Array(
            signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );
        const publicKeyBytes = new Uint8Array(
            DISCORD_PUBLIC_KEY.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        // Import the public key
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            publicKeyBytes,
            { name: 'Ed25519', namedCurve: 'Ed25519' },
            false,
            ['verify']
        );

        // Verify the signature
        return await crypto.subtle.verify(
            { name: 'Ed25519' },
            cryptoKey,
            signatureBytes,
            message
        );
    } catch (error) {
        console.error('[discord] Signature verification failed:', error);
        return false;
    }
}

// Convert BotResponse to Discord format
function formatForDiscord(response: BotResponse): object {
    return {
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
            content: response.text,
            flags: 0
        }
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();

        // Verify signature (skip in development)
        if (process.env.NODE_ENV === 'production') {
            const isValid = await verifyDiscordSignature(req, body);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const interaction = JSON.parse(body);

        // Handle PING (type 1) - Discord validation
        if (interaction.type === 1) {
            return NextResponse.json({ type: 1 }); // PONG
        }

        // Handle Application Commands (type 2)
        if (interaction.type === 2) {
            const commandName = interaction.data?.name;
            const options = interaction.data?.options || [];
            const baseUrl = getBaseUrl();

            let response: BotResponse;

            switch (commandName) {
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
                    const nodeId = options.find((o: any) => o.name === 'id')?.value || '';
                    response = await handleNode(baseUrl, nodeId);
                    break;
                case 'top':
                    const count = options.find((o: any) => o.name === 'count')?.value || 5;
                    response = await handleTop(baseUrl, count);
                    break;
                default:
                    response = { text: 'Unknown command' };
            }

            return NextResponse.json(formatForDiscord(response));
        }

        return NextResponse.json({ type: 1 });

    } catch (error) {
        console.error('[discord] Interaction error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
