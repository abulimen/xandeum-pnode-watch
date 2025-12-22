/**
 * ActivityEvent - Individual event component for the activity feed
 */

'use client';

import { ActivityEvent as ActivityEventType, formatTimeAgo, getEventColorClass } from '@/lib/services/activityService';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActivityEventProps {
    event: ActivityEventType;
}

export function ActivityEventItem({ event }: ActivityEventProps) {
    const colorClass = getEventColorClass(event.type);
    const timeAgo = formatTimeAgo(event.timestamp);

    const content = (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
            {/* Icon */}
            <span className="text-lg flex-shrink-0" role="img" aria-label={event.type}>
                {event.icon}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium leading-tight", colorClass)}>
                    {event.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {timeAgo}
                </p>
            </div>
        </div>
    );

    // If event has a nodeId, make it clickable
    if (event.nodeId) {
        return (
            <Link
                href={`/nodes/${event.nodeId}`}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
