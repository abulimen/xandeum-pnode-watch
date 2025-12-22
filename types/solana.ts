/**
 * Solana RPC Types
 * TypeScript interfaces for Solana on-chain data
 */

// Aggregated Solana node data for UI
export interface SolanaNodeData {
    // Account basics
    balance: number; // SOL balance
    lamports: number; // Raw lamports

    // Validator info (if applicable)
    isValidator: boolean;
    validatorInfo?: {
        votePubkey: string;
        activatedStake: number; // Lamports
        commission: number; // Percentage 0-100
        epochCredits: number;
        lastVote: number;
        rootSlot: number;
    };

    // Query status
    isLoading: boolean;
    error?: string;
}

// Vote account from getVoteAccounts RPC
export interface SolanaVoteAccount {
    votePubkey: string;
    nodePubkey: string;
    activatedStake: number;
    epochVoteAccount: boolean;
    commission: number;
    lastVote: number;
    epochCredits: [number, number, number][];
    rootSlot: number;
}

// Response from getVoteAccounts
export interface VoteAccountsResponse {
    current: SolanaVoteAccount[];
    delinquent: SolanaVoteAccount[];
}

// Helper constants
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Public RPC endpoints (no API key required)
export const SOLANA_RPC_ENDPOINTS = {
    mainnet: 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
};

// Default to mainnet for production use
export const DEFAULT_RPC_ENDPOINT = SOLANA_RPC_ENDPOINTS.mainnet;
