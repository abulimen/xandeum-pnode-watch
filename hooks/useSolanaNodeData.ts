/**
 * useSolanaNodeData Hook
 * Fetches on-chain Solana data for a pNode pubkey
 * Uses server-side proxy to avoid CORS issues
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { SolanaNodeData } from '@/types/solana';
import { LAMPORTS_PER_SOL } from '@/types/solana';

// Validate if a string is a valid Solana public key
function isValidPublicKey(pubkey: string | null | undefined): pubkey is string {
    if (!pubkey || pubkey.length < 32 || pubkey.length > 44) return false;
    // Basic base58 validation
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    for (const char of pubkey) {
        if (!base58Chars.includes(char)) return false;
    }
    return true;
}

// Make RPC call through our server-side proxy
async function rpcCall(method: string, params: any[]) {
    const response = await fetch('/api/solana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        }),
    });

    if (!response.ok) {
        throw new Error(`RPC call failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message || 'RPC error');
    }
    return data.result;
}

// Fetch account balance
async function fetchBalance(pubkey: string): Promise<number> {
    const result = await rpcCall('getBalance', [pubkey]);
    return result.value ?? 0;
}

// Fetch vote accounts and check if pubkey is a validator
async function fetchValidatorInfo(pubkey: string): Promise<{
    isValidator: boolean;
    validatorInfo?: SolanaNodeData['validatorInfo'];
}> {
    try {
        const result = await rpcCall('getVoteAccounts', []);

        // Check both current and delinquent validators
        const allValidators = [...(result.current || []), ...(result.delinquent || [])];

        // Find validator by nodePubkey (the node identity)
        const validator = allValidators.find((v: any) => v.nodePubkey === pubkey);

        if (validator) {
            // Calculate total epoch credits from recent epochs
            const recentCredits = validator.epochCredits?.slice(-1)[0];
            const epochCredits = recentCredits ? recentCredits[1] : 0;

            return {
                isValidator: true,
                validatorInfo: {
                    votePubkey: validator.votePubkey,
                    activatedStake: validator.activatedStake,
                    commission: validator.commission,
                    epochCredits,
                    lastVote: validator.lastVote,
                    rootSlot: validator.rootSlot ?? 0,
                },
            };
        }

        return { isValidator: false };
    } catch (error) {
        console.warn('Failed to fetch validator info:', error);
        return { isValidator: false };
    }
}

// Main fetch function
async function fetchSolanaNodeData(pubkeyStr: string): Promise<SolanaNodeData> {
    // Fetch balance and validator info in parallel
    const [lamports, validatorInfo] = await Promise.all([
        fetchBalance(pubkeyStr),
        fetchValidatorInfo(pubkeyStr),
    ]);

    return {
        lamports,
        balance: lamports / LAMPORTS_PER_SOL,
        isValidator: validatorInfo.isValidator,
        validatorInfo: validatorInfo.validatorInfo,
        isLoading: false,
    };
}

export interface UseSolanaNodeDataResult {
    data: SolanaNodeData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useSolanaNodeData(pubkey: string | null | undefined): UseSolanaNodeDataResult {
    const isValid = isValidPublicKey(pubkey);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['solana-node-data', pubkey],
        queryFn: () => fetchSolanaNodeData(pubkey!),
        enabled: isValid,
        staleTime: 60 * 1000, // Cache for 1 minute
        retry: 2,
        retryDelay: 1000,
    });

    // Return empty state if pubkey is invalid
    if (!isValid) {
        return {
            data: null,
            isLoading: false,
            error: null,
            refetch: () => { },
        };
    }

    return {
        data: data ?? null,
        isLoading,
        error: error as Error | null,
        refetch,
    };
}
