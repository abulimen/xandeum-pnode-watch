/**
 * ComparisonPanel Component - Side-by-side node comparison
 * Redesigned for better mobile responsiveness with proper highlighting
 */

'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PNode } from '@/types/pnode';
import { X, ExternalLink, Shield, ShieldOff, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDuration, formatBytes } from '@/lib/services/analyticsService';
import { useState, useMemo } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ComparisonPanelProps {
    nodes: PNode[];
    onRemove: (nodeId: string) => void;
    onClear: () => void;
}

// Calculate winners for each metric
function calculateWinners(nodes: PNode[]) {
    if (nodes.length < 2) return null;

    const credits = nodes.map(n => n.credits || 0);
    const uptime = nodes.map(n => n.uptime || 0);
    const onlineFor = nodes.map(n => n.uptimeSeconds || 0);
    const storage = nodes.map(n => n.storage.total || 0);

    const maxCredits = Math.max(...credits);
    const maxUptime = Math.max(...uptime);
    const maxOnlineFor = Math.max(...onlineFor);
    const maxStorage = Math.max(...storage);

    return {
        credits: credits.map(v => v === maxCredits && credits.filter(c => c === maxCredits).length === 1),
        uptime: uptime.map(v => v === maxUptime && uptime.filter(u => u === maxUptime).length === 1),
        onlineFor: onlineFor.map(v => v === maxOnlineFor && onlineFor.filter(o => o === maxOnlineFor).length === 1),
        storage: storage.map(v => v === maxStorage && storage.filter(s => s === maxStorage).length === 1),
    };
}

function getUptimeBadgeIcon(badge: PNode['uptimeBadge']): string {
    switch (badge) {
        case 'elite': return '🏆';
        case 'reliable': return '✅';
        case 'average': return '⚡';
        case 'unreliable': return '⚠️';
        default: return '';
    }
}

// Mobile-friendly comparison card for a single node
function MobileNodeCard({
    node,
    onRemove,
    isWinner
}: {
    node: PNode;
    onRemove: (id: string) => void;
    isWinner: {
        credits: boolean;
        uptime: boolean;
        onlineFor: boolean;
        storage: boolean;
    } | null;
}) {
    const storagePercent = node.storage.usagePercent || 0;

    return (
        <div className="bg-card border rounded-xl p-4 space-y-4 relative">
            {/* Remove button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
                onClick={() => onRemove(node.id)}
            >
                <X className="h-3 w-3" />
            </Button>

            {/* Header */}
            <div className="pr-8">
                <Link
                    href={`/nodes/${node.id}`}
                    className="font-mono text-sm font-bold hover:text-primary transition-colors truncate block"
                >
                    {node.id}
                </Link>
                <div className="mt-2">
                    <StatusBadge status={node.status} showLabel size="sm" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Credits */}
                <div className={cn(
                    "space-y-1 p-2 rounded-lg -mx-2",
                    isWinner?.credits && "bg-emerald-500/10 border border-emerald-500/30"
                )}>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Credits
                        {isWinner?.credits && <Trophy className="h-3 w-3 text-emerald-500" />}
                    </span>
                    <span className={cn(
                        "block text-lg font-bold",
                        isWinner?.credits ? "text-emerald-500" : "text-foreground"
                    )}>
                        {node.credits?.toLocaleString() || '--'}
                    </span>
                </div>

                {/* Uptime (24h) */}
                <div className={cn(
                    "space-y-1 p-2 rounded-lg -mx-2",
                    isWinner?.uptime && "bg-emerald-500/10 border border-emerald-500/30"
                )}>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Uptime (24h)
                        {isWinner?.uptime && <Trophy className="h-3 w-3 text-emerald-500" />}
                    </span>
                    <span className={cn(
                        "block text-sm font-medium",
                        isWinner?.uptime ? "text-emerald-500" : "text-foreground"
                    )}>
                        {node.uptime.toFixed(1)}% {getUptimeBadgeIcon(node.uptimeBadge)}
                    </span>
                </div>

                {/* Online For */}
                <div className={cn(
                    "space-y-1 p-2 rounded-lg -mx-2",
                    isWinner?.onlineFor && "bg-emerald-500/10 border border-emerald-500/30"
                )}>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Online For
                        {isWinner?.onlineFor && <Trophy className="h-3 w-3 text-emerald-500" />}
                    </span>
                    <span className={cn(
                        "block text-sm font-medium",
                        isWinner?.onlineFor ? "text-emerald-500" : "text-foreground"
                    )}>
                        {formatDuration(node.uptimeSeconds || 0)}
                    </span>
                </div>

                {/* Visibility */}
                <div className="space-y-1 p-2 rounded-lg -mx-2">
                    <span className="text-xs text-muted-foreground">Visibility</span>
                    <span className="flex items-center gap-1 text-sm">
                        {node.isPublic ? (
                            <>
                                <Shield className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Public</span>
                            </>
                        ) : (
                            <>
                                <ShieldOff className="h-3 w-3 text-amber-500" />
                                <span className="text-amber-500">Private</span>
                            </>
                        )}
                    </span>
                </div>
            </div>

            {/* Storage */}
            <div className={cn(
                "space-y-2 p-2 rounded-lg -mx-2",
                isWinner?.storage && "bg-emerald-500/10 border border-emerald-500/30"
            )}>
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                        Storage
                        {isWinner?.storage && <Trophy className="h-3 w-3 text-emerald-500" />}
                    </span>
                    <span className={cn(
                        "font-medium",
                        isWinner?.storage ? "text-emerald-500" : "text-foreground"
                    )}>
                        {formatBytes(node.storage.total)} ({storagePercent.toFixed(1)}% used)
                    </span>
                </div>
                <ProgressBar value={storagePercent} size="sm" />
            </div>

            {/* Version & Location */}
            <div className="flex justify-between text-xs">
                <span className={cn(
                    "font-mono px-2 py-1 rounded bg-muted",
                    node.versionStatus === 'current' && "text-emerald-500 bg-emerald-500/10",
                    node.versionStatus === 'outdated' && "text-amber-500 bg-amber-500/10",
                )}>
                    v{node.version}
                </span>
                {node.location && (
                    <span className="text-muted-foreground">
                        📍 {node.location.city}, {node.location.country}
                    </span>
                )}
            </div>
        </div>
    );
}

// Desktop comparison row with proper highlighting
interface ComparisonRowProps {
    label: string;
    values: React.ReactNode[];
    winnerIndices?: boolean[];
}

function ComparisonRow({ label, values, winnerIndices }: ComparisonRowProps) {
    return (
        <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `100px repeat(${values.length}, 1fr)` }}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            {values.map((value, i) => (
                <div
                    key={i}
                    className={cn(
                        "text-sm font-medium p-2 rounded-md transition-colors",
                        winnerIndices?.[i] && "bg-emerald-500/15 border border-emerald-500/30"
                    )}
                >
                    {value}
                </div>
            ))}
        </div>
    );
}

export function ComparisonPanel({ nodes, onRemove, onClear }: ComparisonPanelProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Calculate winners for highlighting
    const winners = useMemo(() => calculateWinners(nodes), [nodes]);

    if (nodes.length === 0) return null;

    return (
        <>
            {/* Slide-out panel from left */}
            <div
                className={cn(
                    "fixed top-16 left-0 z-40 h-[calc(100vh-8rem)] transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Node Comparison</span>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                {nodes.length}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive text-xs h-7">
                            Clear All
                        </Button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        {nodes.map((node, idx) => (
                            <MobileNodeCard
                                key={node.id}
                                node={node}
                                onRemove={onRemove}
                                isWinner={winners ? {
                                    credits: winners.credits[idx],
                                    uptime: winners.uptime[idx],
                                    onlineFor: winners.onlineFor[idx],
                                    storage: winners.storage[idx],
                                } : null}
                            />
                        ))}
                    </div>
                </div>

                {/* Toggle tab on the right edge of the panel */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 bg-background border shadow-lg rounded-r-lg p-2 transition-all",
                        isOpen ? "left-80" : "left-0"
                    )}
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 rotate-90" />
                    ) : (
                        <ChevronUp className="h-4 w-4 rotate-90" />
                    )}
                </button>
            </div>

            {/* Minimized floating badge when panel is closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-20 left-2 z-40 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <span className="text-sm font-medium">Compare</span>
                    <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded text-xs">
                        {nodes.length}
                    </span>
                </button>
            )}
        </>
    );
}

