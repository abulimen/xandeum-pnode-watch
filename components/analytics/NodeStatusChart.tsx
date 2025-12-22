/**
 * NodeStatusChart Component - Shows distribution of node statuses
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
    TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PNode } from '@/types/pnode';

interface NodeStatusChartProps {
    nodes: PNode[];
    isLoading?: boolean;
}

const STATUS_COLORS = {
    online: '#10b981',
    degraded: '#f59e0b',
    offline: '#ef4444',
};

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium capitalize">{label}</p>
            <p className="text-sm" style={{ color: payload[0].payload.fill }}>
                {payload[0].value} nodes
            </p>
        </div>
    );
}

export function NodeStatusChart({ nodes, isLoading }: NodeStatusChartProps) {
    const data = useMemo(() => {
        const online = nodes.filter(n => n.status === 'online').length;
        const degraded = nodes.filter(n => n.status === 'degraded').length;
        const offline = nodes.filter(n => n.status === 'offline').length;

        return [
            { status: 'Online', count: online, fill: STATUS_COLORS.online },
            { status: 'Degraded', count: degraded, fill: STATUS_COLORS.degraded },
            { status: 'Offline', count: offline, fill: STATUS_COLORS.offline },
        ];
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

    const total = nodes.length;
    const online = data[0].count;
    const onlinePercent = total > 0 ? ((online / total) * 100).toFixed(1) : '0';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Node Status Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {online} of {total} nodes online ({onlinePercent}%)
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="status"
                                type="category"
                                tick={{ fontSize: 12 }}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
