/**
 * Credits Service
 * Fetches official credits data from Xandeum API
 * 
 * Credits are the official network metric that determines reward distribution.
 * See: https://xandeum.network/blog/heartbeat-credit-system
 */

// Cache to avoid excessive API calls
let creditsCache: Map<string, number> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 60000; // 1 minute cache

interface CreditsApiResponse {
    pods_credits: Array<{
        credits: number;
        pod_id: string; // This is the public key
    }>;
    status: string;
}

/**
 * Fetch credits from the official Xandeum API
 * Returns a Map of publicKey -> credits
 */
export async function fetchCredits(): Promise<Map<string, number>> {
    const now = Date.now();

    // Return cached data if still fresh
    if (creditsCache && (now - lastFetchTime) < CACHE_DURATION_MS) {
        return creditsCache;
    }

    try {
        const response = await fetch('https://podcredits.xandeum.network/api/pods-credits', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Cache for 1 minute on the edge
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            console.error('[credits] Failed to fetch credits:', response.status);
            return creditsCache || new Map();
        }

        const json: CreditsApiResponse = await response.json();

        if (json.status !== 'success' || !Array.isArray(json.pods_credits)) {
            console.error('[credits] Invalid API response:', json);
            return creditsCache || new Map();
        }

        // Build the credits map
        const creditsMap = new Map<string, number>();
        for (const item of json.pods_credits) {
            if (item.pod_id && typeof item.credits === 'number') {
                creditsMap.set(item.pod_id, item.credits);
            }
        }

        // Update cache
        creditsCache = creditsMap;
        lastFetchTime = now;

        console.log(`[credits] Fetched ${creditsMap.size} credits from API`);
        return creditsMap;

    } catch (error) {
        console.error('[credits] Error fetching credits:', error);
        return creditsCache || new Map();
    }
}

/**
 * Get credits for a specific node by public key
 */
export async function getCreditsForNode(publicKey: string): Promise<number | undefined> {
    const creditsMap = await fetchCredits();
    return creditsMap.get(publicKey);
}

/**
 * Calculate network credit statistics
 */
export function calculateCreditStats(creditsMap: Map<string, number>): {
    total: number;
    average: number;
    max: number;
    min: number;
    percentile95: number;
    threshold80: number; // 80% of 95th percentile (reward eligibility threshold)
} {
    const values = Array.from(creditsMap.values()).filter(v => v > 0);

    if (values.length === 0) {
        return { total: 0, average: 0, max: 0, min: 0, percentile95: 0, threshold80: 0 };
    }

    values.sort((a, b) => a - b);

    const total = values.reduce((sum, v) => sum + v, 0);
    const average = total / values.length;
    const max = values[values.length - 1];
    const min = values[0];

    // 95th percentile
    const p95Index = Math.floor(values.length * 0.95);
    const percentile95 = values[p95Index] || max;

    // Threshold is 80% of 95th percentile (per Xandeum docs)
    const threshold80 = percentile95 * 0.8;

    return { total, average, max, min, percentile95, threshold80 };
}

export const creditsService = {
    fetchCredits,
    getCreditsForNode,
    calculateCreditStats,
};
