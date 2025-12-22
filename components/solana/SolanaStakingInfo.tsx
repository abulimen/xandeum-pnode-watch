/**
 * SolanaStakingInfo Component
 * Displays on-chain Solana data for a pNode
 */

'use client';

import { useSolanaNodeData } from '@/hooks/useSolanaNodeData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Coins,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Shield,
    TrendingUp,
    ExternalLink,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LAMPORTS_PER_SOL } from '@/types/solana';

interface SolanaStakingInfoProps {
    pubkey: string | null | undefined;
}

function formatSOL(lamports: number): string {
    const sol = lamports / LAMPORTS_PER_SOL;
    if (sol >= 1_000_000) {
        return `${(sol / 1_000_000).toFixed(2)}M`;
    }
    if (sol >= 1_000) {
        return `${(sol / 1_000).toFixed(2)}K`;
    }
    return sol.toFixed(4);
}

function formatStake(lamports: number): string {
    const sol = lamports / LAMPORTS_PER_SOL;
    if (sol >= 1_000_000) {
        return `${(sol / 1_000_000).toFixed(2)}M SOL`;
    }
    if (sol >= 1_000) {
        return `${(sol / 1_000).toFixed(1)}K SOL`;
    }
    return `${sol.toFixed(2)} SOL`;
}

export function SolanaStakingInfo({ pubkey }: SolanaStakingInfoProps) {
    const { data, isLoading, error, refetch } = useSolanaNodeData(pubkey);

    // Invalid pubkey state
    if (!pubkey) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Coins className="h-5 w-5 text-primary" />
                        On-Chain Data
                    </CardTitle>
                    <CardDescription>Solana blockchain information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No public key available for this node</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Coins className="h-5 w-5 text-primary" />
                        On-Chain Data
                    </CardTitle>
                    <CardDescription>Loading from Solana blockchain...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Skeleton className="h-24 rounded-lg" />
                        <Skeleton className="h-24 rounded-lg" />
                    </div>
                    <Skeleton className="h-32 rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Coins className="h-5 w-5 text-primary" />
                        On-Chain Data
                    </CardTitle>
                    <CardDescription>Solana blockchain information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-3 text-destructive" />
                        <p className="text-sm text-center mb-4">
                            Failed to fetch on-chain data.<br />
                            <span className="text-xs opacity-70">{error.message}</span>
                        </p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No data state
    if (!data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Coins className="h-5 w-5 text-primary" />
                        On-Chain Data
                    </CardTitle>
                    <CardDescription>Solana blockchain information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Wallet className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No on-chain data found for this address</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Coins className="h-5 w-5 text-primary" />
                            On-Chain Data
                        </CardTitle>
                        <CardDescription>Live data from Solana mainnet</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.isValidator && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Validator
                            </Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Account Balance */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Wallet className="h-4 w-4" />
                            SOL Balance
                        </div>
                        <p className="text-2xl font-bold">{formatSOL(data.lamports)} SOL</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.lamports.toLocaleString()} lamports
                        </p>
                    </div>

                    {data.isValidator && data.validatorInfo && (
                        <div className="bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                Activated Stake
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatStake(data.validatorInfo.activatedStake)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Community-delegated stake
                            </p>
                        </div>
                    )}
                </div>

                {/* Validator Details */}
                {data.isValidator && data.validatorInfo && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Validator Metrics
                        </h4>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Commission</p>
                                <p className={cn(
                                    "text-lg font-semibold",
                                    data.validatorInfo.commission <= 5
                                        ? "text-emerald-500"
                                        : data.validatorInfo.commission <= 10
                                            ? "text-amber-500"
                                            : "text-red-500"
                                )}>
                                    {data.validatorInfo.commission}%
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Last Vote Slot</p>
                                <p className="text-lg font-semibold font-mono">
                                    {data.validatorInfo.lastVote.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Epoch Credits</p>
                                <p className="text-lg font-semibold font-mono">
                                    {data.validatorInfo.epochCredits.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Vote Pubkey */}
                        <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Vote Account</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs font-mono flex-1 truncate">
                                    {data.validatorInfo.votePubkey}
                                </code>
                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" asChild>
                                    <a
                                        href={`https://solscan.io/account/${data.validatorInfo.votePubkey}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Non-validator info */}
                {!data.isValidator && (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            This node is not currently operating as a Solana validator.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Validator staking metrics are not available.
                        </p>
                    </div>
                )}

                {/* Explorer Link */}
                <Button variant="outline" className="w-full" asChild>
                    <a
                        href={`https://solscan.io/account/${pubkey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Solscan
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
