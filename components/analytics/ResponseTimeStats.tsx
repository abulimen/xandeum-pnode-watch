/**
 * Response Time Stats Component
 * Shows response time distribution across nodes
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface ResponseTimeStatsProps {
    nodes: PNode[];
    isLoading?: boolean;
}

export function ResponseTimeStats({ nodes, isLoading }: ResponseTimeStatsProps) {
    const stats = useMemo(() => {
        const responseTimes = nodes
            .filter(n => n.responseTime && n.responseTime > 0)
            .map(n => n.responseTime);

        if (responseTimes.length === 0) {
            return { avg: 0, min: 0, max: 0, median: 0, fast: 0, slow: 0, distribution: [] };
        }

        responseTimes.sort((a, b) => a - b);

        const sum = responseTimes.reduce((a, b) => a + b, 0);
        const avg = sum / responseTimes.length;
        const min = responseTimes[0];
        const max = responseTimes[responseTimes.length - 1];
        const medianIdx = Math.floor(responseTimes.length / 2);
        const median = responseTimes[medianIdx];

        // Count by buckets
        const fast = responseTimes.filter(t => t < 100).length;
        const medium = responseTimes.filter(t => t >= 100 && t < 500).length;
        const slow = responseTimes.filter(t => t >= 500).length;

        const distribution = [
            { label: '<100ms', count: fast, color: 'bg-emerald-500', percent: (fast / responseTimes.length) * 100 },
            { label: '100-500ms', count: medium, color: 'bg-amber-500', percent: (medium / responseTimes.length) * 100 },
            { label: '>500ms', count: slow, color: 'bg-red-500', percent: (slow / responseTimes.length) * 100 },
        ];

        return { avg, min, max, median, fast, slow, distribution };
    }, [nodes]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4" />
                        Response Times
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-16" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Response Times
                </CardTitle>
                <CardDescription>
                    Network latency analysis
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Key stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Average</p>
                        <p className="text-lg font-bold">{Math.round(stats.avg)}ms</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Median</p>
                        <p className="text-lg font-bold">{Math.round(stats.median)}ms</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-3">
                        <p className="text-xs text-emerald-600">Fastest</p>
                        <p className="text-lg font-bold text-emerald-600">{stats.min}ms</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                        <p className="text-xs text-red-600">Slowest</p>
                        <p className="text-lg font-bold text-red-600">{stats.max}ms</p>
                    </div>
                </div>

                {/* Distribution bar */}
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Distribution</p>
                    <div className="flex h-3 rounded-full overflow-hidden">
                        {stats.distribution.map((bucket) => (
                            <div
                                key={bucket.label}
                                className={cn("transition-all", bucket.color)}
                                style={{ width: `${bucket.percent}%` }}
                                title={`${bucket.label}: ${bucket.count} nodes`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        {stats.distribution.map((bucket) => (
                            <div key={bucket.label} className="flex items-center gap-1">
                                <div className={cn("w-2 h-2 rounded-full", bucket.color)} />
                                <span>{bucket.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
