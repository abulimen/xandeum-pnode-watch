/**
 * UptimeDistributionChart Component - Shows distribution of node uptimes using REAL data
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

interface UptimeDistributionChartProps {
    nodes: PNode[];
    isLoading?: boolean;
}

const UPTIME_BUCKETS = [
    { range: '99-100%', min: 99, max: 101, color: '#10b981', label: 'Elite' }, // max > 100 to include 100%
    { range: '95-99%', min: 95, max: 99, color: '#22c55e', label: 'Reliable' },
    { range: '90-95%', min: 90, max: 95, color: '#84cc16', label: 'Good' },
    { range: '80-90%', min: 80, max: 90, color: '#f59e0b', label: 'Average' },
    { range: '50-80%', min: 50, max: 80, color: '#f97316', label: 'Below Avg' },
    { range: '<50%', min: 0, max: 50, color: '#ef4444', label: 'Poor' },
];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium">{data.range}</p>
            <p className="text-sm" style={{ color: data.color }}>
                {data.count} nodes ({data.percentage.toFixed(1)}%)
            </p>
            <p className="text-xs text-muted-foreground">{data.label}</p>
        </div>
    );
}

export function UptimeDistributionChart({ nodes, isLoading }: UptimeDistributionChartProps) {
    const data = useMemo(() => {
        const total = nodes.length;

        return UPTIME_BUCKETS.map(bucket => {
            const count = nodes.filter(n =>
                n.uptime >= bucket.min && n.uptime < bucket.max
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

    const eliteCount = data.find(d => d.range === '99-100%')?.count || 0;
    const reliableCount = data.find(d => d.range === '95-99%')?.count || 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Uptime Distribution (24h)</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {eliteCount} elite (99%+) • {reliableCount} reliable (95-99%)
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="range"
                                type="category"
                                tick={{ fontSize: 11 }}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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
