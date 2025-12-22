/**
 * InfoTooltip Component
 * Shows an info icon with a popover explaining metrics
 * Works on both desktop (hover) and mobile (tap)
 * Links to the guide page for more details
 */

'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type MetricType = 'staking-score' | 'uptime' | 'elite-nodes';

interface InfoTooltipProps {
    metric: MetricType;
    className?: string;
    iconClassName?: string;
}

const tooltipContent: Record<MetricType, { title: string; description: string; anchor: string }> = {
    'staking-score': {
        title: 'Credits',
        description: 'Official heartbeat credits from Xandeum network. Credits accumulate based on node uptime and responsiveness. Higher credits indicate better reward eligibility.',
        anchor: '#credits',
    },
    'uptime': {
        title: 'Average Uptime',
        description: 'The percentage of time nodes are online and responding to the network. Calculated from each node\'s uptime over a 24-hour period.',
        anchor: '#uptime',
    },
    'elite-nodes': {
        title: 'Elite Nodes',
        description: 'Nodes with 99.5%+ uptime that consistently demonstrate exceptional reliability. Elite status indicates top-tier performance.',
        anchor: '#elite-nodes',
    },
};

export function InfoTooltip({ metric, className, iconClassName }: InfoTooltipProps) {
    const content = tooltipContent[metric];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center rounded-full p-0.5 hover:bg-muted transition-colors",
                        className
                    )}
                    aria-label={`Learn more about ${content.title}`}
                >
                    <Info className={cn("h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors", iconClassName)} />
                </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="max-w-[280px] p-3">
                <div className="space-y-2">
                    <p className="font-semibold text-sm">{content.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {content.description}
                    </p>
                    <Link
                        href={`/guide${content.anchor}`}
                        className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                        Learn more in the Guide →
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}

