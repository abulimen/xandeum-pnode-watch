import {
    Home,
    Layers,
    Zap,
    Server,
    Coins,
    Award,
    Wallet,
    Search,
    BarChart3,
    Trophy,
    Globe,
    Bell,
    Calculator,
    TrendingUp,
    Sparkles,
    GitCompare,
    Heart,
    LucideIcon
} from 'lucide-react';

export interface GuideSection {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
}

export interface GuideGroup {
    title: string;
    items: GuideSection[];
}

export const GUIDE_NAVIGATION: GuideGroup[] = [
    {
        title: 'Getting Started',
        items: [
            { id: 'introduction', title: 'Introduction', icon: Home, description: 'Welcome to pNode Watch' },
            { id: 'features', title: 'Platform Features', icon: Layers, description: 'Overview of capabilities' },
            { id: 'quick-start', title: 'Quick Start', icon: Zap, description: 'Get started in 5 steps' },
        ]
    },
    {
        title: 'Core Concepts',
        items: [
            { id: 'pnodes', title: 'What are pNodes?', icon: Server, description: 'Understanding Provider Nodes' },
            { id: 'credits', title: 'Credits System', icon: Coins, description: 'How scoring works' },
            { id: 'rewards', title: 'Rewards & STOINC', icon: Award, description: 'Earning incentives' },
            { id: 'staking', title: 'Staking on Nodes', icon: Wallet, description: 'Participation guide' },
        ]
    },
    {
        title: 'Dashboard Features',
        items: [
            { id: 'node-explorer', title: 'Node Explorer', icon: Search, description: 'Browsing the network' },
            { id: 'analytics', title: 'Analytics', icon: BarChart3, description: 'Network statistics' },
            { id: 'leaderboard', title: 'Leaderboard', icon: Trophy, description: 'Top performing nodes' },
            { id: 'map', title: 'Network Map', icon: Globe, description: 'Geographic distribution' },
            { id: 'compare', title: 'Compare Nodes', icon: GitCompare, description: 'Side-by-side comparison' },
            { id: 'watchlist', title: 'Watchlist', icon: Heart, description: 'Track favorite nodes' },
            { id: 'alerts', title: 'Alerts System', icon: Bell, description: 'Stay informed' },
        ]
    },
    {
        title: 'Tools',
        items: [
            { id: 'roi-calculator', title: 'ROI Calculator', icon: Calculator, description: 'Estimate rewards' },
            { id: 'staking-calculator', title: 'Staking Calculator', icon: TrendingUp, description: 'XANDSOL returns' },
            { id: 'copilot', title: 'AI Copilot', icon: Sparkles, description: 'AI Assistant' },
        ]
    },
];

export const FLATTENED_SECTIONS = GUIDE_NAVIGATION.flatMap(group => group.items);

export function getNextSection(currentId: string) {
    const index = FLATTENED_SECTIONS.findIndex(s => s.id === currentId);
    return index < FLATTENED_SECTIONS.length - 1 ? FLATTENED_SECTIONS[index + 1] : null;
}

export function getPrevSection(currentId: string) {
    const index = FLATTENED_SECTIONS.findIndex(s => s.id === currentId);
    return index > 0 ? FLATTENED_SECTIONS[index - 1] : null;
}
