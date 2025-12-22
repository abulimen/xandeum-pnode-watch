/**
 * Activity Service - Detects network changes and generates events
 * Creates a real-time activity feed that makes the network feel alive
 */

import { PNode } from '@/types/pnode';

// Event types for the activity feed
export type ActivityEventType =
    | 'node_online'
    | 'node_offline'
    | 'node_degraded'
    | 'storage_milestone'
    | 'badge_achieved'
    | 'version_change'
    | 'country_change'
    | 'health_change'
    | 'node_count_change';

export interface ActivityEvent {
    id: string;
    type: ActivityEventType;
    message: string;
    icon: string;
    nodeId?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

// Simplified node state for comparison
interface NodeState {
    status: string;
    version: string;
    badge?: string;
}

// Network snapshot for comparison
export interface NetworkSnapshot {
    nodes: Map<string, NodeState>;
    countries: Map<string, number>;
    totalStorage: number;
    totalNodes: number;
    onlineNodes: number;
    healthScore: number;
    timestamp: Date;
}

// Storage milestones to announce (in bytes)
const STORAGE_MILESTONES = [
    100 * 1e12,  // 100 TB
    125 * 1e12,  // 125 TB
    150 * 1e12,  // 150 TB
    200 * 1e12,  // 200 TB
    250 * 1e12,  // 250 TB
    500 * 1e12,  // 500 TB
    1000 * 1e12, // 1 PB
];

// Generate unique event ID
function generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Get icon for event type
function getEventIcon(type: ActivityEventType): string {
    const icons: Record<ActivityEventType, string> = {
        node_online: '🟢',
        node_offline: '🔴',
        node_degraded: '🟡',
        storage_milestone: '📈',
        badge_achieved: '🏆',
        version_change: '🔄',
        country_change: '🌍',
        health_change: '📊',
        node_count_change: '📌',
    };
    return icons[type];
}

// Detect badge from uptime
function getBadge(uptime: number): string {
    if (uptime >= 99.5) return 'elite';
    if (uptime >= 95) return 'reliable';
    if (uptime >= 80) return 'average';
    return 'unreliable';
}

// Create a snapshot from current node data
export function createSnapshot(nodes: PNode[]): NetworkSnapshot {
    const nodeStates = new Map<string, NodeState>();
    const countries = new Map<string, number>();
    let totalStorage = 0;
    let onlineNodes = 0;

    nodes.forEach(node => {
        // Store node state
        nodeStates.set(node.id, {
            status: node.status,
            version: node.version,
            badge: getBadge(node.uptime),
        });

        // Count by country
        if (node.location?.country) {
            const count = countries.get(node.location.country) || 0;
            countries.set(node.location.country, count + 1);
        }

        // Sum storage
        totalStorage += node.storage?.total || 0;

        // Count online
        if (node.status === 'online') {
            onlineNodes++;
        }
    });

    // Calculate health score
    const healthScore = nodes.length > 0
        ? (onlineNodes / nodes.length) * 100
        : 0;

    return {
        nodes: nodeStates,
        countries,
        totalStorage,
        totalNodes: nodes.length,
        onlineNodes,
        healthScore,
        timestamp: new Date(),
    };
}

// Detect changes between snapshots and generate events
export function detectChanges(
    previous: NetworkSnapshot,
    current: NetworkSnapshot,
    nodes: PNode[]
): ActivityEvent[] {
    const events: ActivityEvent[] = [];

    // Create a lookup for full node data
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 1. Detect node status changes
    current.nodes.forEach((currentState, nodeId) => {
        const previousState = previous.nodes.get(nodeId);
        const node = nodeMap.get(nodeId);
        const shortId = nodeId.substring(0, 8);

        if (!previousState) {
            // New node appeared
            events.push({
                id: generateEventId(),
                type: 'node_online',
                message: `New node ${shortId} joined the network`,
                icon: getEventIcon('node_online'),
                nodeId,
                timestamp: new Date(),
                metadata: { country: node?.location?.country },
            });
        } else if (previousState.status !== currentState.status) {
            // Status changed
            if (currentState.status === 'online' && previousState.status !== 'online') {
                events.push({
                    id: generateEventId(),
                    type: 'node_online',
                    message: `Node ${shortId} came online`,
                    icon: getEventIcon('node_online'),
                    nodeId,
                    timestamp: new Date(),
                });
            } else if (currentState.status === 'offline') {
                events.push({
                    id: generateEventId(),
                    type: 'node_offline',
                    message: `Node ${shortId} went offline`,
                    icon: getEventIcon('node_offline'),
                    nodeId,
                    timestamp: new Date(),
                });
            } else if (currentState.status === 'degraded') {
                events.push({
                    id: generateEventId(),
                    type: 'node_degraded',
                    message: `Node ${shortId} is experiencing issues`,
                    icon: getEventIcon('node_degraded'),
                    nodeId,
                    timestamp: new Date(),
                });
            }
        }

        // 2. Detect version changes
        if (previousState && previousState.version !== currentState.version) {
            events.push({
                id: generateEventId(),
                type: 'version_change',
                message: `Node ${shortId} updated to ${currentState.version}`,
                icon: getEventIcon('version_change'),
                nodeId,
                timestamp: new Date(),
                metadata: { oldVersion: previousState.version, newVersion: currentState.version },
            });
        }

        // 3. Detect badge achievements
        if (previousState && previousState.badge !== currentState.badge) {
            if (currentState.badge === 'elite' && previousState.badge !== 'elite') {
                events.push({
                    id: generateEventId(),
                    type: 'badge_achieved',
                    message: `Node ${shortId} achieved Elite status!`,
                    icon: getEventIcon('badge_achieved'),
                    nodeId,
                    timestamp: new Date(),
                });
            } else if (currentState.badge === 'reliable' && previousState.badge === 'average') {
                events.push({
                    id: generateEventId(),
                    type: 'badge_achieved',
                    message: `Node ${shortId} earned Reliable badge`,
                    icon: getEventIcon('badge_achieved'),
                    nodeId,
                    timestamp: new Date(),
                });
            }
        }
    });

    // 4. Detect nodes that went completely offline (removed from list)
    previous.nodes.forEach((_, nodeId) => {
        if (!current.nodes.has(nodeId)) {
            const shortId = nodeId.substring(0, 8);
            events.push({
                id: generateEventId(),
                type: 'node_offline',
                message: `Node ${shortId} left the network`,
                icon: getEventIcon('node_offline'),
                nodeId,
                timestamp: new Date(),
            });
        }
    });

    // 5. Detect country changes
    current.countries.forEach((count, country) => {
        const prevCount = previous.countries.get(country) || 0;
        if (count > prevCount && prevCount > 0) {
            events.push({
                id: generateEventId(),
                type: 'country_change',
                message: `${country} now has ${count} nodes (+${count - prevCount})`,
                icon: getEventIcon('country_change'),
                timestamp: new Date(),
                metadata: { country, count, change: count - prevCount },
            });
        }
    });

    // 6. Detect storage milestones
    for (const milestone of STORAGE_MILESTONES) {
        if (current.totalStorage >= milestone && previous.totalStorage < milestone) {
            const formatted = formatStorageMilestone(milestone);
            events.push({
                id: generateEventId(),
                type: 'storage_milestone',
                message: `Network storage reached ${formatted}!`,
                icon: getEventIcon('storage_milestone'),
                timestamp: new Date(),
                metadata: { milestone, totalStorage: current.totalStorage },
            });
        }
    }

    // 7. Detect significant health changes (>2% change)
    const healthChange = current.healthScore - previous.healthScore;
    if (Math.abs(healthChange) >= 2) {
        const direction = healthChange > 0 ? 'improved' : 'decreased';
        const sign = healthChange > 0 ? '+' : '';
        events.push({
            id: generateEventId(),
            type: 'health_change',
            message: `Network health ${direction} to ${current.healthScore.toFixed(1)}% (${sign}${healthChange.toFixed(1)}%)`,
            icon: getEventIcon('health_change'),
            timestamp: new Date(),
            metadata: { healthScore: current.healthScore, change: healthChange },
        });
    }

    // 8. Detect node count changes (5+ nodes)
    const nodeCountChange = current.totalNodes - previous.totalNodes;
    if (Math.abs(nodeCountChange) >= 5) {
        const direction = nodeCountChange > 0 ? 'added' : 'lost';
        const absChange = Math.abs(nodeCountChange);
        events.push({
            id: generateEventId(),
            type: 'node_count_change',
            message: `Network ${direction} ${absChange} nodes (now ${current.totalNodes} total)`,
            icon: getEventIcon('node_count_change'),
            timestamp: new Date(),
            metadata: { totalNodes: current.totalNodes, change: nodeCountChange },
        });
    }

    return events;
}

// Format storage for milestone display
function formatStorageMilestone(bytes: number): string {
    if (bytes >= 1e15) return `${(bytes / 1e15).toFixed(0)} PB`;
    return `${(bytes / 1e12).toFixed(0)} TB`;
}

// Format relative time for display
export function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Get color class for event type
export function getEventColorClass(type: ActivityEventType): string {
    switch (type) {
        case 'node_online':
        case 'badge_achieved':
            return 'text-emerald-500';
        case 'node_offline':
            return 'text-red-500';
        case 'node_degraded':
            return 'text-amber-500';
        case 'storage_milestone':
        case 'health_change':
            return 'text-blue-500';
        default:
            return 'text-muted-foreground';
    }
}

// Load events from localStorage
export function loadStoredEvents(): ActivityEvent[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem('xandeum-activity-events');
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return parsed.map((e: ActivityEvent) => ({
            ...e,
            timestamp: new Date(e.timestamp),
        }));
    } catch {
        return [];
    }
}

// Save events to localStorage
export function saveStoredEvents(events: ActivityEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
        // Keep only last 100 events
        const toStore = events.slice(0, 100);
        localStorage.setItem('xandeum-activity-events', JSON.stringify(toStore));
    } catch {
        // Ignore storage errors
    }
}

// Load previous snapshot from localStorage
export function loadStoredSnapshot(): NetworkSnapshot | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem('xandeum-network-snapshot');
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        return {
            ...parsed,
            nodes: new Map(parsed.nodes),
            countries: new Map(parsed.countries),
            timestamp: new Date(parsed.timestamp),
        };
    } catch {
        return null;
    }
}

// Save snapshot to localStorage
export function saveSnapshot(snapshot: NetworkSnapshot): void {
    if (typeof window === 'undefined') return;

    try {
        const toStore = {
            ...snapshot,
            nodes: Array.from(snapshot.nodes.entries()),
            countries: Array.from(snapshot.countries.entries()),
        };
        localStorage.setItem('xandeum-network-snapshot', JSON.stringify(toStore));
    } catch {
        // Ignore storage errors
    }
}
