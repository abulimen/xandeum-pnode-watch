/**
 * StorageDistributionChart Component - Shows storage committed by top nodes
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
    TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PNode } from '@/types/pnode';
import { formatBytes } from '@/lib/services/analyticsService';

interface StorageDistributionChartProps {
    nodes: PNode[];
    isLoading?: boolean;
    limit?: number;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-emerald-500">
                Committed: {formatBytes(data.committed)}
            </p>
            <p className="text-sm text-blue-500">
                Used: {formatBytes(data.used)}
            </p>
            <p className="text-sm text-muted-foreground">
                Utilization: {data.utilization.toFixed(2)}%
            </p>
        </div>
    );
}

export function StorageDistributionChart({ nodes, isLoading, limit = 10 }: StorageDistributionChartProps) {
    const data = useMemo(() => {
        return nodes
            .filter(n => n.storage.total > 0)
            .sort((a, b) => b.storage.total - a.storage.total)
            .slice(0, limit)
            .map(node => ({
                nodeId: node.id,
                committed: node.storage.total,
                used: node.storage.used,
                utilization: node.storage.usagePercent || 0,
                // Convert to GB for display
                committedGB: node.storage.total / (1024 ** 3),
                usedGB: node.storage.used / (1024 ** 3),
            }));
    }, [nodes, limit]);

    const totalStorage = useMemo(() => {
        return nodes.reduce((sum, n) => sum + n.storage.total, 0);
    }, [nodes]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Nodes by Storage Committed</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Total network storage: {formatBytes(totalStorage)}
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="nodeId"
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value) => `${value.toFixed(0)} GB`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="committedGB"
                                fill="#10b981"
                                name="Committed"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
