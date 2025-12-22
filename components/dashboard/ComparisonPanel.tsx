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
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                <span className="font-semibold hidden sm:inline">Node Comparison</span>
                                <span className="font-semibold sm:hidden">Compare</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                    {nodes.length}
                                </span>
                            </Button>
                        </CollapsibleTrigger>
                        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive text-xs sm:text-sm">
                            Clear All
                        </Button>
                    </div>
                </div>

                <CollapsibleContent>
                    {/* Mobile View - Card Stack */}
                    <div className="md:hidden py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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

                    {/* Desktop View - Table Format */}
                    <div className="hidden md:block py-4 overflow-x-auto">
                        <div className="min-w-[500px] space-y-3">
                            {/* Node Headers */}
                            <div className="grid gap-4" style={{ gridTemplateColumns: `100px repeat(${nodes.length}, 1fr)` }}>
                                <div />
                                {nodes.map((node) => (
                                    <div key={node.id} className="relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 hover:bg-destructive/20 text-destructive"
                                            onClick={() => onRemove(node.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                        <div className="space-y-2 p-3 rounded-lg border bg-card">
                                            <div className="flex items-center justify-between gap-2">
                                                <Link
                                                    href={`/nodes/${node.id}`}
                                                    className="font-mono text-xs font-bold hover:text-primary transition-colors truncate max-w-[120px]"
                                                >
                                                    {node.id}
                                                </Link>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                            </div>
                                            <StatusBadge status={node.status} showLabel size="sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {/* Credits */}
                                <ComparisonRow
                                    label="Credits"
                                    winnerIndices={winners?.credits}
                                    values={nodes.map((n, i) => (
                                        <span className={cn(
                                            "font-bold text-base flex items-center gap-1",
                                            winners?.credits[i] ? "text-emerald-500" : "text-foreground"
                                        )}>
                                            {n.credits?.toLocaleString() || '--'}
                                            {winners?.credits[i] && <Trophy className="h-3.5 w-3.5" />}
                                        </span>
                                    ))}
                                />

                                {/* Uptime (24h) */}
                                <ComparisonRow
                                    label="Uptime (24h)"
                                    winnerIndices={winners?.uptime}
                                    values={nodes.map((n, i) => (
                                        <span className={cn(
                                            "flex items-center gap-1",
                                            winners?.uptime[i] ? "text-emerald-500" : "text-foreground"
                                        )}>
                                            {n.uptime.toFixed(1)}%
                                            <span className="text-xs">{getUptimeBadgeIcon(n.uptimeBadge)}</span>
                                            {winners?.uptime[i] && <Trophy className="h-3.5 w-3.5" />}
                                        </span>
                                    ))}
                                />

                                {/* Online Duration */}
                                <ComparisonRow
                                    label="Online For"
                                    winnerIndices={winners?.onlineFor}
                                    values={nodes.map((n, i) => (
                                        <span className={cn(
                                            "flex items-center gap-1",
                                            winners?.onlineFor[i] ? "text-emerald-500" : "text-foreground"
                                        )}>
                                            {formatDuration(n.uptimeSeconds || 0)}
                                            {winners?.onlineFor[i] && <Trophy className="h-3.5 w-3.5" />}
                                        </span>
                                    ))}
                                />

                                {/* Public Status */}
                                <ComparisonRow
                                    label="Visibility"
                                    values={nodes.map(n => (
                                        <span className="flex items-center gap-1">
                                            {n.isPublic ? (
                                                <>
                                                    <Shield className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-emerald-500 text-xs">Public</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldOff className="h-3 w-3 text-amber-500" />
                                                    <span className="text-amber-500 text-xs">Private</span>
                                                </>
                                            )}
                                        </span>
                                    ))}
                                />

                                {/* Storage with size */}
                                <ComparisonRow
                                    label="Storage"
                                    winnerIndices={winners?.storage}
                                    values={nodes.map((n, i) => (
                                        <div className="space-y-1 w-full">
                                            <div className="flex justify-between text-xs">
                                                <span className={cn(
                                                    "font-medium flex items-center gap-1",
                                                    winners?.storage[i] ? "text-emerald-500" : "text-foreground"
                                                )}>
                                                    {formatBytes(n.storage.total)}
                                                    {winners?.storage[i] && <Trophy className="h-3 w-3" />}
                                                </span>
                                                <span className="text-muted-foreground">{n.storage.usagePercent?.toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar value={n.storage.usagePercent} size="sm" />
                                        </div>
                                    ))}
                                />

                                {/* Version */}
                                <ComparisonRow
                                    label="Version"
                                    values={nodes.map(n => (
                                        <span className={cn(
                                            "text-xs font-mono px-2 py-1 rounded bg-muted inline-block",
                                            n.versionStatus === 'current' && "text-emerald-500 bg-emerald-500/10",
                                            n.versionStatus === 'outdated' && "text-amber-500 bg-amber-500/10",
                                        )}>
                                            {n.version}
                                        </span>
                                    ))}
                                />

                                {/* Location */}
                                <ComparisonRow
                                    label="Location"
                                    values={nodes.map(n =>
                                        n.location ? (
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium">{n.location.country}</span>
                                                <span className="text-muted-foreground">{n.location.city}</span>
                                            </div>
                                        ) : 'Unknown'
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
