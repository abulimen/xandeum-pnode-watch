/**
 * ActivityDrawer Component
 * Header-triggered drawer with live activity feed
 */

'use client';

import { useState, useEffect } from 'react';
import { ActivityEvent } from '@/lib/services/activityService';
import { ActivityFeed } from './ActivityFeed';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ActivityDrawerProps {
    events: ActivityEvent[];
    onClear: () => void;
}

export function ActivityDrawer({ events, onClear }: ActivityDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastEventId, setLastEventId] = useState<string | null>(null);

    // Track unread events
    useEffect(() => {
        if (events.length > 0) {
            const latest = events[0];
            if (latest.id !== lastEventId) {
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
                setLastEventId(latest.id);
            }
        }
    }, [events, isOpen, lastEventId]);

    // Reset unread count when opened
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    title="Live Network Activity"
                >
                    <Radio className={cn("h-4 w-4", unreadCount > 0 && "text-primary animate-pulse")} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Live Activity ({unreadCount} new)</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </div>
                            <SheetTitle>Live Network Activity</SheetTitle>
                        </div>
                        {events.length > 0 && (
                            <Badge variant="secondary" className="font-mono">
                                {events.length} events
                            </Badge>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    <ActivityFeed
                        events={events}
                        onClear={onClear}
                        maxHeight="100%"
                        showHeader={false}
                        className="h-full"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
