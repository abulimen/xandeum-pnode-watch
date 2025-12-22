/**
 * useComparison Hook - Node comparison selection management
 */

'use client';

import { useState, useCallback, useMemo } from 'react';

const MAX_COMPARISON_NODES = 4;
const MIN_COMPARISON_NODES = 2;

interface UseComparisonResult {
    selectedNodes: string[];
    addNode: (nodeId: string) => void;
    removeNode: (nodeId: string) => void;
    clearSelection: () => void;
    isSelected: (nodeId: string) => boolean;
    canAddMore: boolean;
    canCompare: boolean;
    selectionCount: number;
}

export function useComparison(): UseComparisonResult {
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

    const addNode = useCallback((nodeId: string) => {
        setSelectedNodes(prev => {
            if (prev.includes(nodeId)) return prev;
            if (prev.length >= MAX_COMPARISON_NODES) return prev;
            return [...prev, nodeId];
        });
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedNodes([]);
    }, []);

    const isSelected = useCallback((nodeId: string) => {
        return selectedNodes.includes(nodeId);
    }, [selectedNodes]);

    const canAddMore = selectedNodes.length < MAX_COMPARISON_NODES;
    const canCompare = selectedNodes.length >= MIN_COMPARISON_NODES;
    const selectionCount = selectedNodes.length;

    return {
        selectedNodes,
        addNode,
        removeNode,
        clearSelection,
        isSelected,
        canAddMore,
        canCompare,
        selectionCount,
    };
}
