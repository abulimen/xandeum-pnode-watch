/**
 * WorldMap Component - Country-based node visualization
 * Shows node count per country, click to see nodes list
 */

'use client';

import { useState, useMemo, memo } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from 'react-simple-maps';
import { PNode } from '@/types/pnode';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, Loader2, MapPin, Server, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// World map TopoJSON URL
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Country centroids for label placement (approximate)
const countryCentroids: Record<string, [number, number]> = {
    'United States': [-98, 39],
    'USA': [-98, 39],
    'Canada': [-106, 56],
    'Brazil': [-55, -10],
    'Argentina': [-64, -34],
    'United Kingdom': [-2, 54],
    'UK': [-2, 54],
    'Germany': [10, 51],
    'France': [2, 46],
    'Spain': [-4, 40],
    'Italy': [12, 42],
    'Netherlands': [5, 52],
    'Poland': [19, 52],
    'Russia': [100, 60],
    'China': [105, 35],
    'Japan': [138, 36],
    'South Korea': [128, 36],
    'India': [79, 22],
    'Australia': [134, -25],
    'South Africa': [25, -29],
    'Nigeria': [8, 10],
    'Egypt': [30, 27],
    'Singapore': [104, 1],
    'Indonesia': [118, -2],
    'Thailand': [101, 15],
    'Vietnam': [106, 16],
    'Philippines': [122, 12],
    'Malaysia': [102, 4],
    'Turkey': [35, 39],
    'Ukraine': [32, 49],
    'Sweden': [18, 62],
    'Norway': [10, 62],
    'Finland': [26, 64],
    'Denmark': [10, 56],
    'Switzerland': [8, 47],
    'Austria': [14, 47],
    'Belgium': [4, 51],
    'Portugal': [-8, 39],
    'Ireland': [-8, 53],
    'Greece': [22, 39],
    'Czech Republic': [15, 50],
    'Romania': [25, 46],
    'Hungary': [20, 47],
    'Mexico': [-102, 23],
    'Colombia': [-74, 4],
    'Chile': [-71, -33],
    'Peru': [-76, -10],
    'Venezuela': [-66, 8],
    'New Zealand': [172, -41],
    'Taiwan': [121, 24],
    'Hong Kong': [114, 22],
    'UAE': [54, 24],
    'Saudi Arabia': [45, 24],
    'Israel': [35, 31],
    'Kenya': [38, 1],
    'Morocco': [-6, 32],
    'Pakistan': [69, 30],
    'Bangladesh': [90, 24],
};

interface WorldMapProps {
    nodes: PNode[];
    totalNodes?: number;
    isLoadingLocations?: boolean;
}

interface CountryGroup {
    country: string;
    nodes: PNode[];
    coordinates: [number, number];
}

function WorldMapComponent({ nodes, totalNodes, isLoadingLocations }: WorldMapProps) {
    const [selectedCountry, setSelectedCountry] = useState<CountryGroup | null>(null);
    const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
    const [tooltip, setTooltip] = useState<{ name: string; nodeCount?: number } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Track mouse position on the container
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Group nodes by country
    const countryGroups = useMemo(() => {
        const groups: Record<string, CountryGroup> = {};

        nodes.forEach(node => {
            const country = node.location?.country;
            if (!country) return;

            if (!groups[country]) {
                // Try to get centroid, fallback to first node's coordinates
                const centroid = countryCentroids[country];
                const coords: [number, number] = centroid ||
                    (node.location?.coordinates ? [node.location.coordinates.lng, node.location.coordinates.lat] : [0, 0]);

                groups[country] = {
                    country,
                    nodes: [],
                    coordinates: coords,
                };
            }
            groups[country].nodes.push(node);
        });

        return Object.values(groups).sort((a, b) => b.nodes.length - a.nodes.length);
    }, [nodes]);

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
    };

    // Get status summary for a country
    const getStatusSummary = (countryNodes: PNode[]) => {
        const online = countryNodes.filter(n => n.status === 'online').length;
        const degraded = countryNodes.filter(n => n.status === 'degraded').length;
        const offline = countryNodes.filter(n => n.status === 'offline').length;
        return { online, degraded, offline };
    };

    // Get marker color based on node status proportions
    const getMarkerColor = (countryNodes: PNode[]) => {
        const total = countryNodes.length;
        const online = countryNodes.filter(n => n.status === 'online').length;
        const degraded = countryNodes.filter(n => n.status === 'degraded').length;
        const offline = countryNodes.filter(n => n.status === 'offline').length;

        // Calculate percentages
        const onlinePct = online / total;
        const offlinePct = offline / total;

        // Mostly offline (>50%) = red
        if (offlinePct > 0.5) return '#ef4444';
        // Has significant offline (>20%) = orange-red
        if (offlinePct > 0.2) return '#f97316';
        // Has any offline or mostly degraded = amber
        if (offline > 0 || degraded / total > 0.5) return '#f59e0b';
        // Has some degraded = yellow-green
        if (degraded > 0) return '#84cc16';
        // All online = green
        return '#10b981';
    };

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden" onMouseMove={handleMouseMove}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 120,
                    center: [0, 30],
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                >
                    {/* World geography */}
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1e3a5f"
                                    stroke="#2563eb"
                                    strokeWidth={0.5}
                                    onMouseEnter={() => {
                                        const countryName = geo.properties?.name || 'Unknown';
                                        setTooltip({ name: countryName });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        default: { outline: 'none', cursor: 'pointer' },
                                        hover: { fill: '#2563eb', outline: 'none' },
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {/* Country markers with node counts */}
                    {countryGroups.map((group) => {
                        const markerColor = getMarkerColor(group.nodes);
                        const isLargeCluster = group.nodes.length >= 10;
                        const baseSize = isLargeCluster ? 8 : 6;

                        return (
                            <Marker
                                key={group.country}
                                coordinates={group.coordinates}
                                onClick={() => setSelectedCountry(group)}
                            >
                                {/* Pulse effect */}
                                <circle
                                    r={(baseSize + 6) / position.zoom}
                                    fill={markerColor}
                                    opacity={0.2}
                                >
                                    <animate
                                        attributeName="r"
                                        from={(baseSize + 6) / position.zoom}
                                        to={(baseSize + 14) / position.zoom}
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        from="0.2"
                                        to="0"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                {/* Main circle */}
                                <circle
                                    r={baseSize / position.zoom}
                                    fill={markerColor}
                                    stroke="#fff"
                                    strokeWidth={2 / position.zoom}
                                    className="cursor-pointer transition-all hover:opacity-80"
                                    onMouseEnter={() => {
                                        setTooltip({
                                            name: group.country,
                                            nodeCount: group.nodes.length
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                                {/* Count label */}
                                <text
                                    textAnchor="middle"
                                    y={4 / position.zoom}
                                    style={{
                                        fontFamily: 'system-ui',
                                        fill: '#fff',
                                        fontSize: `${(isLargeCluster ? 9 : 7) / position.zoom}px`,
                                        fontWeight: 'bold',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    {group.nodes.length}
                                </text>
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-slate-800/90 hover:bg-slate-700 text-white"
                    onClick={handleZoomIn}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-slate-800/90 hover:bg-slate-700 text-white"
                    onClick={handleZoomOut}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-lg p-3 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">All Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-300">Some Degraded</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-300">Has Offline</span>
                </div>
            </div>

            {/* Node count badge */}
            <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-sm text-slate-300 flex items-center gap-2">
                {isLoadingLocations && <Loader2 className="h-3 w-3 animate-spin" />}
                {countryGroups.reduce((sum, g) => sum + g.nodes.length, 0)}{totalNodes && totalNodes > countryGroups.reduce((sum, g) => sum + g.nodes.length, 0) ? ` of ${totalNodes}` : ''} nodes in {countryGroups.length} countries
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 text-sm"
                    style={{
                        left: mousePos.x + 12,
                        top: mousePos.y - 12,
                    }}
                >
                    <span className="font-medium">{tooltip.name}</span>
                    {tooltip.nodeCount && (
                        <span className="text-slate-400 ml-2">({tooltip.nodeCount} nodes)</span>
                    )}
                </div>
            )}

            {/* Selected Country Panel - Modal on mobile, side panel on desktop */}
            {selectedCountry && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSelectedCountry(null)}
                    />
                    <div
                        className="fixed lg:absolute z-50 
                            inset-4 lg:inset-auto lg:right-4 lg:top-16 lg:bottom-20 
                            lg:w-80 max-h-[80vh] lg:max-h-none
                            bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl 
                            flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-lg truncate">
                                        {selectedCountry.country}
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {selectedCountry.nodes.length} node{selectedCountry.nodes.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 shrink-0"
                                    onClick={() => setSelectedCountry(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Status summary */}
                            <div className="flex gap-3 mt-3">
                                {(() => {
                                    const summary = getStatusSummary(selectedCountry.nodes);
                                    return (
                                        <>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-slate-300">{summary.online} online</span>
                                            </div>
                                            {summary.degraded > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <span className="text-slate-300">{summary.degraded} degraded</span>
                                                </div>
                                            )}
                                            {summary.offline > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                                    <span className="text-slate-300">{summary.offline} offline</span>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Nodes list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            {selectedCountry.nodes
                                .sort((a, b) => {
                                    // Sort by status: online first, then degraded, then offline
                                    const statusOrder = { online: 0, degraded: 1, offline: 2 };
                                    return statusOrder[a.status] - statusOrder[b.status];
                                })
                                .map(node => (
                                    <Link
                                        key={node.id}
                                        href={`/nodes/${node.id}`}
                                        className="block bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-primary/50 hover:bg-slate-900/80 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <Server className="h-4 w-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
                                                <span className="font-mono text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                                                    {node.id}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "w-2 h-2 rounded-full shrink-0 mt-1.5",
                                                node.status === 'online' && "bg-emerald-500",
                                                node.status === 'degraded' && "bg-amber-500",
                                                node.status === 'offline' && "bg-red-500"
                                            )} />
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 group-hover:text-slate-400">
                                            {node.location?.city && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {node.location.city}
                                                </span>
                                            )}
                                            <span>Up: {node.uptime.toFixed(1)}%</span>
                                            <span>{node.responseTime}ms</span>
                                        </div>
                                        <div className="flex items-center justify-end mt-1">
                                            <span className="text-xs text-emerald-400/70 group-hover:text-emerald-400 flex items-center gap-0.5">
                                                View details <ChevronRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export const WorldMap = memo(WorldMapComponent);

