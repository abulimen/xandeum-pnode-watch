/**
 * PublicVsPrivateChart Component - Shows public vs private node distribution
 */

'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PNode } from '@/types/pnode';
import { Shield, ShieldOff } from 'lucide-react';

interface PublicVsPrivateChartProps {
    nodes: PNode[];
    isLoading?: boolean;
}

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium flex items-center gap-2">
                {data.name === 'Public' ? (
                    <Shield className="h-4 w-4 text-emerald-500" />
                ) : (
                    <ShieldOff className="h-4 w-4 text-amber-500" />
                )}
                {data.name}
            </p>
            <p className="text-sm text-muted-foreground">
                {data.value} nodes ({data.percentage.toFixed(1)}%)
            </p>
        </div>
    );
}

const COLORS = ['#10b981', '#f59e0b'];

export function PublicVsPrivateChart({ nodes, isLoading }: PublicVsPrivateChartProps) {
    const data = useMemo(() => {
        const publicNodes = nodes.filter(n => n.isPublic).length;
        const privateNodes = nodes.length - publicNodes;
        const total = nodes.length;

        return [
            {
                name: 'Public',
                value: publicNodes,
                percentage: total > 0 ? (publicNodes / total) * 100 : 0
            },
            {
                name: 'Private',
                value: privateNodes,
                percentage: total > 0 ? (privateNodes / total) * 100 : 0
            },
        ];
    }, [nodes]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    Public vs Private
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Public nodes expose detailed metrics
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                label={(props: any) => `${props.value}`}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(value) => <span className="text-sm">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
