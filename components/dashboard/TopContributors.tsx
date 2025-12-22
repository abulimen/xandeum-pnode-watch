/**
 * TopContributors Component
 * Shows top network contributors with tier-based display
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { Trophy, ChevronRight, MapPin, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PNode } from '@/types/pnode';
import { getTopContributors, TIER_INFO, ContributionScore } from '@/lib/services/contributionService';
import { calculateBadges } from '@/lib/services/badgeService';

// Custom tier icons as SVG
const TierIcon = ({ tier, className }: { tier: ContributionScore['tier']; className?: string }) => {
    const info = TIER_INFO[tier];

    switch (tier) {
        case 'diamond':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 9L12 22L22 9L12 2Z" fill={info.color} stroke={info.color} strokeWidth="1.5" />
                    <path d="M12 2L7 9H17L12 2Z" fill="white" fillOpacity="0.3" />
                </svg>
            );
        case 'platinum':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={info.color} stroke="#888" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="6" fill="white" fillOpacity="0.3" />
                </svg>
            );
        case 'gold':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill={info.color} stroke={info.color} strokeWidth="1.5" />
                </svg>
            );
        case 'silver':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={info.color} stroke="#999" strokeWidth="1.5" />
                    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#666" fontWeight="bold">2</text>
                </svg>
            );
        case 'bronze':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={info.color} stroke="#8B4513" strokeWidth="1.5" />
                    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">3</text>
                </svg>
            );
    }
};

interface TopContributorsProps {
    nodes: PNode[];
    isLoading?: boolean;
    className?: string;
}

export function TopContributors({ nodes, isLoading, className }: TopContributorsProps) {
    const topContributors = useMemo(() => {
        if (!nodes.length) return [];
        return getTopContributors(nodes, 5);
    }, [nodes]);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Top Contributors
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-6 w-12" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Top Contributors
                        </CardTitle>
                        <CardDescription>
                            Network leaders by contribution score
                        </CardDescription>
                    </div>
                    <Link href="/leaderboard">
                        <Button variant="ghost" size="sm" className="gap-1">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {topContributors.map(({ node, score }, index) => {
                    const badges = calculateBadges(node, nodes);
                    const tierInfo = TIER_INFO[score.tier];

                    return (
                        <Link
                            key={node.id}
                            href={`/nodes/${node.id}`}
                            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                            {/* Rank & Tier */}
                            <div className="relative">
                                <div
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                                        tierInfo.bgColor
                                    )}
                                    style={{ color: tierInfo.color }}
                                >
                                    {index + 1}
                                </div>
                                <div className="absolute -bottom-1 -right-1">
                                    <TierIcon tier={score.tier} className="h-4 w-4" />
                                </div>
                            </div>

                            {/* Node Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-medium truncate max-w-[120px]">
                                        {node.id}
                                    </span>
                                    <StatusBadge status={node.status} size="sm" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {node.location?.country && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {node.location.country}
                                        </span>
                                    )}
                                    <BadgeDisplay badges={badges} size="sm" maxDisplay={3} />
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right shrink-0">
                                <div className="font-bold text-sm">{score.total.toFixed(0)}</div>
                                <div className="text-xs text-muted-foreground">
                                    Top {100 - score.percentile}%
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
