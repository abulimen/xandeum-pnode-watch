/**
 * Credits Threshold Alert
 * Shows warning when a node's credits are below reward eligibility threshold
 */

'use client';

import { AlertTriangle, CheckCircle, TrendingUp, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

const DOCS_URL = 'https://docs.xandeum.network/heartbeat-credit-system#:~:text=Thresholds%3A,for%20the%20epoch.';

interface ThresholdAlertProps {
    nodeCredits: number;
    threshold: number; // 80% of 95th percentile
    className?: string;
}

export function ThresholdAlert({
    nodeCredits,
    threshold,
    className
}: ThresholdAlertProps) {
    const isEligible = nodeCredits >= threshold;
    const percentOfThreshold = threshold > 0 ? (nodeCredits / threshold) * 100 : 0;
    const creditsNeeded = Math.max(0, threshold - nodeCredits);

    if (isEligible) {
        return (
            <Alert className={cn("border-emerald-500/30 bg-emerald-500/5", className)}>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <AlertTitle className="text-emerald-600">Reward Eligible</AlertTitle>
                <AlertDescription className="text-emerald-600/80">
                    <p>
                        This node meets the credits threshold ({threshold.toLocaleString()} credits) for reward eligibility.
                        Currently at {percentOfThreshold.toFixed(0)}% of threshold.
                    </p>
                    <Link
                        href={DOCS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs mt-2 text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                    >
                        Learn how eligibility is calculated
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </AlertDescription>
            </Alert>
        );
    }

    // Below threshold - show warning
    const severity = percentOfThreshold >= 70 ? 'warning' : 'critical';

    return (
        <Alert
            className={cn(
                severity === 'critical'
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-amber-500/30 bg-amber-500/5",
                className
            )}
        >
            <AlertTriangle className={cn(
                "h-4 w-4",
                severity === 'critical' ? "text-red-500" : "text-amber-500"
            )} />
            <AlertTitle className={severity === 'critical' ? "text-red-600" : "text-amber-600"}>
                {severity === 'critical' ? 'Below Reward Threshold' : 'Approaching Threshold'}
            </AlertTitle>
            <AlertDescription className={severity === 'critical' ? "text-red-600/80" : "text-amber-600/80"}>
                <div className="space-y-2">
                    <p>
                        This node needs <strong>{creditsNeeded.toLocaleString()}</strong> more credits
                        to meet the reward eligibility threshold ({threshold.toLocaleString()} credits).
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300",
                                    severity === 'critical' ? "bg-red-500" : "bg-amber-500"
                                )}
                                style={{ width: `${Math.min(100, percentOfThreshold)}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium">
                            {percentOfThreshold.toFixed(0)}%
                        </span>
                    </div>
                    <p className="text-xs mt-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Threshold is 80% of the network's 95th percentile credits.
                        <Link
                            href={DOCS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 ml-1 underline underline-offset-2 hover:opacity-80"
                        >
                            Learn more
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </p>
                </div>
            </AlertDescription>
        </Alert>
    );
}

interface CompactThresholdIndicatorProps {
    nodeCredits: number;
    threshold: number;
    className?: string;
}

export function CompactThresholdIndicator({
    nodeCredits,
    threshold,
    className
}: CompactThresholdIndicatorProps) {
    const isEligible = nodeCredits >= threshold;
    const percentOfThreshold = threshold > 0 ? (nodeCredits / threshold) * 100 : 0;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isEligible
                    ? "bg-emerald-500/10 text-emerald-600"
                    : percentOfThreshold >= 70
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-600"
            )}>
                {isEligible ? (
                    <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Eligible</span>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>{percentOfThreshold.toFixed(0)}%</span>
                    </>
                )}
            </div>
        </div>
    );
}
