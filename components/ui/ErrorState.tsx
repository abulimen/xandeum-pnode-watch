/**
 * ErrorState Component - Display error messages with retry option
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void | Promise<void>;
}

export function ErrorState({
    message = 'An error occurred',
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
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                    {message}
                </p>
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
                            <RefreshCw className={cn(
                                "h-4 w-4 transition-transform",
                                isRetrying && "animate-spin"
                            )} />
                        )}
                        {isRetrying ? 'Retrying...' : 'Try Again'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

