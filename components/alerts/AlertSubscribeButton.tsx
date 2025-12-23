/**
 * AlertSubscribeButton Component
 * Modern subscription modal for comprehensive node monitoring
 * Supports email and browser push notifications
 */

'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Loader2,
    Mail,
    Smartphone,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Wifi,
    WifiOff,
    RefreshCw,
    HardDrive,
    Shield,
    Check,
    ChevronDown,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AlertSubscribeButtonProps {
    nodeId: string;
    nodeName?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Alert type configuration
const ALERT_CATEGORIES = [
    {
        id: 'status',
        label: 'Status Changes',
        description: 'Node connectivity alerts',
        alerts: [
            { id: 'offline', label: 'Node goes offline', icon: WifiOff, color: 'text-red-500', bg: 'bg-red-500/10' },
            { id: 'online', label: 'Node comes back online', icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'degraded', label: 'Node becomes degraded', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ],
    },
    {
        id: 'performance',
        label: 'Performance Metrics',
        description: 'Credits and uptime monitoring',
        alerts: [
            { id: 'score_drop', label: 'Credits drops', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', hasThreshold: true, thresholdLabel: 'below', unit: '', defaultThreshold: 30000 },
            { id: 'score_rise', label: 'Credits rises', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', hasThreshold: true, thresholdLabel: 'above', unit: '', defaultThreshold: 40000 },
            { id: 'uptime_drop', label: 'Uptime drops', icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-500/10', hasThreshold: true, thresholdLabel: 'below', unit: '%', defaultThreshold: 95 },
            { id: 'uptime_rise', label: 'Uptime rises', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', hasThreshold: true, thresholdLabel: 'above', unit: '%', defaultThreshold: 99 },
        ],
    },
    {
        id: 'changes',
        label: 'Configuration Changes',
        description: 'Version and storage updates',
        alerts: [
            { id: 'version', label: 'Version changes', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'storage', label: 'Storage capacity changes', icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'public_status', label: 'Public/Private status changes', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        ],
    },
];

export function AlertSubscribeButton({
    nodeId,
    nodeName,
    variant = 'outline',
    size = 'sm',
}: AlertSubscribeButtonProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Notification methods
    const [enableEmail, setEnableEmail] = useState(true);
    const [enableBrowser, setEnableBrowser] = useState(false);
    const [browserSupported, setBrowserSupported] = useState(false);
    const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

    // Alert selections (dynamic based on ALERT_CATEGORIES)
    const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set(['offline', 'score_drop']));
    const [thresholds, setThresholds] = useState<Record<string, number>>({
        score_drop: 30000,
        score_rise: 40000,
        uptime_drop: 95,
        uptime_rise: 99,
    });

    // Expanded categories for accordion
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['status', 'performance']));

    // Check browser notification support
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
            setBrowserSupported(true);
            setBrowserPermission(Notification.permission);
        }
    }, []);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const toggleAlert = (alertId: string) => {
        setSelectedAlerts(prev => {
            const next = new Set(prev);
            if (next.has(alertId)) {
                next.delete(alertId);
            } else {
                next.add(alertId);
            }
            return next;
        });
    };

    const requestBrowserPermission = async () => {
        if (!browserSupported) return;

        try {
            const permission = await Notification.requestPermission();
            setBrowserPermission(permission);
            if (permission === 'granted') {
                setEnableBrowser(true);
                toast.success('Browser notifications enabled!');
            } else if (permission === 'denied') {
                toast.error('Browser notifications were blocked');
            }
        } catch {
            toast.error('Failed to request notification permission');
        }
    };

    const handleSubscribe = async () => {
        // Validation
        if (!enableEmail && !enableBrowser) {
            toast.error('Please enable at least one notification method');
            return;
        }

        if (enableEmail && (!email || !email.includes('@'))) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (selectedAlerts.size === 0) {
            toast.error('Please select at least one alert type');
            return;
        }

        setIsLoading(true);

        try {
            // Get push subscription if browser notifications enabled
            let pushSubscription = null;
            if (enableBrowser && browserPermission === 'granted') {
                try {
                    // Register service worker if not already registered
                    let registration = await navigator.serviceWorker.getRegistration('/sw.js');

                    if (!registration) {
                        console.log('[Subscribe] Registering service worker...');
                        registration = await navigator.serviceWorker.register('/sw.js');
                        // Wait for the service worker to be ready
                        await navigator.serviceWorker.ready;
                    }

                    // Check if we have the VAPID key
                    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                    if (!vapidKey) {
                        console.warn('[Subscribe] No VAPID public key configured');
                        toast.error('Push notifications not configured. Using email only.');
                    } else if (registration) {
                        // Subscribe to push with the VAPID key
                        console.log('[Subscribe] Subscribing to push manager...');
                        pushSubscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: vapidKey,
                        });
                        console.log('[Subscribe] Push subscription successful');
                    }
                } catch (pushError) {
                    console.warn('[Subscribe] Push subscription failed:', pushError);
                    toast.error('Browser push failed. Continuing with email if enabled.');
                    // Don't fail the entire subscription, just skip push
                }
            }

            // If push was enabled but failed, and no email, alert user
            if (enableBrowser && !pushSubscription && !enableEmail) {
                toast.error('Push notification setup failed and email is not enabled. Please enable email or try again.');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: enableEmail ? email : null,
                    nodeIds: [nodeId],
                    // Status alerts
                    alertOffline: selectedAlerts.has('offline'),
                    alertOnline: selectedAlerts.has('online'),
                    alertDegraded: selectedAlerts.has('degraded'),
                    // Performance alerts
                    alertScoreDrop: selectedAlerts.has('score_drop'),
                    alertScoreRise: selectedAlerts.has('score_rise'),
                    alertUptimeDrop: selectedAlerts.has('uptime_drop'),
                    alertUptimeRise: selectedAlerts.has('uptime_rise'),
                    // Change alerts
                    alertVersionChange: selectedAlerts.has('version'),
                    alertStorageChange: selectedAlerts.has('storage'),
                    alertPublicStatusChange: selectedAlerts.has('public_status'),
                    // Thresholds
                    scoreDropThreshold: thresholds.score_drop,
                    scoreRiseThreshold: thresholds.score_rise,
                    uptimeDropThreshold: thresholds.uptime_drop,
                    uptimeRiseThreshold: thresholds.uptime_rise,
                    // Push subscription
                    pushSubscription: pushSubscription ? {
                        endpoint: pushSubscription.endpoint,
                        p256dh: pushSubscription.toJSON().keys?.p256dh,
                        auth: pushSubscription.toJSON().keys?.auth,
                    } : null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(
                    enableEmail
                        ? 'Check your email to verify your subscription!'
                        : 'Successfully subscribed to alerts!'
                );
                setOpen(false);
                setEmail('');
            } else {
                toast.error(result.error || 'Failed to subscribe');
            }
        } catch {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCount = selectedAlerts.size;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className="gap-1.5">
                    <Bell className="h-4 w-4" />
                    {size !== 'icon' && <span>Watch</span>}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[95vw] sm:max-w-lg p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-lg font-semibold">
                                Subscribe to Node Alerts
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {nodeName || nodeId}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content - Scrollable */}
                <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">

                    {/* Notification Methods */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Notification Method</span>
                            <span className="text-xs text-muted-foreground">(required)</span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            {/* Email */}
                            <button
                                type="button"
                                onClick={() => setEnableEmail(!enableEmail)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                    enableEmail
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                                )}
                            >
                                <div className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                                    enableEmail ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-xs text-muted-foreground truncate">Detailed alerts</p>
                                </div>
                                {enableEmail && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                            </button>

                            {/* Browser */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (browserPermission !== 'granted' && !enableBrowser) {
                                        requestBrowserPermission();
                                    } else {
                                        setEnableBrowser(!enableBrowser);
                                    }
                                }}
                                disabled={!browserSupported || browserPermission === 'denied'}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                                    enableBrowser
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
                                    (!browserSupported || browserPermission === 'denied') && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                                    enableBrowser ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">Push</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {!browserSupported
                                            ? 'Not supported'
                                            : browserPermission === 'denied'
                                                ? 'Blocked'
                                                : 'Instant alerts'}
                                    </p>
                                </div>
                                {enableBrowser && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                            </button>
                        </div>

                        {/* Email Input */}
                        {enableEmail && (
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 rounded-xl border-2 focus:border-primary"
                                />
                            </div>
                        )}
                    </div>

                    {/* Alert Types - Accordion */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Alert Types</span>
                            <span className="text-xs text-muted-foreground">
                                {selectedCount} selected
                            </span>
                        </div>

                        <div className="space-y-2">
                            {ALERT_CATEGORIES.map((category) => (
                                <div
                                    key={category.id}
                                    className="rounded-xl border overflow-hidden"
                                >
                                    {/* Category Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category.id)}
                                        className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{category.label}</p>
                                            <p className="text-xs text-muted-foreground">{category.description}</p>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 text-muted-foreground transition-transform",
                                                expandedCategories.has(category.id) && "rotate-180"
                                            )}
                                        />
                                    </button>

                                    {/* Category Alerts */}
                                    {expandedCategories.has(category.id) && (
                                        <div className="border-t bg-muted/20 p-2 space-y-1">
                                            {category.alerts.map((alert) => {
                                                const Icon = alert.icon;
                                                const isSelected = selectedAlerts.has(alert.id);

                                                return (
                                                    <div key={alert.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleAlert(alert.id)}
                                                            className={cn(
                                                                "flex items-center gap-3 w-full p-2.5 rounded-lg transition-all text-left",
                                                                isSelected
                                                                    ? "bg-background shadow-sm border"
                                                                    : "hover:bg-background/50"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                                                                alert.bg
                                                            )}>
                                                                <Icon className={cn("h-4 w-4", alert.color)} />
                                                            </div>
                                                            <span className="text-sm flex-1">{alert.label}</span>
                                                            <div className={cn(
                                                                "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors shrink-0",
                                                                isSelected
                                                                    ? "bg-primary border-primary"
                                                                    : "border-muted-foreground/30"
                                                            )}>
                                                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                            </div>
                                                        </button>

                                                        {/* Threshold Input */}
                                                        {isSelected && 'hasThreshold' in alert && (alert as { hasThreshold?: boolean }).hasThreshold && (
                                                            <div className="ml-11 mt-2 mb-1 flex items-center gap-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    Notify when {(alert as { thresholdLabel?: string }).thresholdLabel}
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={thresholds[alert.id] || (alert as { defaultThreshold?: number }).defaultThreshold}
                                                                    onChange={(e) => setThresholds(prev => ({
                                                                        ...prev,
                                                                        [alert.id]: parseInt(e.target.value) || (alert as { defaultThreshold?: number }).defaultThreshold || 0
                                                                    }))}
                                                                    className="w-16 h-7 text-xs text-center rounded-lg"
                                                                />
                                                                <span className="text-xs text-muted-foreground">{(alert as { unit?: string }).unit}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="flex gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-xs">
                            You&apos;ll receive alerts when any of your selected conditions are met.
                            Email subscribers will receive a verification link.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 pt-4 border-t bg-muted/30">
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 sm:flex-none rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubscribe}
                            disabled={isLoading || selectedCount === 0}
                            className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Subscribing...
                                </>
                            ) : (
                                <>
                                    <Bell className="mr-2 h-4 w-4" />
                                    Subscribe ({selectedCount} alerts)
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
