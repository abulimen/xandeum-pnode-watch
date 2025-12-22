'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Server, BarChart3, Calculator, Search, Globe, Trophy, Bell, Coins, Sparkles, Code2, TrendingUp,
    Zap, HardDrive, Clock, Shield, Target, Award, CheckCircle, X, ExternalLink, ArrowRight, Info,
    GitCompare, Heart, DollarSign, Brain
} from 'lucide-react';
import Link from 'next/link';

const DOCS_URL = 'https://docs.xandeum.network';

export const GuideComponents = {
    introduction: (
        <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
                pNode Watch is a comprehensive analytics dashboard for monitoring and exploring the Xandeum pNode network.
                Whether you&apos;re a node operator, staker, or enthusiast, this platform provides real-time insights into
                network health, node performance, and staking opportunities.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4 text-center">
                        <Server className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-medium">Monitor Nodes</p>
                        <p className="text-xs text-muted-foreground">Track uptime, credits & performance</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="font-medium">Analyze Data</p>
                        <p className="text-xs text-muted-foreground">Network stats & trends</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                        <Calculator className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="font-medium">Calculate ROI</p>
                        <p className="text-xs text-muted-foreground">Estimate potential rewards</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    ),
    features: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                A complete toolkit for Xandeum network participants.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    { icon: Search, title: 'Node Explorer', desc: 'Browse all pNodes with filtering and sorting' },
                    { icon: BarChart3, title: 'Network Analytics', desc: 'Real-time charts for uptime, credits, and storage' },
                    { icon: Globe, title: 'Interactive Map', desc: 'Geographic view of node distribution' },
                    { icon: Trophy, title: 'Leaderboard', desc: 'Top nodes ranked by credits and performance' },
                    { icon: GitCompare, title: 'Compare Tool', desc: 'Side-by-side comparison of up to 4 nodes' },
                    { icon: Heart, title: 'Watchlist', desc: 'Save and track your favorite nodes' },
                    { icon: Bell, title: 'Alert System', desc: 'Email & push notifications for node status' },
                    { icon: Calculator, title: 'ROI Calculator', desc: 'Estimate rewards with ERA and NFT boosts' },
                    { icon: Coins, title: 'Staking Calculator', desc: 'XANDSOL staking returns with live APY' },
                    { icon: Sparkles, title: 'AI Copilot', desc: 'Ask questions and get AI-powered answers' },
                    { icon: Brain, title: 'Network Summary', desc: 'AI-generated insights about network health' },
                    { icon: DollarSign, title: 'Price Ticker', desc: 'Live XAND price tracking in header and footer' },
                    { icon: Code2, title: 'Embeddable Widgets', desc: 'Add live stats to your own website' },
                    { icon: TrendingUp, title: 'Trade XAND', desc: 'Integrated token info and trading' },
                ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <feature.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ),
    'quick-start': (
        <div className="space-y-6">
            <ol className="space-y-4">
                {[
                    { step: 1, title: 'Explore the Dashboard', desc: 'Visit the home page to see all active nodes with real-time status.' },
                    { step: 2, title: 'Find Top Nodes', desc: 'Use the Leaderboard to discover nodes ranked by credits and performance.' },
                    { step: 3, title: 'Check Node Details', desc: 'Click any node to see storage, uptime, credits, and ranking info.' },
                    { step: 4, title: 'Set Up Alerts', desc: 'Subscribe to email/push notifications for nodes you care about.' },
                    { step: 5, title: 'Calculate Returns', desc: 'Use our calculators to estimate staking rewards and ROI.' },
                ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {item.step}
                        </span>
                        <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    ),
    pnodes: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                A <strong>pNode (Provider Node)</strong> is the core of Xandeum&apos;s distributed storage network.
                pNodes store data, handle redundancy, and earn income proportional to their contributions.
            </p>

            <Card>
                <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Key Functions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <HardDrive className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Storage Management</strong> — Stores and retrieves data in the distributed network</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Networking</strong> — Communicates with other pNodes via gossip protocols</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Heartbeats</strong> — Responds to liveness checks every 30 seconds for rewards eligibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Security</strong> — Ensures data integrity using Merkle proofs and erasure coding</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Link
                href={`${DOCS_URL}/what-is-a-xandeum-pod`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
                Learn more about pNodes in official docs
                <ExternalLink className="h-3 w-3" />
            </Link>
        </div>
    ),
    credits: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                <strong>Credits</strong> are points accumulated by nodes based on their contributions.
                They determine your share of network rewards and are the primary performance metric.
            </p>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">How Credits Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-sm">Base Credits</p>
                            <p className="text-xs text-muted-foreground">
                                pNodes × Storage × Performance × Stake
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-sm">Boosted Credits</p>
                            <p className="text-xs text-muted-foreground">
                                Base Credits × Boost Multipliers
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium text-sm mb-2">Credits are earned by:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• <strong>Uptime</strong> — Staying consistently online</li>
                            <li>• <strong>Heartbeat Responses</strong> — +1 credit per successful heartbeat (max ~2,880/day)</li>
                            <li>• <strong>Version Compliance</strong> — Running latest software</li>
                            <li>• <strong>Network Contribution</strong> — Successful data storage and retrieval</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-amber-500" />
                        Reward Threshold
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        You need approximately <strong>80% of the network&apos;s 95th percentile credits</strong> to qualify for rewards.
                        Below this threshold = zero earnings for that epoch.
                    </p>
                </CardContent>
            </Card>

            <div>
                <h3 className="font-semibold mb-3">Viewing Credits</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>On Node Details Page:</strong></p>
                    <ul className="ml-4 space-y-1">
                        <li>• <strong>Credit Score</strong> — Total lifetime credits</li>
                        <li>• <strong>Network Rank</strong> — Position among all nodes (e.g., #5 of 232)</li>
                        <li>• <strong>Percentile</strong> — What percentage of nodes you outperform</li>
                        <li>• <strong>Reward Eligible</strong> — Green badge if above threshold</li>
                    </ul>
                </div>
            </div>

            <Link
                href={`${DOCS_URL}/heartbeat-credit-system`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
                Full credits documentation
                <ExternalLink className="h-3 w-3" />
            </Link>
        </div>
    ),
    rewards: (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Fixed Rewards
                            <Badge variant="secondary">DevNet</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>Foundation-funded incentives (~10,000 XAND/month per pNode). Covers hosting costs. Paid quarterly in seasons.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Storage Income (STOINC)
                            <Badge variant="outline">MainNet</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>Long-term earnings from app fees. 94% of fees go to pNodes. Proportional to your boosted credits share.</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Boost Multipliers</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium text-sm mb-1">ERA-Based Boosts</p>
                        <p className="text-xs text-muted-foreground">
                            Deep South (16x) → South (10x) → Mine (7x) → Coal (3.5x) → Central (2x) → North (1.25x)
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium text-sm mb-1">NFT-Based Boosts</p>
                        <p className="text-xs text-muted-foreground">
                            Titan (11x) → Dragon (4x) → Coyote (2.5x) → Rabbit (1.5x) → Cricket (1.1x)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    ),
    staking: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                There are two ways to participate in the Xandeum staking ecosystem:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Stake to pNodes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="mb-2">Stake XAND directly to high-performing nodes. Your stake contributes to their credit calculation.</p>
                        <p className="text-xs">Rewards depend on node performance and your stake share.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Stake SOL → XANDSOL</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="mb-2">Stake SOL to receive XANDSOL, a liquid staking token. Earn ~15% APY in XAND rewards.</p>
                        <Link href="/staking" className="text-primary hover:underline text-xs flex items-center gap-1">
                            Use Staking Calculator <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Choosing a Node to Stake</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Look for <strong>Reward Eligible</strong> nodes (above credits threshold)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Choose <strong>Elite</strong> (🏆) or <strong>Reliable</strong> (✅) uptime badges</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Prefer nodes running <strong>Mainnet</strong> software version</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Avoid nodes marked <strong>Not Eligible</strong> or with &lt;95% uptime</span>
                    </div>
                </div>
            </div>
        </div>
    ),
    'node-explorer': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                The main dashboard shows all active pNodes with real-time data. Use filters and search to find specific nodes.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Columns</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                        <div>• <strong>Status</strong> — Online/Degraded/Offline</div>
                        <div>• <strong>Uptime</strong> — 24h availability percentage</div>
                        <div>• <strong>Credits</strong> — Total earned credits</div>
                        <div>• <strong>Storage</strong> — Capacity and utilization</div>
                        <div>• <strong>Version</strong> — Software version + type</div>
                        <div>• <strong>Location</strong> — Country and city</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    ),
    analytics: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Track network trends over time with interactive charts showing uptime, node counts, version distribution, and more.
            </p>
            <Link href="/analytics" className="text-primary hover:underline flex items-center gap-1">
                View Analytics <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),
    leaderboard: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                See top-performing nodes ranked by credits, uptime, and response time. Great for finding reliable nodes to stake with.
            </p>
            <Link href="/leaderboard" className="text-primary hover:underline flex items-center gap-1">
                View Leaderboard <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),
    map: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Interactive world map showing geographic distribution of pNodes. Zoom, pan, and click nodes for details.
                The sidebar shows nodes grouped by country and city for easy browsing.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Map Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Country Accordion</strong> — Browse nodes by geographic region</li>
                        <li>• <strong>City Grouping</strong> — See multiple nodes in the same city</li>
                        <li>• <strong>Node Status</strong> — Color-coded markers for status</li>
                        <li>• <strong>Click for Details</strong> — Click any node to view full profile</li>
                    </ul>
                </CardContent>
            </Card>
            <Link href="/map" className="text-primary hover:underline flex items-center gap-1">
                Open Map <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),
    compare: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Compare up to 4 nodes side-by-side to analyze their performance, storage, uptime, and credits.
                Perfect for choosing which nodes to stake with or monitor.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Comparison Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Side-by-Side Stats</strong> — Compare credits, uptime, storage, and version</li>
                        <li>• <strong>Network Averages</strong> — See how nodes compare to network benchmarks</li>
                        <li>• <strong>Radar Chart</strong> — Visual comparison of key metrics</li>
                        <li>• <strong>AI Analysis</strong> — Get AI-powered insights via Copilot integration</li>
                        <li>• <strong>Share Links</strong> — Copy shareable comparison links</li>
                    </ul>
                </CardContent>
            </Card>
            <div className="flex gap-2">
                <Link
                    href="/compare"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                >
                    Open Compare Tool <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    ),
    watchlist: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Save your favorite nodes to a personalized watchlist for quick access. Track multiple nodes
                without scrolling through the entire network.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Watchlist Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Quick Favorites</strong> — Click the heart icon on any node to add it</li>
                        <li>• <strong>Persistent Storage</strong> — Your watchlist is saved locally</li>
                        <li>• <strong>Status Overview</strong> — See all your tracked nodes at a glance</li>
                        <li>• <strong>Easy Navigation</strong> — Jump to any saved node with one click</li>
                    </ul>
                </CardContent>
            </Card>
            <div className="flex items-center gap-2 p-3 rounded bg-muted/50 border">
                <Heart className="h-5 w-5 text-rose-500" />
                <span className="text-sm">Look for the <strong>heart icon</strong> on node cards and detail pages to add nodes to your watchlist.</span>
            </div>
            <Link href="/watchlist" className="text-primary hover:underline flex items-center gap-1">
                View Watchlist <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),
    alerts: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Get notified when nodes go offline, uptime drops, or versions change. Subscribe via email or browser push notifications.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Alert Types</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Node Offline</strong> — Node goes from online to offline</li>
                        <li>• <strong>Uptime Drop</strong> — Uptime falls below your threshold</li>
                        <li>• <strong>Version Change</strong> — Node updates to a new version</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    ),
    'roi-calculator': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Estimate potential pNode rewards based on your stake, storage, ERA multipliers, and NFT boosts.
                Uses real-time XAND price from Jupiter API.
            </p>
            <Link
                href="/calculator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                Open ROI Calculator <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),
    'staking-calculator': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Calculate returns for staking SOL to receive XANDSOL. See real-time APY (~15%), projected rewards,
                and XANDSOL token stats from Jupiter API.
            </p>
            <Link
                href="/staking"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
                Stake SOL Now <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),
    copilot: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Your personal AI assistant powered by advanced language models. The Copilot has access to real-time network data,
                node details, and can generate intelligent insights about the network.
            </p>
            <Card className="bg-purple-500/5 border-purple-500/20">
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Try asking:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• &quot;What&apos;s the current XAND price?&quot;</li>
                        <li>• &quot;How do credits work?&quot;</li>
                        <li>• &quot;Show me the top 5 nodes by uptime&quot;</li>
                        <li>• &quot;Compare nodes ABC123 and XYZ789&quot;</li>
                        <li>• &quot;Summarize this node&apos;s performance&quot;</li>
                        <li>• &quot;What&apos;s the network health today?&quot;</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                        Click the <Sparkles className="h-3 w-3 inline text-purple-500" /> button in the bottom-right corner to open.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Network Summary
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        The dashboard and analytics pages feature AI-generated network summaries that provide
                        intelligent insights about network health, trends, and recommendations. These summaries
                        are automatically generated and updated periodically.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
};
