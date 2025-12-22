'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Coins, TrendingUp, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StakingEstimatorProps {
    nodeCredits: number;
    networkTotalCredits: number;
    threshold: number;
    className?: string;
}

export function StakingEstimator({
    nodeCredits,
    networkTotalCredits,
    threshold,
    className
}: StakingEstimatorProps) {
    const analysis = useMemo(() => {
        const sharePercent = networkTotalCredits > 0
            ? (nodeCredits / networkTotalCredits) * 100
            : 0;

        const isEligible = nodeCredits >= threshold;
        const eligibilityPercent = threshold > 0
            ? Math.min(100, (nodeCredits / threshold) * 100)
            : 0;

        // DevNet fixed reward (current)
        const fixedMonthlyReward = 10_000; // XAND per pNode

        // Estimated STOINC calculation
        // When STOINC is live: Your Share = TotalFees × 94% × sharePercent
        // For now, show potential based on hypothetical monthly fee pool
        const hypotheticalMonthlyFees = 1000; // Hypothetical 1000 SOL/month network fees
        const estimatedSTOINC = hypotheticalMonthlyFees * 0.94 * (sharePercent / 100);

        return {
            sharePercent,
            isEligible,
            eligibilityPercent,
            fixedMonthlyReward,
            estimatedSTOINC,
            nodeCredits,
            threshold,
            networkTotalCredits
        };
    }, [nodeCredits, networkTotalCredits, threshold]);

    const formatNumber = (num: number) => {
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Earnings Potential
                </CardTitle>
                <CardDescription>
                    Estimated rewards based on current network performance
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Eligibility Status */}
                <div className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border",
                    analysis.isEligible
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                )}>
                    {analysis.isEligible ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className={cn(
                            "font-medium text-sm",
                            analysis.isEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                            {analysis.isEligible ? "Eligible for Rewards" : "Below Reward Threshold"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {analysis.isEligible
                                ? "This node qualifies for full epoch rewards"
                                : `Needs ${formatNumber(threshold - nodeCredits)} more credits to qualify`
                            }
                        </p>
                    </div>
                    <Badge variant="outline" className={cn(
                        "font-mono text-xs flex-shrink-0",
                        analysis.isEligible ? "border-emerald-500/50" : "border-amber-500/50"
                    )}>
                        {analysis.eligibilityPercent.toFixed(0)}%
                    </Badge>
                </div>

                {/* Credit Share */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Network Credit Share</span>
                        <span className="text-sm font-mono text-primary">
                            {analysis.sharePercent.toFixed(4)}%
                        </span>
                    </div>
                    <ProgressBar value={Math.min(100, analysis.sharePercent * 10)} size="sm" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatNumber(nodeCredits)} credits</span>
                        <span>of {formatNumber(networkTotalCredits)} total</span>
                    </div>
                </div>

                {/* Current DevNet Reward */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">DevNet Reward</span>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                            {formatNumber(analysis.fixedMonthlyReward)} XAND/mo
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Fixed monthly reward funded by Xandeum Foundation (requires eligibility)
                    </p>
                </div>

                {/* STOINC Disclaimer */}
                <div className="p-4 border border-dashed rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                STOINC Not Yet Active
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Storage Income (STOINC) will be enabled on MainNet. When active,
                                94% of all sedApp fees will be distributed to pNode operators based
                                on their boosted credits.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Estimated share when STOINC launches:</span>
                                <br />
                                Your monthly SOL = Total Fees × 94% × {analysis.sharePercent.toFixed(4)}%
                            </p>
                        </div>
                    </div>
                    <a
                        href="https://www.xandeum.network/stoinc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        Learn more about STOINC
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                {/* Boost Factors Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">💡 Boost Your Earnings:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                        <li>Early era licenses (up to 16x boost)</li>
                        <li>NFTs: Titan (11x), Dragon (4x), Coyote (2.5x)</li>
                        <li>More stake = more credits = bigger share</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
