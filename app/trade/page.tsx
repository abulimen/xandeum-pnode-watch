/**
 * Trade Page - Buy & Trade XAND
 * Features TradingView chart, Jupiter swap widget, and token stats
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenData } from '@/hooks/useTokenData';
import {
    TrendingUp,
    ExternalLink,
    Copy,
    Check,
    BarChart3,
    Coins,
    Info,
    RefreshCw,
    Globe,
    Twitter,
    MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';

// TradingView Widget Component
function TradingViewChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        const isDark = resolvedTheme === 'dark';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            allow_symbol_change: false,
            calendar: false,
            details: false,
            hide_side_toolbar: true,
            hide_top_toolbar: false,
            hide_legend: false,
            hide_volume: false,
            hotlist: false,
            interval: 'D',
            locale: 'en',
            save_image: true,
            style: '1',
            symbol: 'RAYDIUMCPMM:XANDSOL_C9ZJUG',
            theme: isDark ? 'dark' : 'light',
            timezone: 'Etc/UTC',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            gridColor: isDark ? 'rgba(242, 242, 242, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            watchlist: [],
            withdateranges: false,
            compareSymbols: [],
            studies: [],
            autosize: true,
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        widgetContainer.style.height = 'calc(100% - 32px)';
        widgetContainer.style.width = '100%';

        const copyright = document.createElement('div');
        copyright.className = 'tradingview-widget-copyright';
        copyright.innerHTML = `
            <a href="https://www.tradingview.com/symbols/XANDSOL_C9ZJUG/?exchange=RAYDIUMCPMM" 
               rel="noopener nofollow" target="_blank" 
               class="text-xs text-muted-foreground hover:text-primary transition-colors">
                Chart by TradingView
            </a>
        `;

        containerRef.current.appendChild(widgetContainer);
        containerRef.current.appendChild(copyright);
        widgetContainer.appendChild(script);

    }, [resolvedTheme, mounted]);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-3">
                    <BarChart3 className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading chart...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="tradingview-widget-container w-full h-full"
            style={{ minHeight: '400px' }}
        />
    );
}

// Jupiter Swap Widget Component
function JupiterSwapWidget() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const isDark = resolvedTheme === 'dark';

        // Set CSS variables for Jupiter theme
        document.documentElement.style.setProperty('--jupiter-plugin-primary', isDark ? '199, 242, 132' : '22, 163, 74');
        document.documentElement.style.setProperty('--jupiter-plugin-background', isDark ? '10, 10, 10' : '255, 255, 255');
        document.documentElement.style.setProperty('--jupiter-plugin-primary-text', isDark ? '232, 249, 255' : '15, 23, 42');
        document.documentElement.style.setProperty('--jupiter-plugin-warning', '251, 191, 36');
        document.documentElement.style.setProperty('--jupiter-plugin-interactive', isDark ? '33, 42, 54' : '241, 245, 249');
        document.documentElement.style.setProperty('--jupiter-plugin-module', isDark ? '16, 23, 31' : '248, 250, 252');

        // Load Jupiter Plugin script
        const existingScript = document.querySelector('script[src="https://plugin.jup.ag/plugin-v1.js"]');

        const initJupiter = () => {
            if (typeof window !== 'undefined' && (window as any).Jupiter) {
                (window as any).Jupiter.init({
                    displayMode: 'integrated',
                    integratedTargetId: 'jupiter-swap-container',
                    formProps: {
                        initialAmount: '1000000',
                        initialOutputMint: XAND_MINT,
                        fixedMint: XAND_MINT,
                    },
                    branding: {
                        logoUri: 'https://raw.githubusercontent.com/bernieblume/XAND-meta-2024/main/XandToken.png',
                        name: 'Buy XAND',
                    },
                });
                setIsLoading(false);
            }
        };

        if (existingScript) {
            initJupiter();
        } else {
            const script = document.createElement('script');
            script.src = 'https://plugin.jup.ag/plugin-v1.js';
            script.async = true;
            script.onload = () => {
                setTimeout(initJupiter, 500); // Give Jupiter time to initialize
            };
            document.head.appendChild(script);
        }
    }, [resolvedTheme, mounted]);

    if (!mounted) {
        return (
            <div className="w-full h-[568px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                    <Coins className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading swap widget...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card rounded-lg z-10">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Initializing swap...</p>
                    </div>
                </div>
            )}
            <div
                id="jupiter-swap-container"
                ref={containerRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: '568px' }}
            />
        </div>
    );
}

// Token Stats Card
function TokenStatsCard() {
    const { tokenData, isLoading, refetch } = useTokenData();
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        navigator.clipboard.writeText(XAND_MINT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (price: number) => {
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const formatUSD = (num: number) => `$${formatNumber(num)}`;

    const formatPriceChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    };

    return (
        <Card data-tour="trade-stats">
            <CardHeader className="pb-3 px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <img
                                src={tokenData?.logoURI || '/logo.png'}
                                alt="XAND"
                                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                            />
                        </div>
                        <div>
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                {isLoading ? <Skeleton className="h-5 w-24" /> : tokenData?.name || 'Xandeum'}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                                {isLoading ? (
                                    <Skeleton className="h-4 w-12" />
                                ) : (
                                    <>
                                        <span>{tokenData?.symbol || 'XAND'}</span>
                                        <span className="text-foreground font-semibold">
                                            {formatPrice(tokenData?.price || 0)}
                                        </span>
                                        {tokenData && (
                                            <span className={cn(
                                                "text-[10px] sm:text-xs font-medium",
                                                tokenData.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                {formatPriceChange(tokenData.priceChange24h)}
                                            </span>
                                        )}
                                    </>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-8 w-8 sm:h-9 sm:w-9">
                        <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                {/* Contract Address */}
                <div className="space-y-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Contract Address</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-[10px] sm:text-xs bg-muted px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-mono truncate">
                            {XAND_MINT}
                        </code>
                        <Button variant="outline" size="icon" onClick={copyAddress} className="h-7 w-7 sm:h-9 sm:w-9 shrink-0">
                            {copied ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Market Cap</p>
                        <p className="text-xs sm:text-sm font-semibold">
                            {isLoading ? <Skeleton className="h-5 w-16" /> : formatUSD(tokenData?.marketCap || 0)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">FDV</p>
                        <p className="text-xs sm:text-sm font-semibold">
                            {isLoading ? <Skeleton className="h-5 w-16" /> : formatUSD(tokenData?.fdv || 0)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">24h Volume</p>
                        <p className="text-xs sm:text-sm font-semibold">
                            {isLoading ? <Skeleton className="h-5 w-16" /> : formatUSD(tokenData?.volume24h || 0)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Liquidity</p>
                        <p className="text-xs sm:text-sm font-semibold">
                            {isLoading ? <Skeleton className="h-5 w-16" /> : formatUSD(tokenData?.liquidity || 0)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Holders</p>
                        <p className="text-xs sm:text-sm font-semibold">
                            {isLoading ? <Skeleton className="h-5 w-16" /> : formatNumber(tokenData?.holders || 0)}
                        </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Network</p>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-gradient-to-r from-purple-500 to-green-400" />
                            <p className="text-xs sm:text-sm font-semibold">Solana</p>
                        </div>
                    </div>
                </div>

                {/* Price Changes */}
                {tokenData && (
                    <div className="flex gap-2 text-xs">
                        <div className={cn(
                            "flex-1 rounded-lg p-1.5 sm:p-2 text-center",
                            tokenData.priceChange7d >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            <p className="text-muted-foreground text-[10px]">7d</p>
                            <p className="font-semibold text-xs sm:text-sm">{formatPriceChange(tokenData.priceChange7d)}</p>
                        </div>
                        <div className={cn(
                            "flex-1 rounded-lg p-1.5 sm:p-2 text-center",
                            tokenData.priceChange30d >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            <p className="text-muted-foreground text-[10px]">30d</p>
                            <p className="font-semibold text-xs sm:text-sm">{formatPriceChange(tokenData.priceChange30d)}</p>
                        </div>
                    </div>
                )}

                {/* Links */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm" asChild>
                        <a
                            href={`https://solscan.io/token/${XAND_MINT}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            Solscan
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm" asChild>
                        <a
                            href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx&inputMint=sol&outputMint=XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            Raydium
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


// About Card
function AboutCard() {
    return (
        <Card data-tour="trade-about">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About Xandeum
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                    <strong className="text-foreground">Xandeum</strong> is building a scalable, decentralized
                    storage layer for the Solana blockchain. It solves the "blockchain storage trilemma"
                    by providing a solution that is scalable, smart contract native, and allows for random access.
                </p>
                <p>
                    Xandeum's liquid staking pool allows SOL holders to earn rewards from both staking
                    and storage fees, making it the first multi-validator pool sharing block rewards with stakers.
                </p>
                <p>
                    The <strong className="text-foreground">XAND</strong> token serves as the governance token,
                    granting holders voting rights in the Xandeum DAO to shape the platform's future.
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://xandeum.network" target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://twitter.com/XandeumNetwork" target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://discord.com/invite/B88jTAYBhZ" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Discord
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://t.me/XandeumLabs" target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Telegram
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Main Trade Page
export default function TradePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container px-3 sm:px-4 py-4 sm:py-6">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold">Trade XAND</h1>
                        <Badge variant="secondary" className="animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                            Live
                        </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        View live charts and swap tokens for XAND directly on Solana
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
                    {/* Left Column - Chart (Order 2 on mobile, 1 on desktop) */}
                    <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                        <Card className="overflow-hidden" data-tour="trade-chart">
                            <CardHeader className="pb-0 px-4 pt-4 sm:px-6 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    XAND/SOL Price Chart
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pt-4">
                                <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                                    <TradingViewChart />
                                </div>
                            </CardContent>
                        </Card>

                        {/* About - Desktop only */}
                        <div className="hidden lg:block">
                            <AboutCard />
                        </div>
                    </div>

                    {/* Right Column - Swap & Stats (Order 1 on mobile, 2 on desktop) */}
                    <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                        {/* Jupiter Swap Widget */}
                        <Card className="overflow-hidden" data-tour="trade-swap">
                            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Swap to XAND
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Powered by Jupiter Aggregator
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <JupiterSwapWidget />
                            </CardContent>
                        </Card>

                        {/* Token Stats */}
                        <TokenStatsCard />

                        {/* About - Mobile only */}
                        <div className="lg:hidden">
                            <AboutCard />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
