/**
 * Watchlist Page - View all saved/favorite nodes
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
    Heart,
    HeartOff,
    Trash2,
    ExternalLink,
    MapPin,
    Activity,
    Coins,
    HardDrive,
    ArrowLeft,
    Star
} from 'lucide-react';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { enrichNodesWithStakingData, formatBytes } from '@/lib/services/analyticsService';
import { cn } from '@/lib/utils';

export default function WatchlistPage() {
    const router = useRouter();
    const { nodes, isLoading, isError } = useNodes();
    const { favorites, removeFavorite, clearFavorites, favoritesCount } = useFavoritesContext();
    const { creditsMap } = useCredits();
    const { issueCount } = useNetworkStats(nodes);

    // Enrich nodes with credits and staking data
    const enrichedNodes = useMemo(() => {
        const withStaking = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStaking, creditsMap);
    }, [nodes, creditsMap]);

    // Get only favorite nodes, maintaining order
    const favoriteNodes = useMemo(() => {
        return favorites
            .map(id => enrichedNodes.find(n => n.id === id))
            .filter(Boolean) as typeof enrichedNodes;
    }, [favorites, enrichedNodes]);

    // Get location data
    const { nodesWithLocation } = useNodeLocations(favoriteNodes);

    const formatNumber = (num: number) => {
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header issueCount={issueCount} />

            <main className="flex-1 container px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-tour="watchlist-header">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="-ml-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Star className="h-6 w-6 text-amber-500" />
                            My Watchlist
                        </h1>
                        <p className="text-muted-foreground">
                            {favoritesCount} node{favoritesCount !== 1 ? 's' : ''} saved
                        </p>
                    </div>
                    {favoritesCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFavorites}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                    </div>
                ) : favoritesCount === 0 ? (
                    <Card className="py-12">
                        <CardContent className="text-center space-y-4">
                            <HeartOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">No Nodes Saved</h2>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Add nodes to your watchlist by clicking the heart icon on any node in the dashboard or node details page.
                                </p>
                            </div>
                            <Button onClick={() => router.push('/')}>
                                Browse Nodes
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-tour="watchlist-nodes">
                        {nodesWithLocation.map((node) => (
                            <Card
                                key={node.id}
                                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => router.push(`/nodes/${node.id}`)}
                            >
                                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <CardTitle className="text-sm font-mono truncate pr-2">
                                            {node.id}
                                        </CardTitle>
                                        <StatusBadge status={node.status} size="sm" showLabel />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(node.id);
                                        }}
                                    >
                                        <Heart className="h-4 w-4 fill-current" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Location */}
                                    {node.location && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">
                                                {node.location.city}, {node.location.country}
                                            </span>
                                        </div>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-muted/50 rounded-lg">
                                            <Activity className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                            <p className="text-xs font-medium">{node.uptime.toFixed(1)}%</p>
                                            <p className="text-[10px] text-muted-foreground">Uptime</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded-lg">
                                            <Coins className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                            <p className="text-xs font-medium">{formatNumber(node.credits || 0)}</p>
                                            <p className="text-[10px] text-muted-foreground">Credits</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded-lg">
                                            <HardDrive className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                                            <p className="text-xs font-medium">{formatBytes(node.storage?.total || 0)}</p>
                                            <p className="text-[10px] text-muted-foreground">Storage</p>
                                        </div>
                                    </div>

                                    {/* View Details Link */}
                                    <div className="flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details <ExternalLink className="h-3 w-3 ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
