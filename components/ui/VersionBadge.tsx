/**
 * VersionBadge Component
 * Displays version type with warning for experimental versions
 * Includes popover with explanation and link to guide
 */

'use client';

import { AlertTriangle, FlaskConical, TestTube2, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type VersionType = 'mainnet' | 'trynet' | 'devnet' | 'unknown';

interface VersionBadgeProps {
    version: string;
    versionType?: VersionType;
    showFullVersion?: boolean;
    className?: string;
}

const versionConfig: Record<VersionType, {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    warning?: string;
}> = {
    mainnet: {
        label: 'Mainnet',
        icon: <Check className="h-3 w-3" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        description: 'This node is running a production-ready mainnet version.',
    },
    trynet: {
        label: 'TRYNET',
        icon: <TestTube2 className="h-3 w-3" />,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        description: 'This node is running experimental trynet (test network) software.',
        warning: 'Trynet nodes may have bugs, instability, or untested features. Consider this carefully before staking.',
    },
    devnet: {
        label: 'DEVNET',
        icon: <FlaskConical className="h-3 w-3" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'This node is running development network software.',
        warning: 'Devnet nodes are intended for development and testing only. Not recommended for staking.',
    },
    unknown: {
        label: 'Unknown',
        icon: <AlertTriangle className="h-3 w-3" />,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-border',
        description: 'Unable to determine the version type of this node.',
    },
};

export function VersionBadge({ version, versionType = 'unknown', showFullVersion = false, className }: VersionBadgeProps) {
    const config = versionConfig[versionType];
    const isExperimental = versionType === 'trynet' || versionType === 'devnet';

    // For mainnet, just show the version without a badge
    if (versionType === 'mainnet' && !showFullVersion) {
        return (
            <span className={cn("font-mono text-sm", className)}>
                {version}
            </span>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium transition-colors hover:opacity-80",
                        config.bgColor,
                        config.borderColor,
                        config.color,
                        isExperimental && "animate-pulse-subtle cursor-pointer",
                        className
                    )}
                >
                    {config.icon}
                    <span>{config.label}</span>
                    {isExperimental && <AlertTriangle className="h-3 w-3 ml-0.5" />}
                </button>
            </PopoverTrigger>
            <PopoverContent side="top" className="max-w-[300px] p-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-full", config.bgColor)}>
                            {config.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{config.label} Version</p>
                            <p className="text-xs font-mono text-muted-foreground truncate max-w-[220px]">
                                {version}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {config.description}
                    </p>

                    {config.warning && (
                        <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                {config.warning}
                            </p>
                        </div>
                    )}

                    <Link
                        href="/guide#version-types"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                        Learn more about version types →
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
