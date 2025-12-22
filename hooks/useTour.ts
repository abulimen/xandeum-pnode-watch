/**
 * useTour - Hook for managing guided tours with driver.js
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_COMPLETED_PREFIX = 'xandeum-tour-completed-';

export function useTour(tourId: string, steps: DriveStep[]) {
    const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true to prevent flash
    const [isActive, setIsActive] = useState(false);

    // Check if tour has been seen on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const completed = localStorage.getItem(`${TOUR_COMPLETED_PREFIX}${tourId}`);
            setHasSeenTour(completed === 'true');
        }
    }, [tourId]);

    // Start the tour
    const startTour = useCallback(() => {
        if (typeof window === 'undefined') return;

        const driverObj = driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            steps,
            popoverClass: 'xandeum-tour-popover',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            stagePadding: 8,
            stageRadius: 8,
            animate: true,
            allowClose: true,
            smoothScroll: true,
            onDestroyStarted: () => {
                // Mark tour as completed
                localStorage.setItem(`${TOUR_COMPLETED_PREFIX}${tourId}`, 'true');
                setHasSeenTour(true);
                setIsActive(false);
                driverObj.destroy();
            },
            onPopoverRender: (popover) => {
                // Custom styling for popover
                popover.wrapper.style.maxWidth = '340px';
            },
        });

        setIsActive(true);
        driverObj.drive();
    }, [steps, tourId]);

    // Reset tour (for debugging or user preference)
    const resetTour = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`${TOUR_COMPLETED_PREFIX}${tourId}`);
            setHasSeenTour(false);
        }
    }, [tourId]);

    // Reset all tours
    const resetAllTours = useCallback(() => {
        if (typeof window !== 'undefined') {
            Object.keys(localStorage)
                .filter(key => key.startsWith(TOUR_COMPLETED_PREFIX))
                .forEach(key => localStorage.removeItem(key));
            setHasSeenTour(false);
        }
    }, []);

    return {
        hasSeenTour,
        isActive,
        startTour,
        resetTour,
        resetAllTours,
    };
}

// Global styles for driver.js (add to globals.css)
export const tourStyles = `
/* driver.js custom styling */
.driver-popover {
    background: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.driver-popover-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.driver-popover-description {
    font-size: 0.9rem;
    line-height: 1.5;
    color: hsl(var(--muted-foreground));
}

.driver-popover-progress-text {
    color: hsl(var(--muted-foreground));
    font-size: 0.75rem;
}

.driver-popover-navigation-btns {
    gap: 8px;
}

.driver-popover-prev-btn,
.driver-popover-next-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
}

.driver-popover-prev-btn {
    background: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
}

.driver-popover-prev-btn:hover {
    background: hsl(var(--accent));
}

.driver-popover-next-btn {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
}

.driver-popover-next-btn:hover {
    opacity: 0.9;
}

.driver-popover-close-btn {
    color: hsl(var(--muted-foreground));
}

.driver-popover-close-btn:hover {
    color: hsl(var(--foreground));
}

.driver-popover-arrow {
    border-color: hsl(var(--card));
}
`;
