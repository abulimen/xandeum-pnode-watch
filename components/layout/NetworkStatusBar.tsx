/**
 * NetworkStatusBar Component
 * Shows network connection status, data freshness, and refresh button
 * Displays on all pages below the header
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, WifiOff, Wifi, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NetworkStatusBarProps {
    lastUpdated?: Date | null;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    isError?: boolean;
}

export function NetworkStatusBar({
    lastUpdated,
    isRefreshing = false,
    onRefresh,
    isError = false
}: NetworkStatusBarProps) {
    const [isOnline, setIsOnline] = useState(true);
    const [showOfflineBanner, setShowOfflineBanner] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<'good' | 'slow' | 'offline'>('good');
    const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);
    const hasShownErrorToast = useRef(false);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineBanner(false);
            setConnectionQuality('good');
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineBanner(true);
            setConnectionQuality('offline');
        };

        // Check initial state
        setIsOnline(navigator.onLine);
        if (!navigator.onLine) {
            setShowOfflineBanner(true);
            setConnectionQuality('offline');
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Monitor connection quality using Network Information API
    useEffect(() => {
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            const updateConnectionQuality = () => {
                if (!navigator.onLine) {
                    setConnectionQuality('offline');
                } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                    setConnectionQuality('slow');
                } else {
                    setConnectionQuality('good');
                }
            };

            updateConnectionQuality();
            connection.addEventListener('change', updateConnectionQuality);

            return () => {
                connection.removeEventListener('change', updateConnectionQuality);
            };
        }
    }, []);

    // Format last updated time
    const formatLastUpdated = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);

        if (diffSecs < 10) return 'Just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffMins < 60) return `${diffMins}m ago`;
        return date.toLocaleTimeString();
    };

    // Auto-update the "time ago" display
    const [, forceUpdate] = useState({});
    useEffect(() => {
        const interval = setInterval(() => forceUpdate({}), 10000); // Update every 10s
        return () => clearInterval(interval);
    }, []);

    // Handle refresh with local spinning and error handling
    const handleRefresh = async () => {
        if (!onRefresh || !isOnline) {
            if (!isOnline) {
                toast.error('Cannot refresh while offline');
            }
            return;
        }

        setIsLocalRefreshing(true);
        hasShownErrorToast.current = false;

        try {
            await onRefresh();
        } catch {
            if (!hasShownErrorToast.current) {
                toast.error('Failed to refresh data. Please check your network connection.');
                hasShownErrorToast.current = true;
            }
        } finally {
            // Keep spinning for a minimum time for visual feedback
            setTimeout(() => setIsLocalRefreshing(false), 500);
        }
    };

    // Show error toast when isError changes to true during refresh
    useEffect(() => {
        if (isError && isLocalRefreshing && !hasShownErrorToast.current) {
            toast.error('Failed to refresh data. Please check your network connection.');
            hasShownErrorToast.current = true;
        }
    }, [isError, isLocalRefreshing]);

    // Combined refreshing state
    const showSpinner = isLocalRefreshing || isRefreshing;

    return (
        <>
            {/* Offline Banner - Full width, prominent */}
            {showOfflineBanner && (
                <div className="sticky top-14 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span>You are offline. Some data may be outdated.</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 px-2 text-white hover:bg-white/20"
                        onClick={() => setShowOfflineBanner(false)}
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Slow Connection Warning */}
            {connectionQuality === 'slow' && !showOfflineBanner && (
                <div className="sticky top-14 z-50 bg-amber-500 text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Slow connection detected. Data may take longer to load.</span>
                </div>
            )}

            {/* Status Bar - Compact, always visible, sticky below header */}
            <div className="sticky top-14 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container px-4 py-1.5 flex items-center justify-between text-xs">
                    {/* Left: Connection Status */}
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-1.5",
                            isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                            {isOnline ? (
                                <Wifi className="h-3 w-3" />
                            ) : (
                                <WifiOff className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline font-medium">
                                {isOnline ? 'Connected' : 'Offline'}
                            </span>
                        </div>

                        {isError && isOnline && (
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="hidden sm:inline">API Error</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Last Updated & Refresh */}
                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Updated {formatLastUpdated(lastUpdated)}</span>
                            </div>
                        )}

                        {onRefresh && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={handleRefresh}
                                disabled={showSpinner || !isOnline}
                            >
                                <RefreshCw className={cn(
                                    "h-3 w-3 mr-1",
                                    showSpinner && "animate-spin"
                                )} />
                                <span className="hidden sm:inline">
                                    {showSpinner ? 'Refreshing...' : 'Refresh'}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
