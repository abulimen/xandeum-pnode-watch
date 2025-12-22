/**
 * Database Query Functions
 * Provides typed query functions for the analytics database
 */

import { getDatabase } from './index';

// Types
export interface SnapshotRecord {
    id: number;
    timestamp: string;
    total_nodes: number;
    online_nodes: number;
    degraded_nodes: number;
    offline_nodes: number;
    total_storage_bytes: number;
    used_storage_bytes: number;
    avg_uptime: number;
    avg_staking_score: number;
    total_credits: number;
    avg_credits: number;
}

export interface NodeSnapshotRecord {
    id: number;
    snapshot_id: number;
    node_id: string;
    public_key: string | null;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    credits: number;
    version: string | null;
    is_public: number;
}

export interface AlertSubscription {
    id: number;
    email: string | null;
    push_endpoint: string | null;
    push_p256dh: string | null;
    push_auth: string | null;
    node_ids: string; // JSON array
    alert_offline: number;
    alert_score_drop: number;
    score_threshold: number;
    created_at: string;
    verified: number;
}

// ================== SNAPSHOT QUERIES ==================

/**
 * Create a new network snapshot
 */
export function createSnapshot(data: {
    total_nodes: number;
    online_nodes: number;
    degraded_nodes: number;
    offline_nodes: number;
    total_storage_bytes: number;
    used_storage_bytes: number;
    avg_uptime: number;
    avg_staking_score: number;
    total_credits: number;
    avg_credits: number;
}): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO snapshots (
            total_nodes, online_nodes, degraded_nodes, offline_nodes,
            total_storage_bytes, used_storage_bytes, avg_uptime, avg_staking_score,
            total_credits, avg_credits
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        data.total_nodes,
        data.online_nodes,
        data.degraded_nodes,
        data.offline_nodes,
        data.total_storage_bytes,
        data.used_storage_bytes,
        data.avg_uptime,
        data.avg_staking_score,
        data.total_credits,
        data.avg_credits
    );

    return result.lastInsertRowid as number;
}

/**
 * Insert node snapshot data (batch insert)
 */
export function insertNodeSnapshots(snapshotId: number, nodes: Array<{
    node_id: string;
    public_key?: string;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    credits: number;
    version?: string;
    is_public: boolean;
}>): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO node_snapshots (
            snapshot_id, node_id, public_key, status, uptime_percent,
            storage_usage_percent, staking_score, credits, version, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((nodesData: typeof nodes) => {
        for (const node of nodesData) {
            stmt.run(
                snapshotId,
                node.node_id,
                node.public_key || null,
                node.status,
                node.uptime_percent,
                node.storage_usage_percent,
                node.staking_score,
                node.credits,
                node.version || null,
                node.is_public ? 1 : 0
            );
        }
    });

    insertMany(nodes);
}

/**
 * Get network history for the last N days
 */
export function getNetworkHistory(days: number = 7): SnapshotRecord[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM snapshots
        WHERE timestamp >= datetime('now', '-' || ? || ' days')
        ORDER BY timestamp ASC
    `);

    return stmt.all(days) as SnapshotRecord[];
}

/**
 * Get node history for a specific node
 */
export function getNodeHistory(nodeId: string, days: number = 30): Array<{
    timestamp: string;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    version: string | null;
}> {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT 
            s.timestamp,
            ns.status,
            ns.uptime_percent,
            ns.storage_usage_percent,
            ns.staking_score,
            ns.credits,
            ns.version
        FROM node_snapshots ns
        JOIN snapshots s ON s.id = ns.snapshot_id
        WHERE ns.node_id = ?
        AND s.timestamp >= datetime('now', '-' || ? || ' days')
        ORDER BY s.timestamp ASC
    `);

    return stmt.all(nodeId, days) as any[];
}

/**
 * Get the most recent snapshot
 */
export function getLatestSnapshot(): SnapshotRecord | null {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM snapshots
        ORDER BY timestamp DESC
        LIMIT 1
    `);

    return stmt.get() as SnapshotRecord | null;
}

/**
 * Get previous snapshot (for comparison/alerts)
 */
export function getPreviousSnapshot(): SnapshotRecord | null {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM snapshots
        ORDER BY timestamp DESC
        LIMIT 1 OFFSET 1
    `);

    return stmt.get() as SnapshotRecord | null;
}

/**
 * Get node data from a specific snapshot
 */
export function getNodesFromSnapshot(snapshotId: number): NodeSnapshotRecord[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM node_snapshots
        WHERE snapshot_id = ?
    `);

    return stmt.all(snapshotId) as NodeSnapshotRecord[];
}

/**
 * Prune old snapshots (keep last N days)
 */
export function pruneOldSnapshots(keepDays: number = 30): number {
    const db = getDatabase();

    // Delete old node snapshots first (foreign key)
    db.prepare(`
        DELETE FROM node_snapshots
        WHERE snapshot_id IN (
            SELECT id FROM snapshots
            WHERE timestamp < datetime('now', '-' || ? || ' days')
        )
    `).run(keepDays);

    // Delete old snapshots
    const result = db.prepare(`
        DELETE FROM snapshots
        WHERE timestamp < datetime('now', '-' || ? || ' days')
    `).run(keepDays);

    return result.changes;
}

// ================== ALERT QUERIES ==================

/**
 * Create an alert subscription
 */
export function createAlertSubscription(data: {
    email?: string;
    push_endpoint?: string;
    push_p256dh?: string;
    push_auth?: string;
    node_ids: string[];
    alert_offline?: boolean;
    alert_score_drop?: boolean;
    score_threshold?: number;
}): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO alert_subscriptions (
            email, push_endpoint, push_p256dh, push_auth,
            node_ids, alert_offline, alert_score_drop, score_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        data.email || null,
        data.push_endpoint || null,
        data.push_p256dh || null,
        data.push_auth || null,
        JSON.stringify(data.node_ids),
        data.alert_offline !== false ? 1 : 0,
        data.alert_score_drop !== false ? 1 : 0,
        data.score_threshold || 70
    );

    return result.lastInsertRowid as number;
}

/**
 * Get subscriptions watching a specific node
 */
export function getSubscriptionsForNode(nodeId: string): AlertSubscription[] {
    const db = getDatabase();
    // SQLite JSON functions to check if nodeId is in the node_ids array
    const stmt = db.prepare(`
        SELECT * FROM alert_subscriptions
        WHERE node_ids LIKE '%"' || ? || '"%'
        AND verified = 1
    `);

    return stmt.all(nodeId) as AlertSubscription[];
}

/**
 * Get subscription by email address
 */
export function getSubscriptionByEmail(email: string): AlertSubscription | null {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM alert_subscriptions
        WHERE email = ?
        LIMIT 1
    `);

    const result = stmt.get(email) as AlertSubscription | undefined;
    return result || null;
}

/**
 * Record that an alert was sent (for deduplication)
 */
export function recordAlertSent(subscriptionId: number, nodeId: string, alertType: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO alert_history (subscription_id, node_id, alert_type)
        VALUES (?, ?, ?)
    `);

    stmt.run(subscriptionId, nodeId, alertType);
}

/**
 * Check if an alert was already sent recently (within hours)
 */
export function wasAlertSentRecently(subscriptionId: number, nodeId: string, alertType: string, hours: number = 6): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM alert_history
        WHERE subscription_id = ?
        AND node_id = ?
        AND alert_type = ?
        AND sent_at >= datetime('now', '-' || ? || ' hours')
    `);

    const result = stmt.get(subscriptionId, nodeId, alertType, hours) as { count: number };
    return result.count > 0;
}

/**
 * Verify an email subscription
 */
export function verifySubscription(id: number): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        UPDATE alert_subscriptions
        SET verified = 1
        WHERE id = ?
    `);

    stmt.run(id);
}

/**
 * Delete a subscription
 */
export function deleteSubscription(id: number): void {
    const db = getDatabase();

    // Delete alert history first
    db.prepare(`DELETE FROM alert_history WHERE subscription_id = ?`).run(id);

    // Delete verification tokens
    db.prepare(`DELETE FROM verification_tokens WHERE subscription_id = ?`).run(id);

    // Delete subscription
    db.prepare(`DELETE FROM alert_subscriptions WHERE id = ?`).run(id);
}

/**
 * Create a verification token for a subscription
 */
export function createVerificationToken(subscriptionId: number, token: string, expiresInHours: number = 24): void {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO verification_tokens (token, subscription_id, expires_at)
        VALUES (?, ?, datetime('now', '+' || ? || ' hours'))
    `);

    stmt.run(token, subscriptionId, expiresInHours);
}

/**
 * Get subscription by verification token
 */
export function getSubscriptionByToken(token: string): AlertSubscription | null {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT s.* FROM alert_subscriptions s
        INNER JOIN verification_tokens vt ON vt.subscription_id = s.id
        WHERE vt.token = ?
        AND vt.expires_at > datetime('now')
    `);

    const result = stmt.get(token) as AlertSubscription | undefined;
    return result || null;
}

/**
 * Delete a verification token after use
 */
export function deleteVerificationToken(token: string): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM verification_tokens WHERE token = ?`).run(token);
}

/**
 * Clean up expired verification tokens
 */
export function cleanupExpiredTokens(): number {
    const db = getDatabase();
    const result = db.prepare(`
        DELETE FROM verification_tokens
        WHERE expires_at <= datetime('now')
    `).run();

    return result.changes;
}

// ================== USER ALERTS QUERIES ==================

export interface UserAlert {
    id: number;
    subscription_id: number;
    node_id: string;
    alert_type: string;
    title: string;
    message: string;
    created_at: string;
    read: number;
}

/**
 * Insert a user alert (called when sending email/push)
 */
export function insertUserAlert(data: {
    subscription_id: number;
    node_id: string;
    alert_type: string;
    title: string;
    message: string;
}): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        INSERT INTO user_alerts (subscription_id, node_id, alert_type, title, message)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        data.subscription_id,
        data.node_id,
        data.alert_type,
        data.title,
        data.message
    );

    return result.lastInsertRowid as number;
}

/**
 * Get alerts for a subscription (most recent first)
 */
export function getUserAlerts(subscriptionId: number, limit: number = 50): UserAlert[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT * FROM user_alerts
        WHERE subscription_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    `);

    return stmt.all(subscriptionId, limit) as UserAlert[];
}

/**
 * Get all alerts for an email (across all subscriptions)
 */
export function getUserAlertsByEmail(email: string, limit: number = 50): UserAlert[] {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT ua.* FROM user_alerts ua
        INNER JOIN alert_subscriptions s ON ua.subscription_id = s.id
        WHERE s.email = ? AND s.verified = 1
        ORDER BY ua.created_at DESC
        LIMIT ?
    `);

    return stmt.all(email, limit) as UserAlert[];
}

/**
 * Get unread alert count for a subscription
 */
export function getUnreadAlertCount(subscriptionId: number): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM user_alerts
        WHERE subscription_id = ? AND read = 0
    `);

    const result = stmt.get(subscriptionId) as { count: number };
    return result.count;
}

/**
 * Get unread count by email (across all subscriptions)
 */
export function getUnreadAlertCountByEmail(email: string): number {
    const db = getDatabase();
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM user_alerts ua
        INNER JOIN alert_subscriptions s ON ua.subscription_id = s.id
        WHERE s.email = ? AND s.verified = 1 AND ua.read = 0
    `);

    const result = stmt.get(email) as { count: number };
    return result.count;
}

/**
 * Mark alert as read
 */
export function markAlertRead(alertId: number): void {
    const db = getDatabase();
    db.prepare(`UPDATE user_alerts SET read = 1 WHERE id = ?`).run(alertId);
}

/**
 * Mark all alerts as read for a subscription
 */
export function markAllAlertsRead(subscriptionId: number): void {
    const db = getDatabase();
    db.prepare(`UPDATE user_alerts SET read = 1 WHERE subscription_id = ?`).run(subscriptionId);
}

/**
 * Delete an alert
 */
export function deleteUserAlert(alertId: number): void {
    const db = getDatabase();
    db.prepare(`DELETE FROM user_alerts WHERE id = ?`).run(alertId);
}

/**
 * Clean up old alerts (older than 30 days)
 */
export function cleanupOldAlerts(): number {
    const db = getDatabase();
    const result = db.prepare(`
        DELETE FROM user_alerts
        WHERE created_at < datetime('now', '-30 days')
    `).run();

    return result.changes;
}

