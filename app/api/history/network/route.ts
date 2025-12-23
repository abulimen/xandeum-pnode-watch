/**
 * Network History API Route
 * Returns historical network statistics for trend charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkHistory, getLatestSnapshot } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7', 10);

        // Limit to reasonable range
        const limitedDays = Math.min(Math.max(days, 1), 30);

        const history = await getNetworkHistory(limitedDays);
        const latest = await getLatestSnapshot();

        // Transform for frontend charts
        const chartData = history.map(snapshot => ({
            timestamp: snapshot.timestamp,
            totalNodes: snapshot.total_nodes,
            onlineNodes: snapshot.online_nodes,
            degradedNodes: snapshot.degraded_nodes,
            offlineNodes: snapshot.offline_nodes,
            onlinePercent: snapshot.total_nodes > 0
                ? Math.round((snapshot.online_nodes / snapshot.total_nodes) * 1000) / 10
                : 0,
            totalStorageTB: Math.round(snapshot.total_storage_bytes / (1024 ** 4) * 100) / 100,
            usedStorageTB: Math.round(snapshot.used_storage_bytes / (1024 ** 4) * 100) / 100,
            storageUtilization: snapshot.total_storage_bytes > 0
                ? Math.round((snapshot.used_storage_bytes / snapshot.total_storage_bytes) * 1000) / 10
                : 0,
            avgUptime: Math.round(snapshot.avg_uptime * 10) / 10,
            avgStakingScore: Math.round(snapshot.avg_staking_score * 10) / 10,
        }));

        // Calculate summary statistics
        const summary = history.length > 0 ? {
            dataPoints: history.length,
            periodDays: limitedDays,
            firstSnapshot: history[0]?.timestamp,
            lastSnapshot: history[history.length - 1]?.timestamp,
            avgOnlinePercent: Math.round(
                chartData.reduce((sum, d) => sum + d.onlinePercent, 0) / chartData.length * 10
            ) / 10,
            avgStakingScore: Math.round(
                chartData.reduce((sum, d) => sum + d.avgStakingScore, 0) / chartData.length * 10
            ) / 10,
            minNodes: Math.min(...chartData.map(d => d.totalNodes)),
            maxNodes: Math.max(...chartData.map(d => d.totalNodes)),
        } : null;

        return NextResponse.json({
            success: true,
            data: chartData,
            summary,
            latest: latest ? {
                timestamp: latest.timestamp,
                totalNodes: latest.total_nodes,
                onlineNodes: latest.online_nodes,
                avgStakingScore: Math.round(latest.avg_staking_score * 10) / 10,
            } : null,
        });

    } catch (error: any) {
        console.error('[history/network] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
