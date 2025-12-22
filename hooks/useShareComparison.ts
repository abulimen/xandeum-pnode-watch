/**
 * Hook for sharing comparison results
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useShareComparison() {
    const [isSharing, setIsSharing] = useState(false);

    const copyLink = async () => {
        setIsSharing(true);
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error('Failed to copy link');
        } finally {
            setIsSharing(false);
        }
    };

    return {
        copyLink,
        isSharing,
    };
}
