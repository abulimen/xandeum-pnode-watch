import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Credits Leaderboard | pNode Watch',
    description: 'Top performing pNodes ranked by official credits, uptime, storage, and online duration. Find the best nodes for staking your XAND.',
    openGraph: {
        title: 'Credits Leaderboard | pNode Watch',
        description: 'Top performing pNodes ranked by official credits, uptime, storage, and online duration.',
    },
};

export default function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
