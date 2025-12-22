/**
 * IssuesPanel Component - Nodes requiring attention
 */

'use client';

import { AlertTriangle, ChevronRight, XCircle, Clock, HardDrive, Wifi } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NodeIssue, IssueType } from '@/types/issues';
import { cn } from '@/lib/utils';

interface IssuesPanelProps {
    issues: NodeIssue[];
    maxDisplay?: number;
}

const issueIcons: Record<IssueType, React.ReactNode> = {
    offline: <XCircle className="h-4 w-4" />,
    low_uptime: <AlertTriangle className="h-4 w-4" />,
    high_latency: <Wifi className="h-4 w-4" />,
    storage_full: <HardDrive className="h-4 w-4" />,
    stale: <Clock className="h-4 w-4" />,
};

const severityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function IssuesPanel({ issues, maxDisplay = 3 }: IssuesPanelProps) {
    if (issues.length === 0) {
        return null;
    }

    const displayedIssues = issues.slice(0, maxDisplay);
    const remainingCount = issues.length - maxDisplay;
    const highSeverityCount = issues.filter(i => i.severity === 'high').length;

    return (
        <Card className={cn(
            "border-l-4",
            highSeverityCount > 0 ? "border-l-red-500" : "border-l-amber-500"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={cn("h-5 w-5", highSeverityCount > 0 ? "text-red-500" : "text-amber-500")} />
                        <CardTitle className="text-base">
                            {issues.length} {issues.length === 1 ? 'Node' : 'Nodes'} Require Attention
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className={severityColors.high}>
                        {highSeverityCount} Critical
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {displayedIssues.map((issue, index) => (
                    <div
                        key={`${issue.nodeId}-${issue.type}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded", severityColors[issue.severity])}>
                                {issueIcons[issue.type]}
                            </div>
                            <div>
                                <Link
                                    href={`/nodes/${issue.nodeId}`}
                                    className="font-medium text-sm hover:underline"
                                >
                                    {issue.nodeId}
                                </Link>
                                <p className="text-xs text-muted-foreground">{issue.message}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={severityColors[issue.severity]}>
                            {issue.severity}
                        </Badge>
                    </div>
                ))}

                {remainingCount > 0 && (
                    <Button variant="ghost" className="w-full mt-2" asChild>
                        <Link href="/analytics">
                            View all {issues.length} issues
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
