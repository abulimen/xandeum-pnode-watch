/**
 * AlertsPanel Component - List of nodes with issues
 * Includes "Show More" functionality to prevent excessive page length
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, Clock, HardDrive, Wifi, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NodeIssue, IssueType, IssueSeverity } from '@/types/issues';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
    issues: NodeIssue[];
    isLoading?: boolean;
    initialLimit?: number;
}

const issueIcons: Record<IssueType, React.ReactNode> = {
    offline: <XCircle className="h-4 w-4" />,
    low_uptime: <AlertTriangle className="h-4 w-4" />,
    high_latency: <Wifi className="h-4 w-4" />,
    storage_full: <HardDrive className="h-4 w-4" />,
    stale: <Clock className="h-4 w-4" />,
};

const severityStyles: Record<IssueSeverity, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    low: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
};

const issueTypeLabels: Record<IssueType, string> = {
    offline: 'Offline',
    low_uptime: 'Low Uptime',
    high_latency: 'High Latency',
    storage_full: 'Storage Full',
    stale: 'Stale Data',
};

export function AlertsPanel({ issues, isLoading, initialLimit = 5 }: AlertsPanelProps) {
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (issues.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Nodes Requiring Attention
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2">🎉</div>
                        <p>All nodes are operating normally!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sort issues by severity (High -> Medium -> Low)
    const severityOrder: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };
    const sortedIssues = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const displayedIssues = expanded ? sortedIssues : sortedIssues.slice(0, initialLimit);
    const hiddenCount = issues.length - displayedIssues.length;

    // Helper to check if we need a header (if severity changes from previous item)
    const shouldShowHeader = (index: number) => {
        if (index === 0) return true;
        return sortedIssues[index].severity !== sortedIssues[index - 1].severity;
    };

    const criticalCount = issues.filter(i => i.severity === 'high').length;
    const warningCount = issues.filter(i => i.severity === 'medium').length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Nodes Requiring Attention
                    </CardTitle>
                    <div className="flex gap-2">
                        {criticalCount > 0 && (
                            <Badge variant="destructive">{criticalCount} Critical</Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                                {warningCount} Warning
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {displayedIssues.map((issue, index) => {
                        const showHeader = shouldShowHeader(index);
                        const styles = severityStyles[issue.severity];

                        return (
                            <div key={`${issue.nodeId}-${issue.type}-${index}`}>
                                {showHeader && (
                                    <h4 className={cn("text-sm font-medium mb-2 mt-4 capitalize first:mt-0", styles.text)}>
                                        {issue.severity} Severity
                                    </h4>
                                )}
                                <Link
                                    href={`/nodes/${issue.nodeId}`}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent",
                                        styles.bg,
                                        styles.border
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-1.5 rounded", styles.bg, styles.text)}>
                                            {issueIcons[issue.type]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{issue.nodeId}</p>
                                            <p className="text-xs text-muted-foreground">{issue.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn(styles.text, styles.border)}>
                                            {issueTypeLabels[issue.type]}
                                        </Badge>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {issues.length > initialLimit && (
                    <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <span className="flex items-center gap-2">
                                Show Less <ChevronUp className="h-4 w-4" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Show {hiddenCount} More Issues <ChevronDown className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
