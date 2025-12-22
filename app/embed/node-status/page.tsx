/**
 * Node Status Embed Page
 * A minimal page that loads the widget script for embedding
 * Reads optional ?id= param to show specific node, defaults to top node
 */

'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function NodeStatusWidget() {
    const searchParams = useSearchParams();
    const nodeId = searchParams.get('id') || undefined;
    const containerRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const tryInit = () => {
            if (window.XandeumWidget && containerRef.current) {
                window.XandeumWidget.nodeStatus('xandeum-node-status-embed', nodeId);
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
    }, [nodeId]);

    return (
        <div className="embed-container">
            <div id="xandeum-node-status-embed" ref={containerRef}></div>
        </div>
    );
}

export default function NodeStatusEmbed() {
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
            <Suspense fallback={<div className="embed-container">Loading...</div>}>
                <NodeStatusWidget />
            </Suspense>
            <Script src="/widgets/xandeum-widget.js" strategy="afterInteractive" />
        </>
    );
}
