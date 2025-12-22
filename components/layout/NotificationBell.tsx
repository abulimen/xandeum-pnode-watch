/**
 * NotificationBell Component
 * Shows user subscription alerts in a popover
 * Integrates with useUserAlerts hook
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, AlertCircle, CheckCircle, Clock, ExternalLink, BellOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useUserAlerts } from '@/hooks/useUserAlerts';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/services/analyticsService';

export function NotificationBell() {
    const {
        email,
        alerts,
        unreadCount,
        hasSubscription,
        markRead,
        saveEmail,
    } = useUserAlerts();

    const [emailInput, setEmailInput] = useState('');
    const [isEnteringEmail, setIsEnteringEmail] = useState(false);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailInput.trim()) {
            saveEmail(emailInput.trim());
            setEmailInput('');
            setIsEnteringEmail(false);
        }
    };

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'offline':
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'score_drop':
                return <AlertCircle className="h-4 w-4 text-amber-500" />;
            default:
                return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    <p className="text-xs text-muted-foreground">
                        {hasSubscription
                            ? unreadCount > 0
                                ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
                                : 'No new alerts'
                            : 'Enter your email to view alerts'}
                    </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {!hasSubscription ? (
                        // Email entry form
                        <div className="p-4 space-y-3">
                            {isEnteringEmail ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm" className="flex-1">
                                            View Alerts
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEnteringEmail(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center space-y-3">
                                    <BellOff className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        Subscribe to node alerts to receive notifications here.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setIsEnteringEmail(true)}
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Enter Email to View Alerts
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : alerts.length > 0 ? (
                        // Alert list
                        <div className="divide-y">
                            {alerts.slice(0, 5).map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={`/nodes/${alert.node_id}`}
                                    className={cn(
                                        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors",
                                        !alert.read && "bg-primary/5"
                                    )}
                                    onClick={() => !alert.read && markRead(alert.id)}
                                >
                                    {getAlertIcon(alert.alert_type)}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm truncate",
                                            !alert.read && "font-medium"
                                        )}>
                                            {alert.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {alert.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatRelativeTime(alert.created_at)}
                                        </p>
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // No alerts
                        <div className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No alerts yet</p>
                            <p className="text-xs opacity-70 mt-1">
                                You&apos;ll see alerts here when your subscribed nodes have issues.
                            </p>
                        </div>
                    )}
                </div>

                {hasSubscription && alerts.length > 5 && (
                    <div className="p-3 border-t">
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href="/alerts">
                                View all {alerts.length} alerts
                            </Link>
                        </Button>
                    </div>
                )}

                {hasSubscription && (
                    <div className="p-3 border-t text-center">
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href="/alerts">
                                Manage Alerts
                            </Link>
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
