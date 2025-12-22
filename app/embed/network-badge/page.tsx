/**
 * Network Badge Embed Page
 * A minimal page that loads the widget script for embedding
 */

'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        XandeumWidget?: {
            badge: (containerId: string) => void;
            ticker: (containerId: string) => void;
            nodeStatus: (containerId: string, nodeId?: string) => void;
            leaderboard: (containerId: string) => void;
        };
    }
}

export default function NetworkBadgeEmbed() {
    const containerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const tryInit = () => {
            if (window.XandeumWidget && containerRef.current) {
                window.XandeumWidget.badge('xandeum-badge-embed');
                initialized.current = true;
            }
        };

        // Try immediately in case script is cached
        tryInit();

        // Also set up an interval to retry
        const interval = setInterval(() => {
            if (initialized.current) {
                clearInterval(interval);
                return;
            }
            tryInit();
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: transparent; }
                .embed-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 20px;
                }
            `}</style>
            <div className="embed-container">
                <div id="xandeum-badge-embed" ref={containerRef}></div>
            </div>
            <Script src="/widgets/xandeum-widget.js" strategy="afterInteractive" />
        </>
    );
}
