/**
 * Map Page - Geographic visualization of pNodes
 * Redesigned layout with sidebar, top stats, and improved map
 * Enhanced with Framer Motion animations
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import {
    Globe,
    MapPin,
    Loader2,
    ChevronRight,
    ChevronDown,
    Search,
    Server,
    HardDrive,
    Activity,
    Clock,
    Menu,
    X,
    SearchX
} from 'lucide-react';
import { PNode } from '@/types/pnode';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatBytes, enrichNodesWithStakingData } from '@/lib/services/analyticsService';

// Dynamic import to avoid SSR issues with react-simple-maps
const WorldMap = dynamic(
    () => import('@/components/map/WorldMap').then(mod => mod.WorldMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full min-h-[400px] bg-slate-900/50 rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
);

// Build hierarchical data structure: Country -> City -> Nodes
interface CityData {
    name: string;
    nodes: PNode[];
}

interface CountryData {
    name: string;
    count: number;
    cities: Record<string, CityData>;
}

function buildHierarchy(nodes: PNode[]): Record<string, CountryData> {
    const countries: Record<string, CountryData> = {};

    nodes.forEach(node => {
        if (!node.location?.country) return;

        const country = node.location.country;
        const city = node.location.city || 'Unknown City';

        if (!countries[country]) {
            countries[country] = { name: country, count: 0, cities: {} };
        }

        countries[country].count++;

        if (!countries[country].cities[city]) {
            countries[country].cities[city] = { name: city, nodes: [] };
        }

        countries[country].cities[city].nodes.push(node);
    });

    return countries;
}

// Geographic Sidebar Component with Accordion
interface GeographicSidebarProps {
    nodes: PNode[];
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClose?: () => void;
    isMobile?: boolean;
}

function GeographicSidebar({ nodes, isLoading, searchQuery, onSearchChange, onClose, isMobile }: GeographicSidebarProps) {
    const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
    const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
    const [showAllCountries, setShowAllCountries] = useState(false);
    const INITIAL_COUNTRY_LIMIT = 10;

    const hierarchy = useMemo(() => buildHierarchy(nodes), [nodes]);
    const sortedCountries = useMemo(() =>
        Object.values(hierarchy).sort((a, b) => b.count - a.count),
        [hierarchy]
    );

    // Calculate stats
    const stats = useMemo(() => {
        const onlineNodes = nodes.filter(n => n.status === 'online').length;
        const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
        const offlineNodes = nodes.filter(n => n.status === 'offline').length;
        const avgUptime = nodes.length > 0
            ? nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length
            : 0;

        return { onlineNodes, degradedNodes, offlineNodes, avgUptime };
    }, [nodes]);

    const toggleCountry = (country: string) => {
        setExpandedCountries(prev => {
            const next = new Set(prev);
            if (next.has(country)) {
                next.delete(country);
            } else {
                next.add(country);
            }
            return next;
        });
    };

    const toggleCity = (cityKey: string) => {
        setExpandedCities(prev => {
            const next = new Set(prev);
            if (next.has(cityKey)) {
                next.delete(cityKey);
            } else {
                next.add(cityKey);
            }
            return next;
        });
    };

    // Countries to display (limited or all)
    const displayedCountries = showAllCountries
        ? sortedCountries
        : sortedCountries.slice(0, INITIAL_COUNTRY_LIMIT);
    const hasMoreCountries = sortedCountries.length > INITIAL_COUNTRY_LIMIT;

    return (
        <div className="p-4 space-y-4 h-full overflow-y-auto">
            {/* Header with close button for mobile */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Global Nodes
                </h1>
                {isMobile && onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search country or ID..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-background"
                />
            </div>

            {/* Geographic Distribution - Accordion */}
            <div className="pt-3 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Geographic Distribution
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                    {nodes.filter(n => n.location).length} nodes across {sortedCountries.length} countries
                </p>

                {isLoading ? (
                    // Loading skeleton
                    <div className="space-y-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 px-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-3 rounded" />
                                    <Skeleton className="h-3 w-3 rounded" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-5 w-8 rounded" />
                            </div>
                        ))}
                    </div>
                ) : sortedCountries.length === 0 ? (
                    // Empty state - no results
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <SearchX className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No nodes found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {searchQuery ? `No results for "${searchQuery}"` : 'No location data available'}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="link"
                                size="sm"
                                className="mt-2"
                                onClick={() => onSearchChange('')}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {displayedCountries.map((country) => {
                            const isExpanded = expandedCountries.has(country.name);
                            const cities = Object.values(country.cities).sort((a, b) => b.nodes.length - a.nodes.length);

                            return (
                                <div key={country.name}>
                                    {/* Country Row */}
                                    <button
                                        onClick={() => toggleCountry(country.name)}
                                        className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <Globe className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-medium text-sm">{country.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {country.count}
                                        </span>
                                    </button>

                                    {/* Cities */}
                                    {isExpanded && (
                                        <div className="ml-4 border-l border-muted pl-2 space-y-0.5">
                                            {cities.map((city) => {
                                                const cityKey = `${country.name}-${city.name}`;
                                                const isCityExpanded = expandedCities.has(cityKey);

                                                return (
                                                    <div key={cityKey}>
                                                        {/* City Row */}
                                                        <button
                                                            onClick={() => toggleCity(cityKey)}
                                                            className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-muted/30 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isCityExpanded ? (
                                                                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                                                                )}
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs">{city.name}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {city.nodes.length}
                                                            </span>
                                                        </button>

                                                        {/* Nodes in city */}
                                                        {isCityExpanded && (
                                                            <div className="ml-5 border-l border-muted/50 pl-2 space-y-0.5 py-1">
                                                                {city.nodes.map((node) => (
                                                                    <Link
                                                                        key={node.id}
                                                                        href={`/nodes/${node.id}`}
                                                                        className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-muted/30 transition-colors group"
                                                                    >
                                                                        <Server className="h-2.5 w-2.5 text-muted-foreground" />
                                                                        <span className="text-xs font-mono truncate group-hover:text-primary transition-colors">
                                                                            {node.id}
                                                                        </span>
                                                                        <span className={cn(
                                                                            "w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0",
                                                                            node.status === 'online' && "bg-emerald-500",
                                                                            node.status === 'degraded' && "bg-amber-500",
                                                                            node.status === 'offline' && "bg-red-500"
                                                                        )} />
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Show more/less button */}
                        {hasMoreCountries && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs"
                                onClick={() => setShowAllCountries(!showAllCountries)}
                            >
                                {showAllCountries
                                    ? `Show less`
                                    : `Show ${sortedCountries.length - INITIAL_COUNTRY_LIMIT} more countries`
                                }
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Node Status */}
            <div className="pt-3 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Node Status
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm">Active</span>
                        </div>
                        <span className="font-medium tabular-nums text-sm">
                            {isLoading ? <Skeleton className="h-4 w-10 inline-block" /> : stats.onlineNodes.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-sm">Syncing</span>
                        </div>
                        <span className="font-medium tabular-nums text-sm">
                            {isLoading ? <Skeleton className="h-4 w-8 inline-block" /> : stats.degradedNodes.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-sm">Offline</span>
                        </div>
                        <span className="font-medium tabular-nums text-sm">
                            {isLoading ? <Skeleton className="h-4 w-8 inline-block" /> : stats.offlineNodes.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MapPageContent() {
    const { nodes, isLoading, isFetching, isError, refetch, lastUpdated, responseTime } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const searchParams = useSearchParams();
    const countryParam = searchParams.get('country');
    const [searchQuery, setSearchQuery] = useState('');
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pre-fill search with country param
    useEffect(() => {
        if (countryParam && !searchQuery) {
            setSearchQuery(countryParam);
        }
    }, [countryParam]);

    // Enrich nodes with staking data
    const enrichedNodes = useMemo(() => enrichNodesWithStakingData(nodes), [nodes]);

    // Fetch geolocation for ALL nodes
    const { nodesWithLocation, isLoading: geoLoading } = useNodeLocations(enrichedNodes);

    // Update last sync time periodically
    useEffect(() => {
        if (!isLoading && !geoLoading) {
            setLastSync(new Date());
        }
    }, [isLoading, geoLoading, nodes.length]);

    // Calculate stats
    const stats = useMemo(() => {
        const countries = new Set(nodesWithLocation.map(n => n.location?.country).filter(Boolean));
        const totalStorage = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        const avgUptime = nodes.length > 0
            ? nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length
            : 0;

        return {
            totalNodes: nodes.length,
            countryCount: countries.size,
            totalStorage,
            avgUptime,
        };
    }, [nodes, nodesWithLocation]);

    // Filter nodes by search query
    const filteredNodes = useMemo(() => {
        if (!searchQuery.trim()) return nodesWithLocation;
        const query = searchQuery.toLowerCase();
        return nodesWithLocation.filter(n =>
            n.id.toLowerCase().includes(query) ||
            n.location?.country?.toLowerCase().includes(query) ||
            n.location?.city?.toLowerCase().includes(query)
        );
    }, [nodesWithLocation, searchQuery]);

    // Nodes with coordinates for map
    const nodesWithCoordinates = useMemo(() =>
        filteredNodes.filter(n => n.location?.coordinates),
        [filteredNodes]
    );

    // Format time ago
    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header issueCount={issueCount} />

            <RefreshBar
                lastUpdated={lastUpdated}
                isFetching={isFetching}
                isError={isError}
                responseTime={responseTime}
                onRefresh={refetch}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Breadcrumb with mobile menu toggle */}
                <div className="container px-4 py-3 text-sm text-muted-foreground flex items-center justify-between">
                    <div>
                        <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                        <span className="mx-2">›</span>
                        <span className="text-foreground">Network Map</span>
                    </div>
                    {/* Mobile sidebar toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
                    {/* Mobile Sidebar Overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Left Sidebar - Desktop always visible, Mobile slide-in */}
                    <aside className={cn(
                        "bg-card flex-shrink-0 overflow-hidden transition-all duration-300",
                        // Desktop styles - z-auto allows ticker to show on top
                        "lg:relative lg:w-72 xl:w-80 lg:border-r lg:max-h-[calc(100vh-160px)] lg:z-auto",
                        // Mobile styles - z-40 for overlay (below z-50 ticker)
                        "fixed lg:static inset-y-0 left-0 z-40 w-80 max-w-[85vw]",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                        "mb-10"
                    )} data-tour="map-sidebar">
                        <GeographicSidebar
                            nodes={filteredNodes}
                            isLoading={isLoading || (geoLoading && nodesWithLocation.filter(n => n.location).length === 0)}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onClose={() => setSidebarOpen(false)}
                            isMobile={sidebarOpen}
                        />
                    </aside>

                    {/* Main Map Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Top Stats Bar */}
                        <div className="border-b bg-card/30 backdrop-blur" data-tour="map-stats">
                            <div className="px-4 lg:px-6 py-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Total Nodes */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Server className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Nodes</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold">
                                                    {isLoading ? '—' : stats.totalNodes.toLocaleString()}
                                                </span>
                                                {!isLoading && (
                                                    <span className="text-xs text-emerald-500">Active</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Countries */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <Globe className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Active Countries</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold">
                                                    {geoLoading ? '—' : stats.countryCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Storage */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <HardDrive className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Storage</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold">
                                                    ~{isLoading ? '—' : formatBytes(stats.totalStorage)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Network Uptime */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Network Uptime</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold">
                                                    {isLoading ? '—' : `${stats.avgUptime.toFixed(1)}%`}
                                                </span>
                                                {!isLoading && stats.avgUptime >= 99 && (
                                                    <span className="text-xs text-emerald-500">Stable</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="flex-1 relative" data-tour="world-map">
                            <div className="absolute inset-0 bg-slate-900/20">
                                <WorldMap
                                    nodes={nodesWithCoordinates}
                                    totalNodes={stats.totalNodes}
                                    isLoadingLocations={geoLoading}
                                />
                            </div>

                            {/* Live Updates Indicator */}
                            <div className="absolute bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-10">
                                <div className="flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur border rounded-full shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-sm font-medium">Live Updates</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <small>LAST SYNC: {formatTimeAgo(lastSync).toUpperCase()}</small>
                                    </span>
                                </div>
                            </div>

                            {/* Loading overlay */}
                            {(isLoading || geoLoading) && nodesWithCoordinates.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading node locations...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </div>
        }>
            <MapPageContent />
        </Suspense>
    );
}
