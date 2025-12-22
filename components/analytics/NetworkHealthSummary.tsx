/**
 * NetworkHealthSummary Component
 * Shows summary stats from historical data
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Activity, Database, Award } from 'lucide-react';
import { useNetworkHistory } from '@/hooks/useHistory';
import { cn } from '@/lib/utils';

interface NetworkHealthSummaryProps {
    days?: number;
}

export function NetworkHealthSummary({ days = 7 }: NetworkHealthSummaryProps) {
    const { data, isLoading } = useNetworkHistory(days);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardContent className="pt-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!data?.success || !data.summary) {
        return null;
    }

    const { summary, latest } = data;
    const chartData = data.data;

    // Calculate trends (compare first half vs second half)
    const midpoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, midpoint);
    const secondHalf = chartData.slice(midpoint);

    const avgFirst = firstHalf.length > 0
        ? firstHalf.reduce((sum, d) => sum + d.avgStakingScore, 0) / firstHalf.length
        : 0;
    const avgSecond = secondHalf.length > 0
        ? secondHalf.reduce((sum, d) => sum + d.avgStakingScore, 0) / secondHalf.length
        : 0;

    const scoreTrend = avgSecond - avgFirst;

    const avgOnlineFirst = firstHalf.length > 0
        ? firstHalf.reduce((sum, d) => sum + d.onlinePercent, 0) / firstHalf.length
        : 0;
    const avgOnlineSecond = secondHalf.length > 0
        ? secondHalf.reduce((sum, d) => sum + d.onlinePercent, 0) / secondHalf.length
        : 0;

    const onlineTrend = avgOnlineSecond - avgOnlineFirst;

    const stats = [
        {
            label: 'Avg Online Rate',
            value: `${summary.avgOnlinePercent.toFixed(1)}%`,
            icon: Activity,
            trend: onlineTrend,
            trendLabel: onlineTrend > 0 ? 'improving' : onlineTrend < 0 ? 'declining' : 'stable',
            subtitle: `last ${days} days`,
        },
        {
            label: 'Avg Staking Score',
            value: summary.avgStakingScore.toFixed(1),
            icon: Award,
            trend: scoreTrend,
            trendLabel: scoreTrend > 0 ? 'improving' : scoreTrend < 0 ? 'declining' : 'stable',
            subtitle: `last ${days} days`,
        },
        {
            label: 'Node Range',
            value: `${summary.minNodes} - ${summary.maxNodes}`,
            icon: Database,
            trend: null,
            trendLabel: 'nodes',
            subtitle: `last ${days} days`,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === null
                    ? null
                    : stat.trend > 0.5
                        ? TrendingUp
                        : stat.trend < -0.5
                            ? TrendingDown
                            : Minus;

                return (
                    <Card key={index}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                                    <span className="text-xs text-muted-foreground/70 ml-1">({stat.subtitle})</span>
                                </div>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{stat.value}</span>
                                {TrendIcon && (
                                    <span className={cn(
                                        'flex items-center text-xs',
                                        stat.trend && stat.trend > 0 ? 'text-green-500' : '',
                                        stat.trend && stat.trend < 0 ? 'text-red-500' : '',
                                        stat.trend === 0 ? 'text-muted-foreground' : ''
                                    )}>
                                        <TrendIcon className="h-3 w-3 mr-0.5" />
                                        {stat.trendLabel}
                                    </span>
                                )}
                                {!TrendIcon && (
                                    <span className="text-xs text-muted-foreground">{stat.trendLabel}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
