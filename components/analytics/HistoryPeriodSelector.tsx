/**
 * HistoryPeriodSelector Component
 * Allows users to select the time period for historical data
 */

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryPeriodSelectorProps {
    value: number;
    onChange: (days: number) => void;
    options?: number[];
}

export function HistoryPeriodSelector({
    value,
    onChange,
    options = [7, 14, 30],
}: HistoryPeriodSelectorProps) {
    return (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {options.map(days => (
                <Button
                    key={days}
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(days)}
                    className={cn(
                        'px-3 py-1 h-7 text-xs font-medium transition-colors',
                        value === days
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {days}d
                </Button>
            ))}
        </div>
    );
}
