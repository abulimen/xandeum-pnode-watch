/**
 * Jupiter Token API Route
 * Proxies requests to Jupiter API to fetch XAND token data
 */

import { NextResponse } from 'next/server';

const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';
const JUPITER_API_URL = 'https://api.jup.ag/ultra/v1/search';

export interface JupiterTokenData {
    id: string;
    name: string;
    symbol: string;
    icon?: string;
    decimals: number;
    tags?: string[];
    usdPrice?: number;
    mcap?: number;
    fdv?: number;
    liquidity?: number;
    holderCount?: number;
    circSupply?: number;
    totalSupply?: number;
    stats24h?: {
        priceChange?: number;
        buyVolume?: number;
        sellVolume?: number;
        numBuys?: number;
        numSells?: number;
        numTraders?: number;
    };
    stats7d?: {
        priceChange?: number;
    };
    stats30d?: {
        priceChange?: number;
    };
    updatedAt?: string;
}

export interface TokenStats {
    address: string;
    name: string;
    symbol: string;
    logoURI: string;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    priceChange30d: number;
    marketCap: number;
    fdv: number;
    liquidity: number;
    volume24h: number;
    holders: number;
    circulatingSupply: number;
    totalSupply: number;
    lastUpdated: string;
}

export async function GET() {
    try {
        const apiKey = process.env.JUPITER_API_KEY;

        if (!apiKey) {
            console.error('JUPITER_API_KEY not configured');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        // Add timeout and abort signal for network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const response = await fetch(`${JUPITER_API_URL}?query=${XAND_MINT}`, {
                headers: {
                    'x-api-key': apiKey,
                },
                signal: controller.signal,
                next: { revalidate: 60 }, // Cache for 60 seconds
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error('Jupiter API error:', response.status, await response.text());
                return NextResponse.json(
                    { error: 'Failed to fetch token data' },
                    { status: response.status }
                );
            }

            const data = await response.json();

            // Extract the XAND token from the search results (uses 'id' not 'address')
            const xandToken = data?.find?.((token: JupiterTokenData) => token.id === XAND_MINT);

            if (!xandToken) {
                console.error('Token not found in Jupiter response:', JSON.stringify(data).slice(0, 200));
                return NextResponse.json(
                    { error: 'Token not found' },
                    { status: 404 }
                );
            }

            // Calculate 24h volume from buy + sell volume
            const volume24h = (xandToken.stats24h?.buyVolume || 0) + (xandToken.stats24h?.sellVolume || 0);

            const tokenStats: TokenStats = {
                address: xandToken.id,
                name: xandToken.name || 'Xandeum',
                symbol: xandToken.symbol || 'XAND',
                logoURI: xandToken.icon || '/logo.png',
                price: xandToken.usdPrice || 0,
                priceChange24h: xandToken.stats24h?.priceChange || 0,
                priceChange7d: xandToken.stats7d?.priceChange || 0,
                priceChange30d: xandToken.stats30d?.priceChange || 0,
                marketCap: xandToken.mcap || 0,
                fdv: xandToken.fdv || 0,
                liquidity: xandToken.liquidity || 0,
                volume24h,
                holders: xandToken.holderCount || 0,
                circulatingSupply: xandToken.circSupply || 0,
                totalSupply: xandToken.totalSupply || 0,
                lastUpdated: xandToken.updatedAt || new Date().toISOString(),
            };

            return NextResponse.json(tokenStats);
        } catch (fetchError) {
            // Handle network errors (timeout, connection refused, etc.)
            clearTimeout(timeoutId);
            console.error('Network error fetching Jupiter token data:', fetchError);
            return NextResponse.json(
                { error: 'Unable to connect to price service' },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Error in token API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
