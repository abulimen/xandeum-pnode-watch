/**
 * Alert Processing Service
 * Processes snapshots and sends alerts to subscribers
 */

import {
    getSubscriptionsForNode,
    wasAlertSentRecently,
    recordAlertSent,
    getPreviousSnapshot,
    getNodesFromSnapshot,
    NodeSnapshotRecord,
    insertUserAlert
} from '@/lib/db/queries';
import { sendNodeOfflineAlert, sendScoreDropAlert } from './notificationService';

type TransformedNode = {
    node_id: string;
    public_key?: string;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    version?: string;
    is_public: boolean;
};

interface AlertStats {
    offlineAlerts: number;
    scoreDropAlerts: number;
    errors: number;
}

/**
 * Process alerts after a new snapshot is created
 * Compares current state with previous snapshot to detect changes
 */
export async function processAlerts(
    currentNodes: TransformedNode[],
    baseUrl?: string
): Promise<AlertStats> {
    const stats: AlertStats = {
        offlineAlerts: 0,
        scoreDropAlerts: 0,
        errors: 0,
    };

    try {
        // Get previous snapshot for comparison
        const previousSnapshot = getPreviousSnapshot();
        if (!previousSnapshot) {
            console.log('[alerts] No previous snapshot for comparison, skipping alerts');
            return stats;
        }

        const previousNodes = getNodesFromSnapshot(previousSnapshot.id);
        const previousNodeMap = new Map<string, NodeSnapshotRecord>();
        previousNodes.forEach(n => previousNodeMap.set(n.node_id, n));

        // Check each current node
        for (const currentNode of currentNodes) {
            const previousNode = previousNodeMap.get(currentNode.node_id);

            // Get subscriptions for this node
            const subscriptions = getSubscriptionsForNode(currentNode.node_id);
            if (subscriptions.length === 0) continue;

            // Check if node went offline
            if (currentNode.status === 'offline' && previousNode?.status !== 'offline') {
                for (const sub of subscriptions) {
                    if (!sub.alert_offline) continue;

                    // Check if we already sent an alert recently
                    if (wasAlertSentRecently(sub.id, currentNode.node_id, 'offline', 6)) {
                        continue;
                    }

                    try {
                        const nodeUrl = baseUrl ? `${baseUrl}/nodes/${currentNode.node_id}` : undefined;

                        await sendNodeOfflineAlert({
                            email: sub.email || undefined,
                            pushSubscription: sub.push_endpoint ? {
                                endpoint: sub.push_endpoint,
                                p256dh: sub.push_p256dh || '',
                                auth: sub.push_auth || '',
                            } : undefined,
                            nodeId: currentNode.node_id,
                            nodeName: currentNode.node_id,
                            dashboardUrl: nodeUrl,
                        });

                        recordAlertSent(sub.id, currentNode.node_id, 'offline');

                        // Store in user_alerts for bell icon display
                        insertUserAlert({
                            subscription_id: sub.id,
                            node_id: currentNode.node_id,
                            alert_type: 'offline',
                            title: 'Node Offline',
                            message: `Node ${currentNode.node_id.slice(0, 8)}... has gone offline.`
                        });

                        stats.offlineAlerts++;
                        console.log(`[alerts] Sent offline alert for ${currentNode.node_id} to ${sub.email || 'push'}`);
                    } catch (error) {
                        console.error(`[alerts] Error sending offline alert:`, error);
                        stats.errors++;
                    }
                }
            }

            // Check for score drop
            if (previousNode) {
                for (const sub of subscriptions) {
                    if (!sub.alert_score_drop) continue;

                    const threshold = sub.score_threshold || 70;
                    const oldScore = previousNode.staking_score;
                    const newScore = currentNode.staking_score;

                    // Alert if score dropped below threshold
                    if (oldScore >= threshold && newScore < threshold) {
                        if (wasAlertSentRecently(sub.id, currentNode.node_id, 'score_drop', 6)) {
                            continue;
                        }

                        try {
                            const nodeUrl = baseUrl ? `${baseUrl}/nodes/${currentNode.node_id}` : undefined;

                            await sendScoreDropAlert({
                                email: sub.email || undefined,
                                pushSubscription: sub.push_endpoint ? {
                                    endpoint: sub.push_endpoint,
                                    p256dh: sub.push_p256dh || '',
                                    auth: sub.push_auth || '',
                                } : undefined,
                                nodeId: currentNode.node_id,
                                nodeName: currentNode.node_id,
                                oldScore,
                                newScore,
                                threshold,
                                dashboardUrl: nodeUrl,
                            });

                            recordAlertSent(sub.id, currentNode.node_id, 'score_drop');

                            // Store in user_alerts for bell icon display
                            insertUserAlert({
                                subscription_id: sub.id,
                                node_id: currentNode.node_id,
                                alert_type: 'score_drop',
                                title: 'Score Dropped',
                                message: `Node ${currentNode.node_id.slice(0, 8)}... score dropped from ${oldScore.toFixed(0)} to ${newScore.toFixed(0)}.`
                            });

                            stats.scoreDropAlerts++;
                            console.log(`[alerts] Sent score drop alert for ${currentNode.node_id} to ${sub.email || 'push'}`);
                        } catch (error) {
                            console.error(`[alerts] Error sending score drop alert:`, error);
                            stats.errors++;
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('[alerts] Error processing alerts:', error);
        stats.errors++;
    }

    return stats;
}
