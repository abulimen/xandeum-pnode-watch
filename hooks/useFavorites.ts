/**
 * useFavorites Hook - Re-exports from FavoritesContext
 * Maintains backward compatibility while using shared context
 */

'use client';

import { useFavoritesContext } from '@/contexts/FavoritesContext';

export interface UseFavoritesResult {
    favorites: string[];
    addFavorite: (nodeId: string) => void;
    removeFavorite: (nodeId: string) => void;
    toggleFavorite: (nodeId: string) => void;
    isFavorite: (nodeId: string) => boolean;
    clearFavorites: () => void;
    favoritesCount: number;
}

export function useFavorites(): UseFavoritesResult {
    return useFavoritesContext();
}
