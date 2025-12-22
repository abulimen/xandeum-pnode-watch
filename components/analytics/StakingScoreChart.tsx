/**
 * StakingScoreChart Component - Shows distribution of staking scores
 */

'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PNode } from '@/types/pnode';

interface StakingScoreChartProps {
    nodes: PNode[];
    isLoading?: boolean;
}

const SCORE_BUCKETS = [
    { range: '90-100', min: 90, max: 101, color: '#10b981', label: 'Excellent' },
    { range: '80-90', min: 80, max: 90, color: '#22c55e', label: 'Very Good' },
    { range: '70-80', min: 70, max: 80, color: '#84cc16', label: 'Good' },
    { range: '60-70', min: 60, max: 70, color: '#f59e0b', label: 'Average' },
    { range: '50-60', min: 50, max: 60, color: '#f97316', label: 'Below Avg' },
    { range: '<50', min: 0, max: 50, color: '#ef4444', label: 'Needs Review' },
];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium">Score: {data.range}</p>
            <p className="text-sm" style={{ color: data.color }}>
                {data.count} nodes ({data.percentage.toFixed(1)}%)
            </p>
            <p className="text-xs text-muted-foreground">{data.label}</p>
        </div>
    );
}

export function StakingScoreChart({ nodes, isLoading }: StakingScoreChartProps) {
    const data = useMemo(() => {
        const nodesWithScore = nodes.filter(n => n.stakingScore !== undefined);
        const total = nodesWithScore.length;

        return SCORE_BUCKETS.map(bucket => {
            const count = nodesWithScore.filter(n =>
                (n.stakingScore || 0) >= bucket.min && (n.stakingScore || 0) < bucket.max
            ).length;

            return {
                range: bucket.range,
                count,
                color: bucket.color,
                label: bucket.label,
                percentage: total > 0 ? (count / total) * 100 : 0,
            };
        });
    }, [nodes]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const excellentCount = data[0].count + data[1].count;
    const avgScore = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + (n.stakingScore || 0), 0) / nodes.filter(n => n.stakingScore).length
        : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Staking Score Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Avg score: {avgScore.toFixed(1)} • {excellentCount} excellent (80+)
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
