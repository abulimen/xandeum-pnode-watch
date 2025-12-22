/**
 * TimeRangeSelector Component - Toggle for time ranges
 */

'use client';

import { Button } from '@/components/ui/button';
import { TimeRange } from '@/types/filters';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
    return (
        <div className="inline-flex rounded-lg border p-1 bg-muted/50">
            {options.map((option) => (
                <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 px-3 rounded-md",
                        value === option.value && "bg-background shadow-sm"
                    )}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
