/**
 * VersionDistributionChart Component - Shows distribution of node versions
 */

'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PNode } from '@/types/pnode';

interface VersionDistributionChartProps {
    nodes: PNode[];
    isLoading?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium">{data.version}</p>
            <p className="text-sm text-muted-foreground">
                {data.count} nodes ({data.percentage.toFixed(1)}%)
            </p>
        </div>
    );
}

export function VersionDistributionChart({ nodes, isLoading }: VersionDistributionChartProps) {
    const data = useMemo(() => {
        const versionCounts: Record<string, number> = {};

        nodes.forEach(node => {
            const version = node.version || 'unknown';
            versionCounts[version] = (versionCounts[version] || 0) + 1;
        });

        return Object.entries(versionCounts)
            .map(([version, count]) => ({
                version,
                count,
                percentage: (count / nodes.length) * 100,
            }))
            .sort((a, b) => b.count - a.count);
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Version Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Chart - smaller on mobile */}
                <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="version"
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                innerRadius={25}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom legend - better for mobile */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {data.slice(0, 6).map((entry, index) => (
                        <div
                            key={entry.version}
                            className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md"
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate max-w-[80px] sm:max-w-[120px]" title={entry.version}>
                                {entry.version}
                            </span>
                            <span className="text-muted-foreground">
                                ({entry.percentage.toFixed(0)}%)
                            </span>
                        </div>
                    ))}
                    {data.length > 6 && (
                        <div className="text-xs text-muted-foreground px-2 py-1">
                            +{data.length - 6} more
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
