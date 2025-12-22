/**
 * Alerts Page - View and manage subscription alerts
 */

'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    BellOff,
    AlertCircle,
    CheckCircle,
    Clock,
    Mail,
    Trash2,
    Check,
    ExternalLink
} from 'lucide-react';
import { useUserAlerts, UserAlert } from '@/hooks/useUserAlerts';
import { formatRelativeTime } from '@/lib/services/analyticsService';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AlertsPage() {
    const {
        email,
        alerts,
        unreadCount,
        hasSubscription,
        isLoading,
        markRead,
        markAllRead,
        deleteAlert,
        saveEmail,
        clearEmail,
    } = useUserAlerts();

    const [emailInput, setEmailInput] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailInput.trim()) {
            saveEmail(emailInput.trim());
            setEmailInput('');
        }
    };

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'offline':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'score_drop':
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            default:
                return <Clock className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getAlertBadge = (alertType: string) => {
        switch (alertType) {
            case 'offline':
                return <Badge variant="destructive">Offline</Badge>;
            case 'score_drop':
                return <Badge className="bg-amber-500">Score Drop</Badge>;
            default:
                return <Badge variant="secondary">{alertType}</Badge>;
        }
    };

    const filteredAlerts = filter === 'unread'
        ? alerts.filter(a => !a.read)
        : alerts;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container px-4 py-6 space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Alerts
                        </h1>
                        <p className="text-muted-foreground">
                            View and manage your subscription alerts
                        </p>
                    </div>
                    {hasSubscription && alerts.length > 0 && unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alerts.length > 0 && markAllRead(alerts[0].subscription_id)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {!hasSubscription ? (
                    // Email entry section
                    <Card>
                        <CardHeader className="text-center">
                            <BellOff className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                            <CardTitle>View Your Alerts</CardTitle>
                            <CardDescription>
                                Enter the email address you used to subscribe to node alerts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Load
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Don&apos;t have alerts set up?{' '}
                                    <Link href="/" className="text-primary hover:underline">
                                        Subscribe to a node
                                    </Link>
                                    {' '}to get started.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Subscription info & filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{email}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-auto py-1 px-2"
                                            onClick={clearEmail}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={filter === 'all' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilter('all')}
                                        >
                                            All ({alerts.length})
                                        </Button>
                                        <Button
                                            variant={filter === 'unread' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setFilter('unread')}
                                        >
                                            Unread ({unreadCount})
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alerts list */}
                        {isLoading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                                        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : filteredAlerts.length > 0 ? (
                            <div className="space-y-3">
                                {filteredAlerts.map((alert) => (
                                    <Card
                                        key={alert.id}
                                        className={cn(
                                            "transition-all",
                                            !alert.read && "border-primary/30 bg-primary/5"
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {getAlertIcon(alert.alert_type)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn(
                                                            "font-medium",
                                                            !alert.read && "font-semibold"
                                                        )}>
                                                            {alert.title}
                                                        </span>
                                                        {getAlertBadge(alert.alert_type)}
                                                        {!alert.read && (
                                                            <Badge variant="outline" className="text-[10px]">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        <span>{formatRelativeTime(alert.created_at)}</span>
                                                        <Link
                                                            href={`/nodes/${alert.node_id}`}
                                                            className="text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            View Node
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {!alert.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => markRead(alert.id)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => deleteAlert(alert.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                    <h3 className="font-medium mb-1">
                                        {filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {filter === 'unread'
                                            ? 'All caught up! Check back later.'
                                            : 'You\'ll see alerts here when your subscribed nodes have issues.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
