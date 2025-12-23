/**
 * Historical Snapshots API Route
 * Returns network snapshots for trend analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkHistory, getLatestSnapshot, getPreviousSnapshot } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        // Parse range to days
        let days = 7;
        if (range === '24h') days = 1;
        else if (range === '7d') days = 7;
        else if (range === '30d') days = 30;
        else if (range === '90d') days = 90;

        const snapshots = await getNetworkHistory(days);
        const latest = await getLatestSnapshot();
        const previous = await getPreviousSnapshot();

        // Calculate trends (compare latest to previous)
        let trends = null;
        if (latest && previous) {
            trends = {
                nodeCountChange: latest.total_nodes - previous.total_nodes,
                onlineChange: latest.online_nodes - previous.online_nodes,
                uptimeChange: latest.avg_uptime - previous.avg_uptime,
                stakingScoreChange: latest.avg_staking_score - previous.avg_staking_score,
                storageChange: latest.total_storage_bytes - previous.total_storage_bytes,
            };
        }

        // Format for frontend
        const formattedSnapshots = snapshots.map(s => ({
            id: s.id,
            timestamp: s.timestamp,
            totalNodes: s.total_nodes,
            onlineNodes: s.online_nodes,
            offlineNodes: s.offline_nodes,
            degradedNodes: s.degraded_nodes,
            totalStorage: s.total_storage_bytes,
            usedStorage: s.used_storage_bytes,
            avgUptime: s.avg_uptime,
            avgStakingScore: s.avg_staking_score,
            // Calculated fields
            onlinePercentage: s.total_nodes > 0
                ? ((s.online_nodes / s.total_nodes) * 100).toFixed(1)
                : '0',
            storageUtilization: s.total_storage_bytes > 0
                ? ((s.used_storage_bytes / s.total_storage_bytes) * 100).toFixed(1)
                : '0',
        }));

        return NextResponse.json({
            success: true,
            data: {
                snapshots: formattedSnapshots,
                latest: latest ? {
                    totalNodes: latest.total_nodes,
                    onlineNodes: latest.online_nodes,
                    avgUptime: latest.avg_uptime,
                    avgStakingScore: latest.avg_staking_score,
                    timestamp: latest.timestamp,
                } : null,
                trends,
                range,
                count: snapshots.length,
            },
        });

    } catch (error) {
        console.error('[history/snapshots] Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
