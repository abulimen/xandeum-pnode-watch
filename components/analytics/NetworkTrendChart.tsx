/**
 * NetworkTrendChart Component
 * Displays historical network statistics with line charts
 */

'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Activity, HardDrive } from 'lucide-react';
import { useNetworkHistory } from '@/hooks/useHistory';

interface NetworkTrendChartProps {
    days?: number;
    type?: 'nodes' | 'score' | 'storage';
}

export function NetworkTrendChart({ days = 7, type = 'nodes' }: NetworkTrendChartProps) {
    const { data, isLoading, error } = useNetworkHistory(days);

    const chartData = useMemo(() => {
        if (!data?.data) return [];

        return data.data.map(point => ({
            ...point,
            // Format timestamp for display
            time: new Date(point.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
            }),
        }));
    }, [data]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data?.success) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Network Trends
                    </CardTitle>
                    <CardDescription>Historical data visualization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        <p>No historical data available yet. Data will appear after the first snapshot.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Network Trends
                    </CardTitle>
                    <CardDescription>Historical data visualization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        <p>Run the cron job to start collecting historical data.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Different chart configurations based on type
    const chartConfig = {
        nodes: {
            title: 'Node Status Over Time',
            description: 'Online, degraded, and offline node counts',
            icon: Activity,
            lines: [
                { key: 'onlineNodes', name: 'Online', color: '#22c55e' },
                { key: 'degradedNodes', name: 'Degraded', color: '#f59e0b' },
                { key: 'offlineNodes', name: 'Offline', color: '#ef4444' },
            ],
        },
        score: {
            title: 'Average Staking Score',
            description: 'Network-wide average performance score',
            icon: TrendingUp,
            lines: [
                { key: 'avgStakingScore', name: 'Avg Score', color: '#8b5cf6' },
            ],
        },
        storage: {
            title: 'Storage Utilization',
            description: 'Total vs used network storage capacity',
            icon: HardDrive,
            lines: [
                { key: 'totalStorageTB', name: 'Total (TB)', color: '#3b82f6' },
                { key: 'usedStorageTB', name: 'Used (TB)', color: '#06b6d4' },
            ],
        },
    };

    const config = chartConfig[type];
    const Icon = config.icon;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            {config.title}
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                    </div>
                    {data.summary && (
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            {data.summary.dataPoints} points
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {config.lines.map(line => (
                                    <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                itemStyle={{ fontSize: '12px' }}
                                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500, marginBottom: '4px' }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '10px' }}
                            />
                            {config.lines.map(line => (
                                <Area
                                    key={line.key}
                                    type="monotone"
                                    dataKey={line.key}
                                    name={line.name}
                                    stroke={line.color}
                                    fill={`url(#gradient-${line.key})`}
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
