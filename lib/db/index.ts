/**
 * SQLite Database Connection
 * Uses better-sqlite3 for synchronous, fast SQLite operations
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'analytics.db');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection (singleton pattern)
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL'); // Better performance for concurrent reads
        db.pragma('synchronous = NORMAL'); // Balance between safety and speed
        initializeSchema(db);
    }
    return db;
}

/**
 * Initialize database schema if tables don't exist
 */
function initializeSchema(database: Database.Database): void {
    // Network snapshots table (1 row per hour)
    database.exec(`
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL DEFAULT (datetime('now')),
            total_nodes INTEGER NOT NULL DEFAULT 0,
            online_nodes INTEGER NOT NULL DEFAULT 0,
            degraded_nodes INTEGER NOT NULL DEFAULT 0,
            offline_nodes INTEGER NOT NULL DEFAULT 0,
            total_storage_bytes INTEGER NOT NULL DEFAULT 0,
            used_storage_bytes INTEGER NOT NULL DEFAULT 0,
            avg_uptime REAL NOT NULL DEFAULT 0,
            avg_staking_score REAL NOT NULL DEFAULT 0
        )
    `);

    // Node data per snapshot
    database.exec(`
        CREATE TABLE IF NOT EXISTS node_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snapshot_id INTEGER NOT NULL,
            node_id TEXT NOT NULL,
            public_key TEXT,
            status TEXT NOT NULL,
            uptime_percent REAL NOT NULL DEFAULT 0,
            storage_usage_percent REAL NOT NULL DEFAULT 0,
            staking_score REAL NOT NULL DEFAULT 0,
            version TEXT,
            is_public INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE CASCADE,
            UNIQUE(snapshot_id, node_id)
        )
    `);

    // Alert subscriptions
    database.exec(`
        CREATE TABLE IF NOT EXISTS alert_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            push_endpoint TEXT,
            push_p256dh TEXT,
            push_auth TEXT,
            node_ids TEXT NOT NULL DEFAULT '[]',
            alert_offline INTEGER NOT NULL DEFAULT 1,
            alert_score_drop INTEGER NOT NULL DEFAULT 1,
            score_threshold INTEGER NOT NULL DEFAULT 70,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            verified INTEGER NOT NULL DEFAULT 0
        )
    `);

    // Alert history (prevent duplicate alerts)
    database.exec(`
        CREATE TABLE IF NOT EXISTS alert_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            node_id TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            sent_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (subscription_id) REFERENCES alert_subscriptions(id) ON DELETE CASCADE
        )
    `);

    // User alerts (for display in bell icon)
    database.exec(`
        CREATE TABLE IF NOT EXISTS user_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            node_id TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            read INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (subscription_id) REFERENCES alert_subscriptions(id) ON DELETE CASCADE
        )
    `);

    // Verification tokens for email confirmation
    database.exec(`
        CREATE TABLE IF NOT EXISTS verification_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL UNIQUE,
            subscription_id INTEGER NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (subscription_id) REFERENCES alert_subscriptions(id) ON DELETE CASCADE
        )
    `);

    // Create indexes for performance
    database.exec(`
        CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp);
        CREATE INDEX IF NOT EXISTS idx_node_snapshots_snapshot ON node_snapshots(snapshot_id);
        CREATE INDEX IF NOT EXISTS idx_node_snapshots_node ON node_snapshots(node_id);
        CREATE INDEX IF NOT EXISTS idx_alert_history_subscription ON alert_history(subscription_id);
        CREATE INDEX IF NOT EXISTS idx_user_alerts_subscription ON user_alerts(subscription_id);
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
    `);

    console.log('[db] Database schema initialized');
    migrateSchema(database);
}

/**
 * Migrate database schema for existing databases
 */
function migrateSchema(database: Database.Database): void {
    // Check for credits columns in snapshots
    const snapshotsInfo = database.pragma('table_info(snapshots)') as any[];
    const hasTotalCredits = snapshotsInfo.some(col => col.name === 'total_credits');

    if (!hasTotalCredits) {
        console.log('[db] Migrating snapshots table: adding credits columns');
        database.exec('ALTER TABLE snapshots ADD COLUMN total_credits REAL NOT NULL DEFAULT 0');
        database.exec('ALTER TABLE snapshots ADD COLUMN avg_credits REAL NOT NULL DEFAULT 0');
    }

    // Check for credits column in node_snapshots
    const nodeSnapshotsInfo = database.pragma('table_info(node_snapshots)') as any[];
    const hasCredits = nodeSnapshotsInfo.some(col => col.name === 'credits');

    if (!hasCredits) {
        console.log('[db] Migrating node_snapshots table: adding credits column');
        database.exec('ALTER TABLE node_snapshots ADD COLUMN credits REAL NOT NULL DEFAULT 0');
    }
}

/**
 * Close database connection (for graceful shutdown)
 */
export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}

export default getDatabase;
