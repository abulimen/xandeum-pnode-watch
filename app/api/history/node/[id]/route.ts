/**
 * Node History API Route
 * Returns historical data for a specific node
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodeHistory } from '@/lib/db/queries';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: nodeId } = await params;

        if (!nodeId) {
            return NextResponse.json(
                { success: false, error: 'Node ID is required' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7', 10);

        // Limit to reasonable range
        const limitedDays = Math.min(Math.max(days, 1), 30);

        const history = getNodeHistory(nodeId, limitedDays);

        if (history.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                summary: null,
                message: 'No historical data found for this node',
            });
        }

        // Transform for frontend charts
        const chartData = history.map(record => ({
            timestamp: record.timestamp,
            status: record.status,
            uptimePercent: Math.round(record.uptime_percent * 10) / 10,
            storageUsagePercent: Math.round(record.storage_usage_percent * 10) / 10,
            stakingScore: Math.round(record.staking_score * 10) / 10,
            version: record.version,
        }));

        // Calculate summary statistics
        const onlineCount = chartData.filter(d => d.status === 'online').length;
        const avgScore = chartData.reduce((sum, d) => sum + d.stakingScore, 0) / chartData.length;
        const avgUptime = chartData.reduce((sum, d) => sum + d.uptimePercent, 0) / chartData.length;

        const summary = {
            nodeId,
            dataPoints: chartData.length,
            periodDays: limitedDays,
            firstSnapshot: chartData[0]?.timestamp,
            lastSnapshot: chartData[chartData.length - 1]?.timestamp,
            onlinePercent: Math.round((onlineCount / chartData.length) * 1000) / 10,
            avgStakingScore: Math.round(avgScore * 10) / 10,
            minStakingScore: Math.round(Math.min(...chartData.map(d => d.stakingScore)) * 10) / 10,
            maxStakingScore: Math.round(Math.max(...chartData.map(d => d.stakingScore)) * 10) / 10,
            avgUptime: Math.round(avgUptime * 10) / 10,
            latestVersion: chartData[chartData.length - 1]?.version,
        };

        return NextResponse.json({
            success: true,
            data: chartData,
            summary,
        });

    } catch (error: any) {
        console.error('[history/node] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch node history' },
            { status: 500 }
        );
    }
}
