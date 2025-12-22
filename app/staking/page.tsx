/**
 * XANDSOL Staking Calculator Page
 * For users who want to stake SOL and earn XANDSOL rewards
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Coins,
    TrendingUp,
    ExternalLink,
    Wallet,
    Clock,
    Shield,
    Zap,
    RefreshCw,
    Info,
    ArrowRight,
    Percent,
    DollarSign,
    Users,
    Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface XandSolStats {
    address: string;
    name: string;
    symbol: string;
    logoURI: string;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    marketCap: number;
    fdv: number;
    liquidity: number;
    holders: number;
    totalSupply: number;
    solPrice: number;
    stakingAPY: number;
    exchangeRate: number;
    lastUpdated: string;
}

const TIMEFRAMES = [
    { id: '1m', label: '1M', months: 1 },
    { id: '6m', label: '6M', months: 6 },
    { id: '1y', label: '1Y', months: 12 },
    { id: '5y', label: '5Y', months: 60 },
];

export default function StakingPage() {
    const [stats, setStats] = useState<XandSolStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [solAmount, setSolAmount] = useState<number>(10);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1y');

    // Fetch XandSOL data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch('/api/xandsol');
                if (!res.ok) {
                    throw new Error('Failed to fetch XandSOL data');
                }
                const data = await res.json();
                setStats(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching XandSOL stats:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Calculate staking rewards
    const calculations = useMemo(() => {
        if (!stats) return null;

        const timeframe = TIMEFRAMES.find(t => t.id === selectedTimeframe) || TIMEFRAMES[2];
        const months = timeframe.months;

        // XandSOL received for staking SOL
        const xandsolReceived = solAmount * stats.exchangeRate;
        const initialValueUSD = solAmount * stats.solPrice;

        // Calculate compound growth with APY
        const years = months / 12;
        const finalMultiplier = Math.pow(1 + (stats.stakingAPY / 100), years);
        const finalXandsol = xandsolReceived * finalMultiplier;
        const finalValueUSD = finalXandsol * stats.price;

        // Earnings
        const earningsXandsol = finalXandsol - xandsolReceived;
        const earningsUSD = finalValueUSD - initialValueUSD;
        const earningsSOL = stats.solPrice > 0 ? earningsUSD / stats.solPrice : 0;

        return {
            xandsolReceived,
            initialValueUSD,
            finalXandsol,
            finalValueUSD,
            earningsXandsol,
            earningsUSD,
            earningsSOL,
            apy: stats.stakingAPY,
        };
    }, [stats, solAmount, selectedTimeframe]);

    const formatUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
    const formatNumber = (n: number, decimals = 2) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
                {/* Page Header */}
                <div className="space-y-2" data-tour="staking-header">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">For Stakers</Badge>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Coins className="h-8 w-8 text-primary" />
                        Stake SOL
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Stake your SOL and receive XANDSOL to earn staking rewards while maintaining full liquidity.
                    </p>
                </div>

                {/* Stats Row */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="py-4">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="staking-stats">
                        <Card>
                            <CardContent className="p-6 flex flex-col justify-center">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Staking APY</div>
                                <div className="text-3xl sm:text-2xl lg:text-3xl font-bold text-green-500 truncate" title={`${formatNumber(stats.stakingAPY, 2)}%`}>
                                    {formatNumber(stats.stakingAPY, 1)}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex flex-col justify-center">
                                <div className="text-sm font-medium text-muted-foreground mb-1">XANDSOL Price</div>
                                <div className="text-3xl sm:text-2xl lg:text-3xl font-bold truncate" title={formatUSD(stats.price)}>
                                    {formatUSD(stats.price)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex flex-col justify-center">
                                <div className="text-sm font-medium text-muted-foreground mb-1">SOL Price</div>
                                <div className="text-3xl sm:text-2xl lg:text-3xl font-bold truncate" title={formatUSD(stats.solPrice)}>
                                    {formatUSD(stats.solPrice)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex flex-col justify-center">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Total Value Locked</div>
                                <div className="text-3xl sm:text-2xl lg:text-3xl font-bold truncate" title={formatUSD(stats.marketCap)}>
                                    {formatUSD(stats.marketCap)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}

                {error && (
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardContent className="py-4 text-red-500">
                            Error loading data: {error}
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Calculator */}
                    <Card className="border-primary/20" data-tour="staking-calculator">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                Staking Calculator
                            </CardTitle>
                            <CardDescription>
                                Estimate your staking rewards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={solAmount}
                                        onChange={(e) => setSolAmount(Number(e.target.value) || 0)}
                                        min={0}
                                        className="text-right pr-16 text-lg"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                        SOL
                                    </span>
                                </div>
                                {stats && stats.solPrice > 0 && (
                                    <div className="text-sm text-muted-foreground text-right">
                                        ≈ {formatUSD(solAmount * stats.solPrice)}
                                    </div>
                                )}
                            </div>

                            {/* Timeframe */}
                            <div className="space-y-2">
                                <Label>Timeframe</Label>
                                <div className="flex gap-2">
                                    {TIMEFRAMES.map(tf => (
                                        <Button
                                            key={tf.id}
                                            variant={selectedTimeframe === tf.id ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedTimeframe(tf.id)}
                                            className="flex-1"
                                        >
                                            {tf.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Results */}
                            {calculations && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">You'll Receive</span>
                                        <span className="font-bold">{formatNumber(calculations.xandsolReceived, 4)} XANDSOL</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Value After {TIMEFRAMES.find(t => t.id === selectedTimeframe)?.label}</span>
                                        <span className="font-bold">{formatNumber(calculations.finalXandsol, 4)} XANDSOL</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Earnings</span>
                                        <span className="font-bold text-green-500">
                                            +{formatNumber(calculations.earningsSOL, 4)} SOL ({formatUSD(calculations.earningsUSD)})
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 bg-muted/30 rounded-lg px-3 -mx-3">
                                        <span className="font-medium">APY</span>
                                        <span className="text-xl font-bold text-green-500">{formatNumber(calculations.apy, 1)}%</span>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                className="w-full gap-2"
                                size="lg"
                                asChild
                            >
                                <Link href="https://xandsol.xandeum.network/" target="_blank">
                                    Stake on XANDSOL
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Info Panel */}
                    <div className="space-y-6" data-tour="staking-info">
                        {/* XANDSOL Info */}
                        <Card>
                            <CardContent className="py-6">
                                <div className="flex items-start gap-4">
                                    <img
                                        src="https://raw.githubusercontent.com/bernieblume/XAND-meta-2024/main/xandSOL.png"
                                        alt="XANDSOL"
                                        className="h-12 w-12 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">XANDSOL</h3>
                                            <span className="text-sm text-muted-foreground">XANDSOL</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            XANDSOL is Xandeum's liquid staking token. Stake your SOL and receive XANDSOL to earn
                                            staking rewards while maintaining full liquidity. Your staked assets remain usable across DeFi.
                                        </p>

                                        <div className="mb-4">
                                            <h4 className="font-medium mb-2">Benefits</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <span>Liquid staking</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="h-4 w-4 text-green-500" />
                                                    <span>Auto-compounding</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-amber-500" />
                                                    <span>No lock-up period</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-purple-500" />
                                                    <span>Instant unstaking</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="https://xandsol.xandeum.network/" target="_blank">
                                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                    XANDSOL App
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="https://app.realms.today/dao/XAND" target="_blank">
                                                    <Users className="h-3.5 w-3.5 mr-1" />
                                                    Realms DAO
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="https://docs.xandeum.network" target="_blank">
                                                    <Info className="h-3.5 w-3.5 mr-1" />
                                                    Documentation
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* XAND Token Staking Info */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardContent className="py-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Percent className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold">XAND Token Staking</h3>
                                            <Badge variant="secondary" className="text-xs">15% APY</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Lock your XAND tokens for 30+ days to earn 15% APY and boost your DAO voting power on Realms.
                                        </p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="https://realms.today/dao/XAND" target="_blank">
                                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                Stake on Realms DAO
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
                    * APY is calculated from recent price performance and may vary. Past performance does not guarantee future results.
                    Always do your own research before staking.
                </p>
            </main>

            <Footer />
        </div>
    );
}
