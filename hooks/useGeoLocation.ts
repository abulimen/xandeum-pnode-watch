/**
 * useGeoLocation Hook - Lazy IP geolocation with PROGRESSIVE loading
 * Nodes appear on map immediately as each geolocation request completes
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { PNode } from '@/types/pnode';
import { geoService } from '@/lib/services/geoService';
import { GeoLocation } from '@/types/pnode';

/**
 * Hook to enrich nodes with geolocation data - PROGRESSIVE loading
 * Each node appears immediately when its geolocation resolves
 */
export function useNodeLocations(displayedNodes: PNode[]): {
    nodesWithLocation: PNode[];
    isLoading: boolean;
} {
    const [locationMap, setLocationMap] = useState<Map<string, GeoLocation | null>>(new Map());
    const [pendingCount, setPendingCount] = useState(0);
    const fetchedIPs = useRef<Set<string>>(new Set());

    // Progressive fetch - updates state immediately when each location resolves
    useEffect(() => {
        const ipsToFetch: string[] = [];

        for (const node of displayedNodes) {
            const ip = node.network?.ipAddress;
            if (ip && !fetchedIPs.current.has(ip) && !geoService.isPrivateIP(ip)) {
                fetchedIPs.current.add(ip);
                ipsToFetch.push(ip);
            }
        }

        if (ipsToFetch.length === 0) return;

        setPendingCount(prev => prev + ipsToFetch.length);

        // Fetch each IP individually and update state progressively
        geoService.getLocationsProgressively(ipsToFetch, (ip, location) => {
            // Update state immediately when this single location resolves
            setLocationMap(prev => {
                const updated = new Map(prev);
                updated.set(ip, location);
                return updated;
            });
            setPendingCount(prev => Math.max(0, prev - 1));
        });

    }, [displayedNodes]);

    // Merge locations into nodes
    const nodesWithLocation = displayedNodes.map(node => {
        const ip = node.network?.ipAddress;
        const geoData = ip ? locationMap.get(ip) : null;

        if (geoData) {
            return {
                ...node,
                location: {
                    country: geoData.country,
                    countryCode: geoData.countryCode,
                    region: geoData.regionName || '',
                    city: geoData.city,
                    coordinates: {
                        lat: geoData.lat,
                        lng: geoData.lon,
                    },
                },
            };
        }

        return node;
    });

    return { nodesWithLocation, isLoading: pendingCount > 0 };
}

/**
 * Hook to get location for a single node (used in node details page)
 */
export function useSingleNodeLocation(node: PNode | null): {
    location: PNode['location'] | undefined;
    isLoading: boolean;
} {
    const [location, setLocation] = useState<PNode['location'] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!node?.network?.ipAddress) return;

        const ip = node.network.ipAddress;

        if (geoService.isPrivateIP(ip)) {
            setLocation(undefined);
            return;
        }

        setIsLoading(true);

        geoService.getLocation(ip).then(geoData => {
            if (geoData) {
                setLocation({
                    country: geoData.country,
                    countryCode: geoData.countryCode,
                    region: geoData.regionName || '',
                    city: geoData.city,
                    coordinates: {
                        lat: geoData.lat,
                        lng: geoData.lon,
                    },
                });
            }
            setIsLoading(false);
        });
    }, [node?.network?.ipAddress]);

    return { location, isLoading };
}
