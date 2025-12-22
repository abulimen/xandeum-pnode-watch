import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Embeddable Widgets | pNode Watch',
    description: 'Embed live Xandeum network stats on your website. Choose from Network Badge, Live Ticker, Node Status, and Leaderboard widgets.',
    openGraph: {
        title: 'Embeddable Widgets | pNode Watch',
        description: 'Embed live Xandeum network stats on your website with our customizable widgets.',
    },
};

export default function WidgetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
