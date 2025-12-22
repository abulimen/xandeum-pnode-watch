/**
 * Geolocation Service - Lazy IP geolocation with PERSISTENT localStorage caching
 * Uses multiple API providers with failover for reliability
 * 
 * Providers:
 * 1. ip-api.com (primary) - 45 req/min
 * 2. ipwho.is (fallback 1) - 10,000 req/month
 * 3. ipapi.co (fallback 2) - 1,000 req/day
 */

import { GeoLocation } from '@/types/pnode';

// LocalStorage key for persistent cache
const CACHE_KEY = 'xandeum-geo-cache';
const CACHE_VERSION = 2;

// In-memory cache (mirrors localStorage for fast access)
let memoryCache: Map<string, GeoLocation | null> = new Map();
let cacheLoaded = false;

// Pending lookups to avoid duplicate requests
const pendingLookups = new Map<string, Promise<GeoLocation | null>>();

// Track which provider to try next if primary fails
let lastFailedProvider = 0;

/**
 * Load cache from localStorage
 */
function loadCache(): void {
    if (cacheLoaded || typeof window === 'undefined') return;

    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.version === CACHE_VERSION && parsed.data) {
                memoryCache = new Map(Object.entries(parsed.data));
                console.log(`[geoService] Loaded ${memoryCache.size} cached locations`);
            }
        }
    } catch (e) {
        console.warn('[geoService] Failed to load cache:', e);
    }
    cacheLoaded = true;
}

/**
 * Save cache to localStorage
 */
function saveCache(): void {
    if (typeof window === 'undefined') return;

    try {
        const data: Record<string, GeoLocation | null> = {};
        memoryCache.forEach((value, key) => {
            data[key] = value;
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify({
            version: CACHE_VERSION,
            data,
            savedAt: Date.now(),
        }));
    } catch (e) {
        console.warn('[geoService] Failed to save cache:', e);
    }
}

/**
 * Check if IP is private/local (skip these)
 */
function isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true;

    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;

    return false;
}

/**
 * Normalize response from different providers to common GeoLocation format
 */
function normalizeResponse(data: any, provider: string): GeoLocation | null {
    try {
        switch (provider) {
            case 'ip-api':
                if (data.status !== 'success') return null;
                return {
                    status: 'success',
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.region,
                    regionName: data.regionName || data.region,
                    city: data.city,
                    lat: data.lat,
                    lon: data.lon,
                    timezone: data.timezone,
                    isp: data.isp,
                    query: data.query,
                };

            case 'ipwho':
                if (!data.success) return null;
                return {
                    status: 'success',
                    country: data.country,
                    countryCode: data.country_code,
                    region: data.region_code,
                    regionName: data.region,
                    city: data.city,
                    lat: data.latitude,
                    lon: data.longitude,
                    timezone: data.timezone?.id,
                    isp: data.connection?.isp,
                    query: data.ip,
                };

            case 'ipapi':
                if (data.error) return null;
                return {
                    status: 'success',
                    country: data.country_name,
                    countryCode: data.country_code,
                    region: data.region_code,
                    regionName: data.region,
                    city: data.city,
                    lat: data.latitude,
                    lon: data.longitude,
                    timezone: data.timezone,
                    isp: data.org,
                    query: data.ip,
                };

            default:
                return null;
        }
    } catch (e) {
        return null;
    }
}

/**
 * Fetch from ip-api.com (primary)
 */
async function fetchFromIpApi(ip: string): Promise<GeoLocation | null> {
    try {
        const response = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,isp,query`
        );

        if (response.status === 429) {
            console.warn('[geoService] ip-api.com rate limited');
            return null;
        }

        if (!response.ok) return null;

        const data = await response.json();
        return normalizeResponse(data, 'ip-api');
    } catch (e) {
        console.warn('[geoService] ip-api.com error:', e);
        return null;
    }
}

/**
 * Fetch from ipwho.is (fallback 1)
 */
async function fetchFromIpWho(ip: string): Promise<GeoLocation | null> {
    try {
        const response = await fetch(`https://ipwho.is/${ip}`);

        if (response.status === 429) {
            console.warn('[geoService] ipwho.is rate limited');
            return null;
        }

        if (!response.ok) return null;

        const data = await response.json();
        return normalizeResponse(data, 'ipwho');
    } catch (e) {
        console.warn('[geoService] ipwho.is error:', e);
        return null;
    }
}

/**
 * Fetch from ipapi.co (fallback 2)
 */
async function fetchFromIpApiCo(ip: string): Promise<GeoLocation | null> {
    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (response.status === 429) {
            console.warn('[geoService] ipapi.co rate limited');
            return null;
        }

        if (!response.ok) return null;

        const data = await response.json();
        return normalizeResponse(data, 'ipapi');
    } catch (e) {
        console.warn('[geoService] ipapi.co error:', e);
        return null;
    }
}

/**
 * Fetch geolocation with failover between providers
 */
async function fetchGeoLocation(ipAddress: string): Promise<GeoLocation | null> {
    const providers = [
        { name: 'ip-api', fetch: fetchFromIpApi },
        { name: 'ipwho', fetch: fetchFromIpWho },
        { name: 'ipapi', fetch: fetchFromIpApiCo },
    ];

    // Try each provider in order
    for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        const result = await provider.fetch(ipAddress);

        if (result) {
            if (i > 0) {
                console.log(`[geoService] ${provider.name} succeeded for ${ipAddress}`);
            }
            return result;
        }
    }

    console.warn(`[geoService] All providers failed for ${ipAddress}`);
    return null;
}

/**
 * Get geolocation for an IP address (cached)
 */
async function getLocation(ipAddress: string): Promise<GeoLocation | null> {
    loadCache();

    // Skip private IPs
    if (isPrivateIP(ipAddress)) {
        return null;
    }

    // Check memory cache first
    if (memoryCache.has(ipAddress)) {
        return memoryCache.get(ipAddress) || null;
    }

    // Check if there's already a pending lookup
    if (pendingLookups.has(ipAddress)) {
        return pendingLookups.get(ipAddress)!;
    }

    // Create new lookup promise
    const lookupPromise = (async () => {
        const result = await fetchGeoLocation(ipAddress);
        memoryCache.set(ipAddress, result);
        saveCache();
        return result;
    })();

    pendingLookups.set(ipAddress, lookupPromise);

    try {
        return await lookupPromise;
    } finally {
        pendingLookups.delete(ipAddress);
    }
}

/**
 * Get locations for multiple IPs (for displayed nodes only)
 * Fetches sequentially with delay to avoid rate limiting
 */
async function getLocationsForIPs(ipAddresses: string[]): Promise<Map<string, GeoLocation | null>> {
    loadCache();

    const results = new Map<string, GeoLocation | null>();
    const toFetch: string[] = [];

    // First, get all cached results
    for (const ip of ipAddresses) {
        if (isPrivateIP(ip)) {
            results.set(ip, null);
        } else if (memoryCache.has(ip)) {
            results.set(ip, memoryCache.get(ip) || null);
        } else {
            toFetch.push(ip);
        }
    }

    // Fetch uncached IPs with delays to respect rate limits
    for (let i = 0; i < toFetch.length; i++) {
        const ip = toFetch[i];

        // Small delay between requests (not for first one)
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        const location = await getLocation(ip);
        results.set(ip, location);
    }

    return results;
}

/**
 * Get cache stats
 */
function getCacheStats(): { size: number; pending: number } {
    loadCache();
    return {
        size: memoryCache.size,
        pending: pendingLookups.size,
    };
}

/**
 * Clear the geo cache
 */
function clearCache(): void {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
    }
}

/**
 * Get locations progressively - calls callback immediately as each IP resolves
 * This enables streaming/progressive rendering of nodes on the map
 */
function getLocationsProgressively(
    ipAddresses: string[],
    onLocationResolved: (ip: string, location: GeoLocation | null) => void
): void {
    loadCache();

    const toFetch: string[] = [];

    // First, immediately return cached results
    for (const ip of ipAddresses) {
        if (isPrivateIP(ip)) {
            onLocationResolved(ip, null);
        } else if (memoryCache.has(ip)) {
            onLocationResolved(ip, memoryCache.get(ip) || null);
        } else {
            toFetch.push(ip);
        }
    }

    // Fetch uncached IPs with progressive callbacks
    // Use async IIFE to handle the sequential fetching with delays
    (async () => {
        for (let i = 0; i < toFetch.length; i++) {
            const ip = toFetch[i];

            // Small delay between requests (not for first one) to respect rate limits
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            const location = await getLocation(ip);
            // Immediately notify when this single location resolves
            onLocationResolved(ip, location);
        }
    })();
}

export const geoService = {
    getLocation,
    getLocationsForIPs,
    getLocationsProgressively,
    isPrivateIP,
    clearCache,
    getCacheStats,
};
