/**
 * FavoritesContext - Global state for favorite nodes
 * Ensures favorites are shared across all components
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'xandeum-favorite-nodes';

interface FavoritesContextValue {
    favorites: string[];
    addFavorite: (nodeId: string) => void;
    removeFavorite: (nodeId: string) => void;
    toggleFavorite: (nodeId: string) => void;
    isFavorite: (nodeId: string) => boolean;
    clearFavorites: () => void;
    favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setFavorites(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error('Failed to save favorites:', error);
            }
        }
    }, [favorites, isLoaded]);

    const addFavorite = useCallback((nodeId: string) => {
        setFavorites(prev => {
            if (prev.includes(nodeId)) return prev;
            return [...prev, nodeId];
        });
    }, []);

    const removeFavorite = useCallback((nodeId: string) => {
        setFavorites(prev => prev.filter(id => id !== nodeId));
    }, []);

    const toggleFavorite = useCallback((nodeId: string) => {
        setFavorites(prev => {
            if (prev.includes(nodeId)) {
                return prev.filter(id => id !== nodeId);
            }
            return [...prev, nodeId];
        });
    }, []);

    const isFavorite = useCallback((nodeId: string) => {
        return favorites.includes(nodeId);
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                toggleFavorite,
                isFavorite,
                clearFavorites,
                favoritesCount: favorites.length,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavoritesContext(): FavoritesContextValue {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavoritesContext must be used within a FavoritesProvider');
    }
    return context;
}
