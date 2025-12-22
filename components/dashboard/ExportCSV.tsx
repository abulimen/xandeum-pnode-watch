/**
 * ExportCSV Component - Export node data to CSV
 */

'use client';

import { Button } from '@/components/ui/button';
import { PNode } from '@/types/pnode';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportCSVProps {
    nodes: PNode[];
    filename?: string;
}

function escapeCSVValue(value: string | number | boolean | undefined | null): string {
    if (value === undefined || value === null) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function generateCSV(nodes: PNode[]): string {
    const headers = [
        'Node ID',
        'Public Key',
        'Status',
        'Credits',
        'Uptime %',
        'Uptime Badge',
        'Online Duration (seconds)',
        'Version',
        'Version Status',
        'Is Public',
        'Storage Total (bytes)',
        'Storage Used (bytes)',
        'Storage Usage %',
        'Country',
        'City',
        'IP Address',
        'Last Seen',
    ];

    const rows = nodes.map(node => [
        node.id,
        node.publicKey,
        node.status,
        node.credits ?? 0,
        node.uptime.toFixed(1),
        node.uptimeBadge || '',
        node.uptimeSeconds || 0,
        node.version,
        node.versionStatus || '',
        node.isPublic ? 'Yes' : 'No',
        node.storage.total,
        node.storage.used,
        node.storage.usagePercent?.toFixed(1) || '',
        node.location?.country || '',
        node.location?.city || '',
        node.network.ipAddress,
        node.lastSeen,
    ]);

    const csvContent = [
        headers.map(escapeCSVValue).join(','),
        ...rows.map(row => row.map(escapeCSVValue).join(',')),
    ].join('\n');

    return csvContent;
}

function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function ExportCSV({ nodes, filename = 'xandeum-nodes' }: ExportCSVProps) {
    const handleExport = () => {
        if (nodes.length === 0) {
            toast.error('No nodes to export');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const csvContent = generateCSV(nodes);
        downloadCSV(csvContent, `${filename}-${timestamp}.csv`);

        toast.success(`Exported ${nodes.length} nodes to CSV`);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={nodes.length === 0}
        >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
        </Button>
    );
}
