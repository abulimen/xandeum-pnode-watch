/**
 * Node Details Page - Redesigned for optimal UX
 * Balanced 50/50 layout with proper visual hierarchy
 * Enhanced with Framer Motion animations
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Activity,
    Clock,
    Wifi,
    HardDrive,
    MapPin,
    Server,
    Globe,
    Copy,
    Share2,
    Cpu,
    MemoryStick,
    Network,
    Loader2,
    Shield,
    ShieldOff,
    Info,
    Coins,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AlertSubscribeButton } from '@/components/alerts/AlertSubscribeButton';
import { useNodes, useNetworkStats, useNodeStats, useSingleNodeLocation, useShareComparison, useNodeLocations } from '@/hooks';
import { formatBytes, formatRelativeTime, enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { benchmarkNode, benchmarkService } from '@/lib/services/benchmarkService';
import { RatingBadge } from '@/components/ui/RatingBadge';
import { NetworkPositionChart } from '@/components/ui/NetworkPositionChart';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { calculateBadges } from '@/lib/services/badgeService';
import { NodeSummary } from '@/components/NodeSummary';

// Stat row item
function StatItem({ label, value, subValue, icon: Icon, status }: {
    label: string;
    value: string | number;
    subValue?: string;
    icon?: any;
    status?: 'success' | 'warning' | 'error' | 'neutral';
}) {
    const colors = {
        success: 'text-emerald-500',
        warning: 'text-amber-500',
        error: 'text-red-500',
        neutral: 'text-muted-foreground'
    };

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex items-center gap-2">
                {Icon && <Icon className={cn("h-4 w-4", colors[status || 'neutral'])} />}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <div className="text-right">
                <span className={cn("font-semibold text-sm", status && colors[status])}>{value}</span>
                {subValue && <span className="text-xs text-muted-foreground ml-1">{subValue}</span>}
            </div>
        </div>
    );
}

// Key metric card - Mobile-first design with animations
function MetricCard({ title, value, subtitle, icon, iconColor, warning, ranking }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    iconColor?: string;
    warning?: boolean;
    ranking?: { rank: number; total: number };
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <Card className={cn("overflow-hidden h-full", warning && "border-amber-500/50")}>
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        {/* Icon - Top right on mobile, right side on desktop */}
                        <div className="flex items-center justify-between sm:hidden">
                            <p className="text-xs font-medium text-muted-foreground">{title}</p>
                            <motion.div
                                className={cn("p-1.5 rounded-lg", iconColor || "bg-muted")}
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {icon}
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="text-xs font-medium text-muted-foreground hidden sm:block">{title}</p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <p className={cn("text-lg sm:text-xl font-bold", warning && "text-amber-500")}>{value}</p>
                                {ranking && (
                                    <Badge variant="secondary" className="text-[10px] font-normal h-4 px-1">#{ranking.rank}</Badge>
                                )}
                            </div>
                            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>}
                        </div>

                        {/* Icon - Desktop only */}
                        <motion.div
                            className={cn("p-2 rounded-lg flex-shrink-0 hidden sm:block", iconColor || "bg-muted")}
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {icon}
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function NodeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const nodeId = params.id as string;

    const { nodes, isLoading, isError } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const { creditsMap, creditsThreshold, totalCredits } = useCredits();

    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    const node = useMemo(() => enrichedNodes.find(n => n.id === nodeId), [enrichedNodes, nodeId]);
    const { location, isLoading: locationLoading } = useSingleNodeLocation(node || null);
    const { stats: detailedStats } = useNodeStats(node?.network?.ipAddress, node?.network?.rpcPort);
    const { copyLink } = useShareComparison();

    const benchmark = useMemo(() => {
        if (!node || enrichedNodes.length === 0) return null;
        return benchmarkNode(node, enrichedNodes);
    }, [node, enrichedNodes]);

    const rawSimilarNodes = useMemo(() => {
        if (!node || enrichedNodes.length === 0) return [];
        return benchmarkService.findSimilarNodes(node, enrichedNodes, 3);
    }, [node, enrichedNodes]);

    const { nodesWithLocation: similarNodes } = useNodeLocations(rawSimilarNodes);
    const badges = useMemo(() => node ? calculateBadges(node, enrichedNodes) : [], [node, enrichedNodes]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard?.writeText(text);
        toast.success(`${label} copied`);
    };

    const displayLocation = location || node?.location;

    // Calculations
    const storagePercent = node?.storage.total ? (node.storage.used / node.storage.total) * 100 : 0;
    const ramPercent = detailedStats?.ram_total ? (detailedStats.ram_used / detailedStats.ram_total) * 100 : null;
    const nodeCredits = node?.credits ?? 0;
    const isEligible = nodeCredits >= creditsThreshold;
    const sharePercent = totalCredits > 0 ? (nodeCredits / totalCredits) * 100 : 0;

    const formatNumber = (num: number) => {
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header issueCount={0} />
                <main className="flex-1 container px-4 py-6 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Skeleton className="h-80 rounded-xl" />
                        <Skeleton className="h-80 rounded-xl" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (isError || !node) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header issueCount={issueCount} />
                <main className="flex-1 container px-4 py-8 flex items-center justify-center">
                    <Card className="max-w-md w-full">
                        <CardContent className="pt-6 text-center space-y-4">
                            <Server className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h2 className="text-xl font-bold">Node Not Found</h2>
                            <p className="text-muted-foreground">The node "{nodeId}" could not be found.</p>
                            <Button onClick={() => router.push('/')} className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-x-hidden w-full">
            <Header issueCount={issueCount} />

            <main className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 space-y-4 sm:space-y-6 mx-auto max-w-7xl lg:max-w-none overflow-x-hidden box-border">
                {/* Back Button */}
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit -ml-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" data-tour="node-header">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-mono break-all">{node.id}</h1>
                            <StatusBadge status={node.status} showLabel size="lg" />
                            {benchmark && <RatingBadge rating={benchmark.overallRating} />}
                            <Badge variant="outline" className={cn("gap-1", node.isPublic ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20")}>
                                {node.isPublic ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                                {node.isPublic ? 'Public' : 'Private'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {displayLocation && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {displayLocation.city}, {displayLocation.country}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                {formatRelativeTime(node.lastSeen)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Server className="h-3.5 w-3.5 text-primary" />
                                v{node.version || 'Unknown'}
                            </span>
                        </div>
                        {badges.filter(b => b.earned).length > 0 && <BadgeDisplay badges={badges} size="sm" maxDisplay={5} />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AlertSubscribeButton nodeId={node.id} nodeName={node.id} />
                        <Button variant="outline" size="sm" onClick={() => router.push(`/calculator?storage=${node.storage?.total || 0}&credits=${node.credits || 0}`)} className="gap-1.5">
                            <Coins className="h-4 w-4" />
                            <span className="hidden sm:inline">Calculate</span> ROI
                        </Button>
                        <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>

                {/* Eligibility Banner */}
                <div className={cn("p-4 rounded-lg border", isEligible ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/30")}>
                    <div className="flex items-start gap-3">
                        {isEligible ? <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />}
                        <div className="space-y-1">
                            <p className={cn("font-medium text-sm", isEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                {isEligible ? "Reward Eligible" : "Below Reward Threshold"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isEligible
                                    ? `This node meets the credits threshold (${formatNumber(creditsThreshold)} credits) for reward eligibility. Currently at ${(nodeCredits / creditsThreshold * 100).toFixed(0)}% of threshold.`
                                    : `This node needs ${formatNumber(creditsThreshold - nodeCredits)} more credits to reach the threshold (${formatNumber(creditsThreshold)} credits) for reward eligibility.`
                                }
                            </p>
                            <a href="https://docs.xandeum.network/heartbeat-credit-system#:~:text=Thresholds%3A,for%20the%20epoch." target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                Learn how eligibility is calculated <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4" data-tour="node-metrics">
                    <MetricCard title="Uptime (24h)" value={`${node.uptime.toFixed(1)}%`} subtitle={node.uptime >= 95 ? "Excellent" : "Needs attention"} icon={<Activity className="h-4 w-4 text-white" />} iconColor={node.uptime >= 95 ? "bg-emerald-500" : "bg-amber-500"} warning={node.uptime < 95} ranking={benchmark?.rankings.uptime} />
                    <MetricCard title="Credits" value={formatNumber(nodeCredits)} subtitle={`${sharePercent.toFixed(2)}% of network`} icon={<Coins className="h-4 w-4 text-white" />} iconColor={isEligible ? "bg-emerald-500" : "bg-amber-500"} ranking={benchmark?.rankings.credits} />
                    <MetricCard title="Storage" value={`${storagePercent.toFixed(1)}%`} subtitle={`${formatBytes(node.storage.used)} / ${formatBytes(node.storage.total)}`} icon={<HardDrive className="h-4 w-4 text-white" />} iconColor={storagePercent < 80 ? "bg-emerald-500" : "bg-amber-500"} warning={storagePercent >= 90} ranking={benchmark?.rankings.storage} />
                    <MetricCard title="Health" value={`${node.healthScore}/100`} subtitle={node.healthScore >= 80 ? "Healthy" : "Check status"} icon={<Shield className="h-4 w-4 text-white" />} iconColor={node.healthScore >= 80 ? "bg-emerald-500" : "bg-amber-500"} warning={node.healthScore < 80} />
                </div>

                {/* Main Content - Balanced 50/50 */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 w-full min-w-0">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="w-full justify-start bg-muted/50">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="system">System</TabsTrigger>
                                <TabsTrigger value="network">Network</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                {benchmark && (
                                    <Card className="overflow-hidden w-full">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-primary" /> Network Position
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="flex-1">
                                                    <NetworkPositionChart value={nodeCredits} allValues={enrichedNodes.map(n => n.credits || 0)} label="Credits" className="h-24" />
                                                </div>
                                                <div className="flex sm:flex-col items-center justify-center gap-4 sm:gap-2 sm:border-l sm:pl-6">
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground uppercase">Rank</p>
                                                        <p className="text-2xl font-bold">#{benchmark.rankings.overall.rank}</p>
                                                        <p className="text-xs text-muted-foreground">of {benchmark.rankings.overall.total}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                <Card className="overflow-hidden w-full">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <HardDrive className="h-4 w-4 text-primary" /> Storage
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Usage</span>
                                                <span className="font-medium">{storagePercent.toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar value={storagePercent} size="lg" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center pt-2">
                                            <div className="flex justify-between items-center sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
                                                <p className="text-xs text-muted-foreground sm:order-last">Used</p>
                                                <p className="text-lg font-bold">{formatBytes(node.storage.used)}</p>
                                            </div>
                                            <div className="flex justify-between items-center sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
                                                <p className="text-xs text-muted-foreground sm:order-last">Free</p>
                                                <p className="text-lg font-bold">{formatBytes(node.storage.total - node.storage.used)}</p>
                                            </div>
                                            <div className="flex justify-between items-center sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
                                                <p className="text-xs text-muted-foreground sm:order-last">Total</p>
                                                <p className="text-lg font-bold">{formatBytes(node.storage.total)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="system">
                                {detailedStats ? (
                                    <Card className="overflow-hidden w-full">
                                        <CardContent className="p-4">
                                            <StatItem label="CPU Usage" value={`${(detailedStats.cpu_percent ?? 0).toFixed(1)}%`} icon={Cpu} status={(detailedStats.cpu_percent ?? 0) < 70 ? 'success' : 'warning'} />
                                            <StatItem label="RAM Usage" value={ramPercent ? `${ramPercent.toFixed(1)}%` : '--'} icon={MemoryStick} status={!ramPercent || ramPercent < 80 ? 'success' : 'warning'} />
                                            <StatItem label="RAM Used" value={formatBytes(detailedStats.ram_used ?? 0)} subValue={`of ${formatBytes(detailedStats.ram_total ?? 0)}`} />
                                            <StatItem label="Active Streams" value={detailedStats.active_streams ?? 0} icon={Network} />
                                            <StatItem label="Packets Received" value={(detailedStats.packets_received ?? 0).toLocaleString()} icon={Wifi} />
                                            <StatItem label="Packets Sent" value={(detailedStats.packets_sent ?? 0).toLocaleString()} />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="overflow-hidden w-full">
                                        <CardContent className="py-12 text-center text-muted-foreground">
                                            <Cpu className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            <p>System metrics unavailable</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="network">
                                <Card className="overflow-hidden w-full">
                                    <CardContent className="p-4">
                                        {node.network ? (
                                            <>
                                                <StatItem label="IP Address" value={node.network.ipAddress || 'N/A'} icon={Globe} />
                                                <StatItem label="RPC Port" value={node.network.rpcPort || 'N/A'} />
                                                <StatItem label="Main Port" value={node.network.port || 'N/A'} />
                                                <StatItem label="Version" value={node.version || 'N/A'} icon={Server} />
                                            </>
                                        ) : (
                                            <div className="py-8 text-center text-muted-foreground">
                                                <Network className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                <p>Network config unavailable</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Similar Nodes - in left column */}
                        {similarNodes.length > 0 && (
                            <Card className="overflow-hidden w-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Network className="h-4 w-4 text-primary" /> Similar Nodes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {similarNodes.slice(0, 3).map((similar) => (
                                        <div key={similar.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => router.push(`/nodes/${similar.id}`)}>
                                            <div className="min-w-0 flex-1 mr-2">
                                                <p className="font-mono text-xs font-medium truncate">{similar.id}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate">{similar.location?.country || 'Unknown'}</span>
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6 min-w-0 w-full">
                        <NodeSummary
                            node={node}
                            networkStats={{
                                avgUptime: enrichedNodes.reduce((sum, n) => sum + n.uptime, 0) / enrichedNodes.length,
                                avgHealth: enrichedNodes.reduce((sum, n) => sum + n.healthScore, 0) / enrichedNodes.length,
                                totalNodes: enrichedNodes.length,
                                creditsThreshold
                            }}
                        />
                        <Card className="overflow-hidden w-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" /> Node Identity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Public Key</p>
                                    <div className="flex items-center gap-2 bg-muted/50 p-2.5 rounded-lg">
                                        <code className="text-xs font-mono break-all flex-1">{node.publicKey || 'N/A'}</code>
                                        {node.publicKey && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(node.publicKey!, 'Public key')}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Version</p>
                                        <p className="font-mono text-sm font-semibold">{node.version || 'Unknown'}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Health</p>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2 w-2 rounded-full", node.healthScore >= 80 ? "bg-emerald-500" : "bg-amber-500")} />
                                            <p className="font-bold text-sm">{node.healthScore}/100</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden w-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" /> Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {displayLocation ? (
                                    <div className="space-y-3">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Country</span>
                                                <span className="font-medium">{displayLocation.country}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">City</span>
                                                <span className="font-medium">{displayLocation.city || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Region</span>
                                                <span className="font-medium">{displayLocation.region || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {displayLocation.coordinates && (
                                                <Button variant="outline" size="sm" className="flex-1 min-w-0" asChild>
                                                    <a href={`https://www.google.com/maps?q=${displayLocation.coordinates.lat},${displayLocation.coordinates.lng}`} target="_blank" rel="noopener noreferrer" className="truncate">
                                                        <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
                                                        <span className="truncate">View on Map</span>
                                                    </a>
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => router.push(`/map?country=${encodeURIComponent(displayLocation.country)}`)}>
                                                <Globe className="h-3.5 w-3.5 mr-2 shrink-0" />
                                                <span className="truncate">Nodes in {displayLocation.country}</span>
                                            </Button>
                                        </div>
                                    </div>
                                ) : locationLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                    </div>
                                ) : (
                                    <p className="text-center py-4 text-muted-foreground text-sm">Location unknown</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
