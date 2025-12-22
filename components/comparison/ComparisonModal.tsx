/**
 * ComparisonModal Component - Side-by-side node comparison
 */

'use client';

import { X, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PNode } from '@/types/pnode';
import { formatBytes } from '@/lib/services/analyticsService';
import { cn } from '@/lib/utils';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: PNode[];
    onRemoveNode: (nodeId: string) => void;
}

interface MetricRowProps {
    label: string;
    values: (string | number | React.ReactNode)[];
    highlight?: 'max' | 'min' | 'none';
    format?: 'number' | 'percentage' | 'custom';
}

function MetricRow({ label, values, highlight = 'none', format = 'custom' }: MetricRowProps) {
    // Find best value for highlighting
    const numericValues = values.map(v => typeof v === 'number' ? v : parseFloat(String(v)) || 0);
    const bestIndex = highlight === 'max'
        ? numericValues.indexOf(Math.max(...numericValues))
        : highlight === 'min'
            ? numericValues.indexOf(Math.min(...numericValues.filter(v => v > 0)))
            : -1;

    return (
        <tr className="border-b">
            <td className="py-3 px-4 text-sm font-medium text-muted-foreground">{label}</td>
            {values.map((value, index) => (
                <td
                    key={index}
                    className={cn(
                        "py-3 px-4 text-sm text-center",
                        index === bestIndex && "text-emerald-500 font-bold"
                    )}
                >
                    {format === 'percentage' && typeof value === 'number'
                        ? `${value.toFixed(2)}%`
                        : value}
                </td>
            ))}
        </tr>
    );
}

export function ComparisonModal({ isOpen, onClose, nodes, onRemoveNode }: ComparisonModalProps) {
    if (nodes.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5" />
                        Compare {nodes.length} Nodes
                    </DialogTitle>
                    <DialogDescription>
                        Side-by-side comparison of selected pNodes
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                                    Metric
                                </th>
                                {nodes.map((node) => (
                                    <th key={node.id} className="py-3 px-4 text-center min-w-[150px]">
                                        <div className="flex flex-col items-center gap-2">
                                            <Link
                                                href={`/nodes/${node.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {node.id}
                                            </Link>
                                            <StatusBadge status={node.status} showLabel size="sm" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => onRemoveNode(node.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <MetricRow
                                label="Status"
                                values={nodes.map(n => (
                                    <Badge
                                        key={n.id}
                                        variant="outline"
                                        className={cn(
                                            n.status === 'online' && "text-emerald-500 border-emerald-500/50",
                                            n.status === 'degraded' && "text-amber-500 border-amber-500/50",
                                            n.status === 'offline' && "text-red-500 border-red-500/50"
                                        )}
                                    >
                                        {n.status}
                                    </Badge>
                                ))}
                            />
                            <MetricRow
                                label="Uptime"
                                values={nodes.map(n => n.uptime)}
                                format="percentage"
                                highlight="max"
                            />
                            <MetricRow
                                label="Response Time"
                                values={nodes.map(n => n.status === 'offline' ? '--' : `${n.responseTime}ms`)}
                                highlight="min"
                            />
                            <MetricRow
                                label="Storage Used"
                                values={nodes.map(n => formatBytes(n.storage.used))}
                            />
                            <MetricRow
                                label="Storage Total"
                                values={nodes.map(n => formatBytes(n.storage.total))}
                            />
                            <MetricRow
                                label="Storage Utilization"
                                values={nodes.map(n => (
                                    <ProgressBar
                                        key={n.id}
                                        value={(n.storage.used / n.storage.total) * 100}
                                        size="sm"
                                    />
                                ))}
                            />
                            <MetricRow
                                label="Location"
                                values={nodes.map(n =>
                                    n.location
                                        ? `${n.location.city || n.location.country}`
                                        : 'Unknown'
                                )}
                            />
                            <MetricRow
                                label="Region"
                                values={nodes.map(n => n.location?.region || 'Unknown')}
                            />
                            <MetricRow
                                label="Version"
                                values={nodes.map(n => n.version || 'Unknown')}
                            />
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
