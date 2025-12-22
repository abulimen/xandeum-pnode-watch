import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Global Node Map | pNode Watch',
    description: 'Interactive map showing the global distribution of Xandeum pNodes. Explore node locations, density, and geographic coverage.',
    openGraph: {
        title: 'Global Node Map | pNode Watch',
        description: 'Interactive map showing the global distribution of Xandeum pNodes.',
    },
};

export default function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
