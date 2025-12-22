/**
 * Credits API Proxy Route
 * Proxies requests to the Xandeum Credits API to bypass CORS restrictions
 */

import { NextRequest, NextResponse } from 'next/server';

interface CreditsApiResponse {
    pods_credits: Array<{
        credits: number;
        pod_id: string;
    }>;
    status: string;
}

// Cache for 60 seconds
let cachedData: CreditsApiResponse | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 60000;

export async function GET(request: NextRequest) {
    const now = Date.now();

    // Return cached data if fresh
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION_MS) {
        return NextResponse.json(cachedData, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    }

    try {
        console.log('[credits-proxy] Fetching from Xandeum API...');
        const response = await fetch('https://podcredits.xandeum.network/api/pods-credits', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Don't cache at fetch level, we handle caching ourselves
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('[credits-proxy] API returned error:', response.status);
            return NextResponse.json(
                { error: 'Failed to fetch credits', status: 'error' },
                { status: response.status }
            );
        }

        const data: CreditsApiResponse = await response.json();

        if (data.status !== 'success' || !Array.isArray(data.pods_credits)) {
            console.error('[credits-proxy] Invalid response format');
            return NextResponse.json(
                { error: 'Invalid response from credits API', status: 'error' },
                { status: 502 }
            );
        }

        console.log(`[credits-proxy] Loaded ${data.pods_credits.length} credits`);

        // Update cache
        cachedData = data;
        lastFetchTime = now;

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });

    } catch (error: any) {
        console.error('[credits-proxy] Error:', error.message);

        // Return cached data if available on error
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        return NextResponse.json(
            { error: 'Failed to fetch credits', status: 'error' },
            { status: 500 }
        );
    }
}
