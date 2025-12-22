/**
 * FavoriteButton Component - Toggle favorite status for nodes
 * Uses the useFavorites hook for localStorage persistence
 */

'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface FavoriteButtonProps {
    nodeId: string;
    size?: 'sm' | 'default';
    className?: string;
}

export function FavoriteButton({ nodeId, size = 'default', className }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(nodeId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(nodeId);
    };

    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            buttonSize,
                            'rounded-full transition-all',
                            favorited
                                ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10',
                            className
                        )}
                        onClick={handleClick}
                        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Heart
                            className={cn(
                                iconSize,
                                'transition-all',
                                favorited && 'fill-current'
                            )}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{favorited ? 'Remove from watchlist' : 'Add to watchlist'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
