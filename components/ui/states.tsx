/**
 * ErrorState & EmptyState Components
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCcw, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void | Promise<void>;
}

export function ErrorState({
    message = 'Something went wrong. Please try again.',
    onRetry
}: ErrorStateProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        if (!onRetry || isRetrying) return;

        setIsRetrying(true);
        try {
            await onRetry();
        } finally {
            // Keep spinning for a moment to show feedback
            setTimeout(() => setIsRetrying(false), 500);
        }
    };

    return (
        <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
                {onRetry && (
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        disabled={isRetrying}
                        className="gap-2"
                    >
                        {isRetrying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                        {isRetrying ? 'Retrying...' : 'Try Again'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

interface EmptyStateProps {
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    title = 'No Data Found',
    message = 'There are no items to display.',
    action
}: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
                {action && (
                    <Button onClick={action.onClick} variant="outline">
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCcw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    );
}
