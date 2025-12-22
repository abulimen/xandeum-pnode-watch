/**
 * RefreshBar Component - Connection status with refresh button
 * Shows last updated time and allows manual refresh
 */

'use client';

import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RefreshBarProps {
    lastUpdated: Date | null;
    isFetching: boolean;
    isError: boolean;
    responseTime: number | null;
    onRefresh: () => void;
    className?: string;
}

export function RefreshBar({
    lastUpdated,
    isFetching,
    isError,
    responseTime,
    onRefresh,
    className,
}: RefreshBarProps) {
    const formatTimestamp = (date: Date | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 5) return 'Just now';
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString();
    };

    return (
        <div className={cn(
            "flex items-center justify-between px-4 py-2 bg-muted/30 border-b text-sm",
            className
        )}>
            <div className="flex items-center gap-3">
                {/* Connection Status */}
                <div className="flex items-center gap-1.5">
                    {isError ? (
                        <>
                            <WifiOff className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-500 font-medium">Disconnected</span>
                        </>
                    ) : (
                        <>
                            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Connected</span>
                        </>
                    )}
                </div>

                <span className="text-muted-foreground/50">•</span>

                {/* Last Updated */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTimestamp(lastUpdated)}</span>
                </div>

                {/* Response Time */}
                {responseTime !== null && (
                    <>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="text-muted-foreground font-mono text-xs">
                            {responseTime}ms
                        </span>
                    </>
                )}
            </div>

            {/* Refresh Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isFetching}
                className="h-7 px-2 gap-1.5"
            >
                <RefreshCw className={cn(
                    "h-3.5 w-3.5",
                    isFetching && "animate-spin"
                )} />
                <span className="hidden sm:inline">
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </span>
            </Button>
        </div>
    );
}
