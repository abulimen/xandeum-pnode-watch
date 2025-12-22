/**
 * TrendIndicator Component - Up/down arrows with percentage change
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
    value: number; // percentage change
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    inverted?: boolean; // For metrics where lower is better (e.g., response time)
}

const sizeConfig = {
    sm: { icon: 'h-3 w-3', text: 'text-xs' },
    md: { icon: 'h-4 w-4', text: 'text-sm' },
    lg: { icon: 'h-5 w-5', text: 'text-base' },
};

export function TrendIndicator({
    value,
    showValue = true,
    size = 'md',
    inverted = false
}: TrendIndicatorProps) {
    const isPositive = inverted ? value < 0 : value > 0;
    const isNegative = inverted ? value > 0 : value < 0;
    const isNeutral = value === 0;

    const config = sizeConfig[size];

    if (isNeutral) {
        return (
            <span className={cn("flex items-center gap-1 text-muted-foreground", config.text)}>
                <Minus className={config.icon} />
                {showValue && <span>0%</span>}
            </span>
        );
    }

    if (isPositive) {
        return (
            <span className={cn("flex items-center gap-1 text-emerald-500", config.text)}>
                <TrendingUp className={config.icon} />
                {showValue && <span>+{Math.abs(value).toFixed(1)}%</span>}
            </span>
        );
    }

    return (
        <span className={cn("flex items-center gap-1 text-red-500", config.text)}>
            <TrendingDown className={config.icon} />
            {showValue && <span>-{Math.abs(value).toFixed(1)}%</span>}
        </span>
    );
}
