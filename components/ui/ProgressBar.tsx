/**
 * ProgressBar Component - Storage utilization visualization
 */

import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number; // percentage 0-100
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeConfig = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
};

function getColorClass(value: number): string {
    if (value >= 95) return 'bg-red-500';
    if (value >= 90) return 'bg-amber-500';
    if (value >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
}

export function ProgressBar({
    value,
    showLabel = true,
    size = 'md',
    className
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));
    const colorClass = getColorClass(clampedValue);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", sizeConfig[size])}>
                <div
                    className={cn("h-full transition-all duration-300", colorClass)}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                    {clampedValue.toFixed(1)}%
                </span>
            )}
        </div>
    );
}

interface StorageBarProps {
    used: number; // bytes
    total: number; // bytes
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function StorageBar({ used, total, showLabel = true, size = 'md', className }: StorageBarProps) {
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className={cn("space-y-1", className)}>
            <ProgressBar value={percentage} showLabel={false} size={size} />
            {showLabel && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatBytes(used)}</span>
                    <span>{formatBytes(total)}</span>
                </div>
            )}
        </div>
    );
}

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
}
