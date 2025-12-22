/**
 * MetricTooltip Component - Explanatory tooltips for metrics
 */

'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricTooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export function MetricTooltip({ children, content, side = 'top' }: MetricTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-[250px]">
                    <p className="text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface MetricLabelProps {
    label: string;
    tooltip: string;
    className?: string;
}

export function MetricLabel({ label, tooltip, className }: MetricLabelProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className={cn('inline-flex items-center gap-1 cursor-help', className)}>
                        {label}
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                    <p className="text-sm">{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Predefined metric tooltips
export const METRIC_TOOLTIPS = {
    stakingScore: 'Weighted score (0-100) based on uptime (40%), storage efficiency (25%), version (15%), and online duration (20%)',
    uptime: 'Percentage of time the node has been online in the last 24 hours',
    storage: 'Total storage committed to the network',
    storageUsage: 'Percentage of committed storage currently in use. Optimal range is 30-70%',
    version: 'Software version running on the node. Current version = latest release',
    onlineDuration: 'How long the node has been continuously running',
    healthScore: 'Overall health indicator based on status, uptime, storage, and version',
    responseTime: 'Network latency to reach the node',
} as const;
