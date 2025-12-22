/**
 * useUserAlerts Hook
 * Fetches user alerts based on email stored in localStorage
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface UserAlert {
    id: number;
    subscription_id: number;
    node_id: string;
    alert_type: string;
    title: string;
    message: string;
    created_at: string;
    read: number;
}

interface UserAlertsResponse {
    alerts: UserAlert[];
    unreadCount: number;
    total: number;
}

const STORAGE_KEY = 'pnodewatch_subscription_email';

export function useUserAlerts() {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState<string | null>(null);

    // Get email from localStorage on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem(STORAGE_KEY);
        setEmail(storedEmail);
    }, []);

    // Fetch alerts from API
    const { data, isLoading, isError, refetch } = useQuery<UserAlertsResponse>({
        queryKey: ['userAlerts', email],
        queryFn: async () => {
            if (!email) {
                return { alerts: [], unreadCount: 0, total: 0 };
            }
            const res = await fetch(`/api/alerts/list?email=${encodeURIComponent(email)}`);
            if (!res.ok) {
                // If email not verified or not found, return empty silently
                if (res.status === 404) {
                    return { alerts: [], unreadCount: 0, total: 0 };
                }
                throw new Error('Failed to fetch alerts');
            }
            return res.json();
        },
        enabled: !!email,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000,
        retry: false, // Don't retry on errors (reduces 404 noise)
    });

    // Mark alert as read
    const markReadMutation = useMutation({
        mutationFn: async (alertId: number) => {
            const res = await fetch('/api/alerts/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markRead', alertId })
            });
            if (!res.ok) throw new Error('Failed to mark as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAlerts'] });
        }
    });

    // Mark all as read
    const markAllReadMutation = useMutation({
        mutationFn: async (subscriptionId: number) => {
            const res = await fetch('/api/alerts/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markAllRead', subscriptionId })
            });
            if (!res.ok) throw new Error('Failed to mark all as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAlerts'] });
        }
    });

    // Delete alert
    const deleteAlertMutation = useMutation({
        mutationFn: async (alertId: number) => {
            const res = await fetch('/api/alerts/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', alertId })
            });
            if (!res.ok) throw new Error('Failed to delete alert');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAlerts'] });
        }
    });

    // Save email to localStorage
    const saveEmail = (newEmail: string) => {
        localStorage.setItem(STORAGE_KEY, newEmail);
        setEmail(newEmail);
    };

    // Clear email from localStorage
    const clearEmail = () => {
        localStorage.removeItem(STORAGE_KEY);
        setEmail(null);
    };

    return {
        email,
        alerts: data?.alerts || [],
        unreadCount: data?.unreadCount || 0,
        total: data?.total || 0,
        isLoading,
        isError,
        hasSubscription: !!email,
        refetch,
        markRead: markReadMutation.mutate,
        markAllRead: markAllReadMutation.mutate,
        deleteAlert: deleteAlertMutation.mutate,
        saveEmail,
        clearEmail,
    };
}
