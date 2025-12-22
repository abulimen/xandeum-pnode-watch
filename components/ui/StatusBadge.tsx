/**
 * StatusBadge Component - Color-coded status indicator
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'degraded';
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
    online: {
        color: 'bg-emerald-500',
        label: 'Online',
        variant: 'default' as const,
        className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
    },
    degraded: {
        color: 'bg-amber-500',
        label: 'Degraded',
        variant: 'default' as const,
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
    },
    offline: {
        color: 'bg-red-500',
        label: 'Offline',
        variant: 'default' as const,
        className: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    },
};

const sizeConfig = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
};

export function StatusBadge({ status, showLabel = false, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status];

    if (showLabel) {
        return (
            <Badge variant="outline" className={cn("gap-2", config.className)}>
                <span className={cn("rounded-full", config.color, sizeConfig[size])} />
                {config.label}
            </Badge>
        );
    }

    return (
        <span
            className={cn("inline-block rounded-full", config.color, sizeConfig[size])}
            title={config.label}
        />
    );
}

export function StatusDot({ status, size = 'md' }: { status: 'online' | 'offline' | 'degraded'; size?: 'sm' | 'md' | 'lg' }) {
    const config = statusConfig[status];
    return (
        <span
            className={cn("inline-block rounded-full animate-pulse", config.color, sizeConfig[size])}
            title={config.label}
        />
    );
}
