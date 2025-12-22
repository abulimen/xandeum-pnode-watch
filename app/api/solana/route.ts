/**
 * Solana RPC Proxy API Route
 * Proxies Solana RPC calls to avoid CORS issues in browser
 */

import { NextRequest, NextResponse } from 'next/server';

const SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(SOLANA_RPC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Solana RPC error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Solana RPC proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy Solana RPC request' },
            { status: 500 }
        );
    }
}
