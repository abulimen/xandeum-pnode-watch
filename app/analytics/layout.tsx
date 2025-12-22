import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Network Analytics | pNode Watch',
    description: 'Deep insights into the Xandeum pNode network performance, storage distribution, version adoption, and geographic coverage.',
    openGraph: {
        title: 'Network Analytics | pNode Watch',
        description: 'Deep insights into the Xandeum pNode network performance and metrics.',
    },
};

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
