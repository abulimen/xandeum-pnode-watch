/**
 * Embed Layout - Minimal layout for embeddable widgets
 * No header, footer, or navigation
 * NOTE: This is a nested layout, so it should NOT define html/body tags
 * Those are inherited from the root layout
 */

import './embed.css';

export default function EmbedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="embed-body">
            {children}
        </div>
    );
}
