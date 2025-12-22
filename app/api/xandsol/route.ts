/**
 * XandSOL Token API Route
 * Fetches XandSOL data from Jupiter API for staking calculator
 */

import { NextResponse } from 'next/server';

const XANDSOL_MINT = 'XAnDeUmMcqFyCdef9jzpNgtZPjTj3xUMj9eXKn2reFN';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const JUPITER_API_URL = 'https://api.jup.ag/ultra/v1/search';

interface JupiterTokenData {
    id: string;
    name: string;
    symbol: string;
    icon?: string;
    decimals: number;
    usdPrice?: number;
    mcap?: number;
    fdv?: number;
    liquidity?: number;
    holderCount?: number;
    circSupply?: number;
    totalSupply?: number;
    stats24h?: {
        priceChange?: number;
    };
    stats7d?: {
        priceChange?: number;
    };
}

export interface XandSolStats {
    address: string;
    name: string;
    symbol: string;
    logoURI: string;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    marketCap: number;
    fdv: number;
    liquidity: number;
    holders: number;
    totalSupply: number;
    solPrice: number;
    // Staking specific
    stakingAPY: number;
    exchangeRate: number; // XandSOL per SOL
    lastUpdated: string;
}

async function fetchTokenFromJupiter(mint: string, apiKey: string): Promise<JupiterTokenData | null> {
    try {
        const response = await fetch(`${JUPITER_API_URL}?query=${mint}`, {
            headers: {
                'x-api-key': apiKey,
            },
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            console.error(`Jupiter API error for ${mint}:`, response.status);
            return null;
        }

        const data = await response.json();
        const token = data?.find?.((t: JupiterTokenData) => t.id === mint);
        return token || null;
    } catch (error) {
        console.error(`Error fetching ${mint} from Jupiter:`, error);
        return null;
    }
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

        // Fetch both XandSOL and SOL prices in parallel
        const [xandsolToken, solToken] = await Promise.all([
            fetchTokenFromJupiter(XANDSOL_MINT, apiKey),
            fetchTokenFromJupiter(SOL_MINT, apiKey),
        ]);

        if (!xandsolToken) {
            return NextResponse.json(
                { error: 'XandSOL token not found' },
                { status: 404 }
            );
        }

        const xandsolPrice = xandsolToken.usdPrice || 0;
        const solPrice = solToken?.usdPrice || 0;

        // Calculate exchange rate (XandSOL per SOL)
        // If 1 SOL = $X and 1 XandSOL = $Y, then 1 SOL gets you X/Y XandSOL
        const exchangeRate = solPrice > 0 && xandsolPrice > 0
            ? solPrice / xandsolPrice
            : 1;

        // Calculate staking APY based on price appreciation
        // This is derived from the 7d price change annualized, or default to reasonable estimate
        const priceChange7d = xandsolToken.stats7d?.priceChange || 0;
        // Annualize the 7d return: ((1 + weekly_return)^52 - 1) * 100
        const weeklyReturn = priceChange7d / 100;
        const annualizedAPY = weeklyReturn > 0
            ? (Math.pow(1 + weeklyReturn, 52) - 1) * 100
            : 15; // Default to 15% APY if no price data

        const stats: XandSolStats = {
            address: xandsolToken.id,
            name: xandsolToken.name || 'XandSOL',
            symbol: xandsolToken.symbol || 'XandSOL',
            logoURI: xandsolToken.icon || '/xandsol-logo.png',
            price: xandsolPrice,
            priceChange24h: xandsolToken.stats24h?.priceChange || 0,
            priceChange7d: priceChange7d,
            marketCap: xandsolToken.mcap || 0,
            fdv: xandsolToken.fdv || 0,
            liquidity: xandsolToken.liquidity || 0,
            holders: xandsolToken.holderCount || 0,
            totalSupply: xandsolToken.totalSupply || 0,
            solPrice: solPrice,
            stakingAPY: Math.min(Math.max(annualizedAPY, 0), 100), // Clamp between 0-100%
            exchangeRate: exchangeRate,
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching XandSOL data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
