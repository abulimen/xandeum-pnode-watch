/**
 * Data Export Utilities - CSV and JSON export functions
 */

import { PNode, NetworkStats } from '@/types/pnode';

/**
 * Convert pNodes to CSV format
 */
export function nodesToCSV(nodes: PNode[]): string {
    const headers = [
        'Node ID',
        'Status',
        'Uptime (%)',
        'Response Time (ms)',
        'Storage Used (bytes)',
        'Storage Total (bytes)',
        'Storage Utilization (%)',
        'Country',
        'Region',
        'City',
        'Latitude',
        'Longitude',
        'Last Seen',
        'Version',
        'IP Address',
        'RPC Port',
    ];

    const rows = nodes.map(node => {
        const storageUtil = ((node.storage.used / node.storage.total) * 100).toFixed(2);
        return [
            node.id,
            node.status,
            node.uptime.toFixed(2),
            node.responseTime,
            node.storage.used,
            node.storage.total,
            storageUtil,
            node.location?.country || '',
            node.location?.region || '',
            node.location?.city || '',
            node.location?.coordinates?.lat || '',
            node.location?.coordinates?.lng || '',
            node.lastSeen,
            node.version || '',
            node.network?.ipAddress || '',
            node.network?.rpcPort || '',
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Convert pNodes to JSON format (formatted)
 */
export function nodesToJSON(nodes: PNode[]): string {
    return JSON.stringify(nodes, null, 2);
}

/**
 * Convert network stats to JSON format
 */
export function statsToJSON(stats: NetworkStats): string {
    return JSON.stringify(stats, null, 2);
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, type: 'csv' | 'json'): void {
    const mimeType = type === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export nodes as CSV file
 */
export function exportNodesCSV(nodes: PNode[], filename: string = 'pnodes-export.csv'): void {
    const csv = nodesToCSV(nodes);
    downloadFile(csv, filename, 'csv');
}

/**
 * Export nodes as JSON file
 */
export function exportNodesJSON(nodes: PNode[], filename: string = 'pnodes-export.json'): void {
    const json = nodesToJSON(nodes);
    downloadFile(json, filename, 'json');
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}-${timestamp}.${extension}`;
}
