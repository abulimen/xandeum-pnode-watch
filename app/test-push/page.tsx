'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, Check, X } from 'lucide-react';

export default function TestPushPage() {
    const [status, setStatus] = useState<string>('Ready to test');
    const [isLoading, setIsLoading] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    const testPushNotification = async () => {
        setIsLoading(true);
        setStatus('Starting push notification test...');

        try {
            // Step 1: Check browser support
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                setStatus('❌ Browser does not support push notifications');
                setIsLoading(false);
                return;
            }
            setStatus('✅ Browser supports push notifications');

            // Step 2: Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus('❌ Notification permission denied');
                setIsLoading(false);
                return;
            }
            setStatus('✅ Notification permission granted');

            // Step 3: Register service worker
            setStatus('🔄 Registering service worker...');
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
            setStatus('✅ Service worker registered');

            // Step 4: Get VAPID public key
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                setStatus('❌ VAPID public key not configured in .env.local');
                setIsLoading(false);
                return;
            }
            setStatus('✅ VAPID key found');

            // Step 5: Subscribe to push
            setStatus('🔄 Subscribing to push manager...');
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey,
            });
            setSubscription(pushSubscription);
            setStatus('✅ Push subscription created');

            // Step 6: Send test notification via API
            setStatus('🔄 Sending test push notification...');
            const subJson = pushSubscription.toJSON();

            const response = await fetch('/api/test-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: pushSubscription.endpoint,
                    p256dh: subJson.keys?.p256dh,
                    auth: subJson.keys?.auth,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setStatus('🎉 SUCCESS! Check your browser for the push notification!');
            } else {
                setStatus(`❌ Failed to send: ${result.error}`);
            }

        } catch (error) {
            console.error('Push test error:', error);
            setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Bell className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Push Notification Test</h1>
                    <p className="text-muted-foreground">
                        Click the button to test browser push notifications
                    </p>
                </div>

                <div className="bg-card border rounded-xl p-6 space-y-4">
                    <Button
                        onClick={testPushNotification}
                        disabled={isLoading}
                        className="w-full h-12 text-lg"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Bell className="mr-2 h-5 w-5" />
                                Send Test Push Notification
                            </>
                        )}
                    </Button>

                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-1">Status:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {status}
                        </p>
                    </div>

                    {subscription && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-4 w-4" />
                                <span className="text-sm font-medium">Push subscription active</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                Endpoint: {subscription.endpoint.substring(0, 50)}...
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    Make sure you allow notifications when prompted by your browser
                </p>
            </div>
        </div>
    );
}
