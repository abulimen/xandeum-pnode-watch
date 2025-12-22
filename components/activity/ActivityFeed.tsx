/**
 * ActivityFeed - Real-time scrolling activity feed for network events
 */

'use client';

import { ActivityEvent } from '@/lib/services/activityService';
import { ActivityEventItem } from './ActivityEvent';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Trash2, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
    events: ActivityEvent[];
    onClear: () => void;
    maxHeight?: string;
    className?: string;
    showHeader?: boolean;
}

export function ActivityFeed({
    events,
    onClear,
    maxHeight = '400px',
    className,
    showHeader = true,
}: ActivityFeedProps) {
    return (
        <div className={cn("flex flex-col", className)} data-tour="activity-feed">
            {/* Header */}
            {showHeader && (
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Radio className="h-4 w-4 text-primary" />
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                        <span className="font-semibold text-sm">Live Activity</span>
                        {events.length > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {events.length}
                            </span>
                        )}
                    </div>
                    {events.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            )}

            {/* Events list */}
            <ScrollArea style={{ maxHeight }} className="flex-1">
                <div className="divide-y">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Activity className="h-8 w-8 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">No activity yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Events will appear as the network changes
                            </p>
                        </div>
                    ) : (
                        events.map((event, index) => (
                            <div
                                key={event.id}
                                className={cn(
                                    "animate-in fade-in-0 slide-in-from-top-2 duration-300",
                                    index === 0 && "bg-primary/5"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <ActivityEventItem event={event} />
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// Compact version for sidebar/drawer
export function ActivityFeedCompact({
    events,
    onClear,
    limit = 5,
}: {
    events: ActivityEvent[];
    onClear: () => void;
    limit?: number;
}) {
    const displayEvents = events.slice(0, limit);

    return (
        <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Live Activity
                    </span>
                </div>
                {events.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-6 text-xs px-2"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Events */}
            <div className="space-y-1">
                {displayEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">
                        Watching for network changes...
                    </p>
                ) : (
                    displayEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center gap-2 py-1.5 text-xs"
                        >
                            <span>{event.icon}</span>
                            <span className="truncate flex-1">{event.message}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Show more indicator */}
            {events.length > limit && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                    +{events.length - limit} more events
                </p>
            )}
        </div>
    );
}
