/**
 * Network Health Score Component
 * Shows overall network health as a visual gauge
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface NetworkHealthScoreProps {
    nodes: PNode[];
    avgCredits: number;
    isLoading?: boolean;
}

type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

export function NetworkHealthScore({ nodes, avgCredits, isLoading }: NetworkHealthScoreProps) {
    const health = useMemo(() => {
        if (!nodes.length) return { score: 0, status: 'unknown' as HealthStatus, metrics: [] };

        const online = nodes.filter(n => n.status === 'online').length;
        const onlinePercent = (online / nodes.length) * 100;

        const avgUptime = nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length;

        const eliteNodes = nodes.filter(n => n.uptime >= 99.5).length;
        const elitePercent = (eliteNodes / nodes.length) * 100;

        // Calculate composite score (0-100)
        const score = (
            (onlinePercent * 0.4) +      // 40% weight for online nodes
            (avgUptime * 0.4) +          // 40% weight for average uptime
            (Math.min(elitePercent * 2, 20)) // 20% bonus for elite nodes
        );

        const status: HealthStatus = score >= 90 ? 'excellent' :
            score >= 75 ? 'good' :
                score >= 50 ? 'fair' : 'poor';

        const metrics = [
            { label: 'Online Nodes', value: `${online}/${nodes.length}`, percent: onlinePercent },
            { label: 'Avg Uptime (24h)', value: `${avgUptime.toFixed(1)}%`, percent: avgUptime },
            { label: 'Elite Nodes (99.5%+ uptime)', value: `${eliteNodes}`, percent: elitePercent },
            { label: 'Avg Credits', value: avgCredits.toLocaleString(), percent: Math.min(100, avgCredits / 500) },
        ];

        return { score: Math.round(score), status, metrics };
    }, [nodes, avgCredits]);

    const statusConfig = {
        excellent: { color: 'text-emerald-500', bg: 'bg-emerald-500', icon: CheckCircle, label: 'Excellent' },
        good: { color: 'text-blue-500', bg: 'bg-blue-500', icon: CheckCircle, label: 'Good' },
        fair: { color: 'text-amber-500', bg: 'bg-amber-500', icon: AlertTriangle, label: 'Fair' },
        poor: { color: 'text-red-500', bg: 'bg-red-500', icon: XCircle, label: 'Poor' },
        unknown: { color: 'text-muted-foreground', bg: 'bg-muted', icon: Activity, label: 'Loading' },
    };

    const config = statusConfig[health.status];
    const StatusIcon = config.icon;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4" />
                        Network Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-primary" />
                    Network Health
                </CardTitle>
                <CardDescription>
                    Overall network performance score
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Score Circle */}
                <div className="flex items-center justify-center py-4">
                    <div className="relative">
                        {/* Background circle */}
                        <svg className="h-28 w-28 -rotate-90">
                            <circle
                                cx="56"
                                cy="56"
                                r="48"
                                fill="none"
                                stroke="currentColor"
                                className="text-muted"
                                strokeWidth="8"
                            />
                            <circle
                                cx="56"
                                cy="56"
                                r="48"
                                fill="none"
                                stroke="currentColor"
                                className={config.color}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${health.score * 3.02} 302`}
                            />
                        </svg>
                        {/* Score text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn("text-3xl font-bold", config.color)}>
                                {health.score}
                            </span>
                            <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <StatusIcon className={cn("h-4 w-4", config.color)} />
                    <span className={cn("font-medium", config.color)}>{config.label}</span>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                    {health.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{metric.label}</span>
                            <span className="font-medium">{metric.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
