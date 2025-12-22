/**
 * BadgeDisplay Component
 * Displays achievement badges with custom SVG icons
 * Uses Popover for mobile-friendly tap-to-view tooltips
 */

'use client';

import { useState } from 'react';
import { Badge, BadgeType } from '@/lib/services/badgeService';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Flame } from 'lucide-react';

// Custom SVG Badge Icons
const BadgeIcons: Record<BadgeType, React.FC<{ className?: string; color?: string }>> = {
    'elite-uptime': ({ className, color = '#FFD700' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.3" />
        </svg>
    ),
    'speed-demon': ({ className, color = '#00BFFF' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'storage-champion': ({ className, color = '#9B59B6' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" />
            <rect x="2" y="9" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" fillOpacity="0.7" />
            <rect x="2" y="15" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" fillOpacity="0.4" />
            <circle cx="6" cy="6" r="1" fill="white" />
            <circle cx="6" cy="12" r="1" fill="white" />
            <circle cx="6" cy="18" r="1" fill="white" />
        </svg>
    ),
    'hot-streak': ({ className, color = '#FF6B35' }) => (
        <Flame className={className} color={color} fill={color} fillOpacity={0.2} strokeWidth={1.5} />
    ),
    'credits-leader': ({ className, color = '#00D9A5' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        </svg>
    ),
};

interface BadgeIconProps {
    badge: Badge;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

function BadgeIcon({ badge, size = 'md', showTooltip = true }: BadgeIconProps) {
    const [open, setOpen] = useState(false);
    const Icon = BadgeIcons[badge.id];
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-7 w-7',
        lg: 'h-10 w-10'
    };

    const iconElement = (
        <div
            className={cn(
                "relative rounded-full p-1.5 transition-all duration-200 cursor-pointer",
                badge.earned
                    ? "bg-gradient-to-br from-white/20 to-white/5 shadow-lg ring-1 ring-white/20"
                    : "bg-muted/50 opacity-40 grayscale"
            )}
            style={{
                boxShadow: badge.earned ? `0 0 12px ${badge.color}40` : undefined
            }}
        >
            <Icon
                className={sizeClasses[size]}
                color={badge.earned ? badge.color : '#666'}
            />
        </div>
    );

    if (!showTooltip) return iconElement;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                >
                    {iconElement}
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                className="max-w-[200px] p-3"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <div className="space-y-1">
                    <p className="font-semibold" style={{ color: badge.color }}>
                        {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {badge.description}
                    </p>
                    {!badge.earned && badge.progress !== undefined && (
                        <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">
                                Progress: {Math.round(badge.progress)}%
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${badge.progress}%`,
                                        backgroundColor: badge.color
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface BadgeDisplayProps {
    badges: Badge[];
    size?: 'sm' | 'md' | 'lg';
    showAll?: boolean; // Show unearned badges too
    maxDisplay?: number;
    className?: string;
}

export function BadgeDisplay({
    badges,
    size = 'md',
    showAll = false,
    maxDisplay,
    className
}: BadgeDisplayProps) {
    const displayBadges = showAll ? badges : badges.filter(b => b.earned);
    const limitedBadges = maxDisplay ? displayBadges.slice(0, maxDisplay) : displayBadges;
    const hiddenCount = maxDisplay ? Math.max(0, displayBadges.length - maxDisplay) : 0;

    if (limitedBadges.length === 0 && !showAll) {
        return null;
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {limitedBadges.map((badge) => (
                <BadgeIcon key={badge.id} badge={badge} size={size} />
            ))}
            {hiddenCount > 0 && (
                <div className="text-xs text-muted-foreground ml-1">
                    +{hiddenCount}
                </div>
            )}
        </div>
    );
}

interface BadgeGridProps {
    badges: Badge[];
    className?: string;
}

export function BadgeGrid({ badges, className }: BadgeGridProps) {
    const earned = badges.filter(b => b.earned);
    const unearned = badges.filter(b => !b.earned);

    return (
        <div className={cn("space-y-4", className)}>
            {earned.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Earned ({earned.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {earned.map((badge) => (
                            <BadgeIcon key={badge.id} badge={badge} size="lg" />
                        ))}
                    </div>
                </div>
            )}
            {unearned.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        In Progress ({unearned.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {unearned.map((badge) => (
                            <BadgeIcon key={badge.id} badge={badge} size="lg" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
