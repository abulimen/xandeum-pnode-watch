'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    Coins,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Info,
    HelpCircle,
    Sparkles
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Boost factors from documentation
const ERA_BOOSTS = [
    { id: 'deep-south', name: 'Deep South', boost: 16, description: '1,500% boost - Early adopters' },
    { id: 'south', name: 'South', boost: 10, description: '900% boost' },
    { id: 'mine', name: 'Mine', boost: 7, description: '600% boost' },
    { id: 'coal', name: 'Coal', boost: 3.5, description: '250% boost' },
    { id: 'central', name: 'Central', boost: 2, description: '100% boost' },
    { id: 'north', name: 'North', boost: 1.25, description: '25% boost' },
    { id: 'none', name: 'No Era Boost', boost: 1, description: 'Standard rate' },
];

const NFT_BOOSTS = [
    { id: 'titan', name: 'Titan', boost: 11, description: '1,000% boost' },
    { id: 'dragon', name: 'Dragon', boost: 4, description: '300% boost' },
    { id: 'coyote', name: 'Coyote', boost: 2.5, description: '150% boost' },
    { id: 'rabbit', name: 'Rabbit', boost: 1.5, description: '50% boost' },
    { id: 'cricket', name: 'Cricket', boost: 1.1, description: '10% boost' },
    { id: 'xeno', name: 'Xeno', boost: 1.1, description: '10% boost (early owner)' },
];

// Constants from documentation
const FIXED_MONTHLY_REWARD_PER_NODE = 10000; // 10,000 XAND/month per pNode
const STOINC_PNODE_SHARE = 0.94; // 94% of fees go to pNodes

interface ROICalculatorProps {
    initialStorage?: number;
    initialCredits?: number;
    nodeId?: string;
}

export function ROICalculator({ initialStorage, initialCredits, nodeId }: ROICalculatorProps) {
    // Input states
    const [numNodes, setNumNodes] = useState(1);
    const [storageGB, setStorageGB] = useState(initialStorage || 1000);
    const [stakeAmount, setStakeAmount] = useState(250000);
    const [performance, setPerformance] = useState(100);
    const [selectedEra, setSelectedEra] = useState('south');
    const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);

    // Network data
    const [networkCredits, setNetworkCredits] = useState<number>(0);
    const [threshold, setThreshold] = useState<number>(0);
    const [xandPrice, setXandPrice] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Fetch network data
    useEffect(() => {
        async function fetchNetworkData() {
            try {
                const [creditsRes, tokenRes] = await Promise.all([
                    fetch('/api/credits'),
                    fetch('/api/token')
                ]);

                if (creditsRes.ok) {
                    const creditsData = await creditsRes.json();
                    const credits = creditsData.pods_credits || [];
                    const total = credits.reduce((sum: number, c: any) => sum + (c.credits || 0), 0);
                    setNetworkCredits(total);

                    // Calculate 95th percentile
                    const sorted = credits.map((c: any) => c.credits || 0).sort((a: number, b: number) => a - b);
                    const p95Index = Math.floor(sorted.length * 0.95);
                    const p95 = sorted[p95Index] || 0;
                    setThreshold(p95 * 0.8);
                }

                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    setXandPrice(tokenData.price || 0);
                }
            } catch (error) {
                console.error('Failed to fetch network data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNetworkData();
    }, []);

    // Calculate boosts
    const eraBoost = useMemo(() => {
        const era = ERA_BOOSTS.find(e => e.id === selectedEra);
        return era?.boost || 1;
    }, [selectedEra]);

    const nftBoost = useMemo(() => {
        if (selectedNFTs.length === 0) return 1;
        // Geometric mean of selected NFT boosts
        const boosts = selectedNFTs.map(id => NFT_BOOSTS.find(n => n.id === id)?.boost || 1);
        const product = boosts.reduce((a, b) => a * b, 1);
        return Math.pow(product, 1 / boosts.length);
    }, [selectedNFTs]);

    const totalBoost = eraBoost * nftBoost;

    // Calculate credits and rewards
    const calculations = useMemo(() => {
        // Base Credits = pNodes × Storage × Performance × Stake
        // Simplified: we normalize storage to TB and stake to 100K units
        const storageFactor = storageGB / 1000; // TB
        const stakeFactor = stakeAmount / 100000; // per 100K XAND
        const performanceFactor = performance / 100;

        const baseCredits = numNodes * storageFactor * performanceFactor * stakeFactor * 10000;
        const boostedCredits = baseCredits * totalBoost;

        // Calculate share of network
        const networkShare = networkCredits > 0 ? boostedCredits / (networkCredits + boostedCredits) : 0;

        // Fixed monthly rewards (if above threshold)
        const aboveThreshold = boostedCredits >= threshold;
        const fixedMonthly = aboveThreshold ? FIXED_MONTHLY_REWARD_PER_NODE * numNodes : 0;

        // Estimated STOINC (hypothetical based on network size)
        // Using rough estimate: assume ~$50K/month network fees at full adoption
        const estimatedNetworkFees = 50000;
        const stoincMonthly = estimatedNetworkFees * STOINC_PNODE_SHARE * networkShare;

        const totalMonthlyXAND = fixedMonthly;
        const totalMonthlyUSD = (totalMonthlyXAND * xandPrice) + stoincMonthly;
        const annualUSD = totalMonthlyUSD * 12;

        return {
            baseCredits: Math.round(baseCredits),
            boostedCredits: Math.round(boostedCredits),
            networkShare: networkShare * 100,
            aboveThreshold,
            fixedMonthly,
            stoincMonthly,
            totalMonthlyXAND,
            totalMonthlyUSD,
            annualUSD,
        };
    }, [numNodes, storageGB, stakeAmount, performance, totalBoost, networkCredits, threshold, xandPrice]);

    const toggleNFT = (id: string) => {
        setSelectedNFTs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const formatNumber = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const formatUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Inputs Panel */}
                <Card className="border-primary/20" data-tour="roi-inputs">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            Calculator Inputs
                        </CardTitle>
                        <CardDescription>
                            Configure your pNode setup to estimate rewards
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Number of pNodes */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    Number of pNodes
                                    <Popover>
                                        <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                        <PopoverContent className="text-xs max-w-[200px] p-2">Each pNode earns 10K XAND/month if above threshold</PopoverContent>
                                    </Popover>
                                </Label>
                                <span className="text-lg font-bold text-primary">{numNodes}</span>
                            </div>
                            <Slider
                                value={[numNodes]}
                                onValueChange={([v]: number[]) => setNumNodes(v)}
                                min={1}
                                max={10}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        {/* Storage */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Storage Committed (GB)
                                <Popover>
                                    <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                    <PopoverContent className="text-xs max-w-[200px] p-2">Total storage space provided across nodes</PopoverContent>
                                </Popover>
                            </Label>
                            <Input
                                type="number"
                                value={storageGB}
                                onChange={(e) => setStorageGB(Number(e.target.value) || 0)}
                                min={0}
                                className="text-right"
                            />
                        </div>

                        {/* XAND Stake */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                XAND Stake Amount
                                <Popover>
                                    <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                    <PopoverContent className="text-xs max-w-[200px] p-2">Total XAND staked for your pNodes</PopoverContent>
                                </Popover>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(Number(e.target.value) || 0)}
                                    min={0}
                                    className="text-right pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">XAND</span>
                            </div>
                            {xandPrice > 0 && (
                                <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                                    <span>≈</span>
                                    <span className="font-medium text-green-500">
                                        ${(stakeAmount * xandPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-xs">USD</span>
                                </div>
                            )}
                        </div>

                        {/* Performance */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    Performance / Uptime
                                    <Popover>
                                        <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                        <PopoverContent className="text-xs max-w-[200px] p-2">Expected uptime percentage (100% = always online)</PopoverContent>
                                    </Popover>
                                </Label>
                                <span className="font-medium">{performance}%</span>
                            </div>
                            <Slider
                                value={[performance]}
                                onValueChange={([v]: number[]) => setPerformance(v)}
                                min={50}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        {/* Era Boost */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Era Boost
                                <Popover>
                                    <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                    <PopoverContent className="text-xs max-w-[200px] p-2">Multiplier based on when you joined the network</PopoverContent>
                                </Popover>
                            </Label>
                            <Select value={selectedEra} onValueChange={setSelectedEra}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select era..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ERA_BOOSTS.map(era => (
                                        <SelectItem key={era.id} value={era.id}>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>{era.name}</span>
                                                <Badge variant="secondary" className="ml-2">{era.boost}x</Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* NFT Boosts */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                NFT Boosts
                                <Popover>
                                    <PopoverTrigger asChild><button type="button" className="cursor-help"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button></PopoverTrigger>
                                    <PopoverContent className="text-xs max-w-[200px] p-2">Select NFTs you hold (geometric mean applied)</PopoverContent>
                                </Popover>
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {NFT_BOOSTS.map(nft => (
                                    <Button
                                        key={nft.id}
                                        variant={selectedNFTs.includes(nft.id) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleNFT(nft.id)}
                                        className="gap-1"
                                    >
                                        {nft.name}
                                        <Badge variant="secondary" className="ml-1 text-xs">{nft.boost}x</Badge>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Total Boost Display */}
                        <div className="rounded-lg bg-primary/10 p-4 flex items-center justify-between">
                            <span className="text-sm font-medium">Total Boost Multiplier</span>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-2xl font-bold text-primary">{totalBoost.toFixed(2)}x</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Panel */}
                <Card className="border-green-500/20 bg-gradient-to-br from-background to-green-500/5" data-tour="roi-results">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Estimated Rewards
                        </CardTitle>
                        <CardDescription>
                            Based on current network data and your inputs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <>
                                {/* Credits */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <div className="text-sm text-muted-foreground">Base Credits</div>
                                        <div className="text-xl font-bold">{formatNumber(calculations.baseCredits)}</div>
                                    </div>
                                    <div className="rounded-lg bg-primary/10 p-4">
                                        <div className="text-sm text-muted-foreground">Boosted Credits</div>
                                        <div className="text-xl font-bold text-primary">{formatNumber(calculations.boostedCredits)}</div>
                                    </div>
                                </div>

                                {/* Threshold Status */}
                                <div className={cn(
                                    "rounded-lg p-4 flex items-center gap-3",
                                    calculations.aboveThreshold ? "bg-green-500/10" : "bg-amber-500/10"
                                )}>
                                    {calculations.aboveThreshold ? (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <div>
                                                <div className="font-medium text-green-500">Above Threshold</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Eligible for full rewards (threshold: {formatNumber(threshold)})
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <div className="font-medium text-amber-500">Below Threshold</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Need {formatNumber(threshold - calculations.boostedCredits)} more credits
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Monthly Rewards */}
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Coins className="h-4 w-4" />
                                        Monthly Rewards
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                                            <span className="text-muted-foreground">Fixed Rewards</span>
                                            <span className="font-medium">{formatNumber(calculations.fixedMonthly)} XAND</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                STOINC (est.)
                                                <Popover>
                                                    <PopoverTrigger asChild><button type="button" className="cursor-help"><Info className="h-3 w-3" /></button></PopoverTrigger>
                                                    <PopoverContent className="text-xs max-w-[200px] p-2">Storage income from network fees (mainnet)</PopoverContent>
                                                </Popover>
                                            </span>
                                            <span className="font-medium">{formatUSD(calculations.stoincMonthly)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 bg-muted/30 rounded-lg px-3 -mx-3">
                                            <span className="font-medium">Total Monthly</span>
                                            <span className="text-lg font-bold text-primary">{formatUSD(calculations.totalMonthlyUSD)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Annual Projection */}
                                <div className="rounded-xl bg-gradient-to-r from-primary/20 to-green-500/20 p-6 text-center">
                                    <div className="text-sm text-muted-foreground mb-1">Annual Earnings (Projected)</div>
                                    <div className="text-4xl font-bold text-primary">{formatUSD(calculations.annualUSD)}</div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        @ XAND price: ${xandPrice.toFixed(6)}
                                    </div>
                                </div>

                                {/* Network Share */}
                                <div className="text-center text-sm text-muted-foreground">
                                    Your share of network: <span className="font-medium text-foreground">{calculations.networkShare.toFixed(4)}%</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
