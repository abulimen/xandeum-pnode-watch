/**
 * Motion Components Library
 * Reusable Framer Motion components for premium micro-interactions
 */

'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// ANIMATION VARIANTS
// ============================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

// ============================================
// MOTION COMPONENTS
// ============================================

/**
 * FadeIn - Simple fade in animation
 */
export function FadeIn({
    children,
    className,
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * FadeInUp - Fade in with upward motion
 */
export function FadeInUp({
    children,
    className,
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * ScaleIn - Scale in with spring effect
 */
export function ScaleIn({
    children,
    className,
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay, ease: [0.34, 1.56, 0.64, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * StaggerContainer - Container for staggered children animations
 */
export function StaggerContainer({
    children,
    className,
    delay = 0,
    staggerDelay = 0.08
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    staggerDelay?: number;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * StaggerItem - Child item for staggered animations
 */
export function StaggerItem({
    children,
    className
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={staggerItem}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * HoverScale - Scales up slightly on hover
 */
export function HoverScale({
    children,
    className,
    scale = 1.02
}: {
    children: ReactNode;
    className?: string;
    scale?: number;
}) {
    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * HoverGlow - Adds a glow effect on hover
 */
export function HoverGlow({
    children,
    className,
    glowColor = 'rgba(59, 130, 246, 0.3)'
}: {
    children: ReactNode;
    className?: string;
    glowColor?: string;
}) {
    return (
        <motion.div
            whileHover={{
                boxShadow: `0 0 20px ${glowColor}`,
            }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * PulseOnce - Pulses once on mount
 */
export function PulseOnce({
    children,
    className
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * CountUp - Animated number counter
 */
export function CountUp({
    value,
    duration = 1,
    className
}: {
    value: number;
    duration?: number;
    className?: string;
}) {
    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={value}
        >
            <motion.span
                initial={{ filter: 'blur(4px)' }}
                animate={{ filter: 'blur(0px)' }}
                transition={{ duration: 0.3 }}
            >
                {value.toLocaleString()}
            </motion.span>
        </motion.span>
    );
}

/**
 * Shimmer - Loading shimmer effect
 */
export function Shimmer({ className }: { className?: string }) {
    return (
        <motion.div
            className={cn("bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded", className)}
            animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
            style={{ backgroundSize: '200% 100%' }}
        />
    );
}

/**
 * SlideIn - Slides in from specified direction
 */
export function SlideIn({
    children,
    className,
    direction = 'left',
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
}) {
    const variants = {
        left: { x: -30, y: 0 },
        right: { x: 30, y: 0 },
        up: { x: 0, y: -30 },
        down: { x: 0, y: 30 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...variants[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...variants[direction] }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * PresenceWrapper - AnimatePresence wrapper for conditional rendering
 */
export function PresenceWrapper({
    children,
    show,
    mode = 'wait'
}: {
    children: ReactNode;
    show: boolean;
    mode?: 'wait' | 'sync' | 'popLayout';
}) {
    return (
        <AnimatePresence mode={mode}>
            {show && children}
        </AnimatePresence>
    );
}

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence };
