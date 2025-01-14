import { create } from 'zustand';
import { supabase } from '@/utils/supabase/client';
import { Wallet, Agent } from '@/types/supabase';

interface TokenBalance {
    balance: string;
    total_sent: string;
    total_received: string;
}

interface NFTBalance {
    count: number;
    total_sent: number;
    total_received: number;
}

interface WalletBalance {
    stx: TokenBalance;
    fungible_tokens: {
        [key: string]: TokenBalance;
    };
    non_fungible_tokens: {
        [key: string]: NFTBalance;
    };
}

interface WalletWithAgent extends Wallet {
    agent?: Agent;
}

interface WalletState {
    balances: Record<string, WalletBalance>;
    userWallet: WalletWithAgent | null;
    agentWallets: WalletWithAgent[];
    isLoading: boolean;
    error: string | null;
    fetchBalances: (addresses: string[]) => Promise<void>;
    fetchWallets: (userId: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
    balances: {},
    userWallet: null,
    agentWallets: [],
    isLoading: false,
    error: null,

    fetchWallets: async (userId: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data: walletsData, error: walletsError } = await supabase
                .from("wallets")
                .select("*, agent:agents(*)")
                .eq("profile_id", userId);

            if (walletsError) {
                throw walletsError;
            }

            // Separate user wallet (agent_id is null) from agent wallets
            const userWallet = walletsData?.find((wallet) => wallet.agent_id === null) || null;
            const agentWallets = walletsData?.filter((wallet) => wallet.agent_id !== null) || [];

            // Fetch balances for all addresses
            // if NEXT_PUBLIC_STACKS_NETWORK is mainnet, use mainnet_address, otherwise use testnet_address
            const allAddresses = walletsData
                ?.map((wallet) => process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? wallet.mainnet_address : wallet.testnet_address)
                .filter((address): address is string => address !== null);

            if (allAddresses && allAddresses.length > 0) {
                await set((state) => {
                    state.fetchBalances(allAddresses);
                    return state;
                });
            }

            set({
                userWallet,
                agentWallets,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch wallets',
                isLoading: false
            });
        }
    },

    fetchBalances: async (addresses) => {
        try {
            set({ isLoading: true, error: null });

            const balancePromises = addresses.map(async (address) => {
                const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
                const response = await fetch(
                    `https://api.${network}.hiro.so/extended/v1/address/${address}/balances`
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch balance for ${address}`);
                }
                const data = await response.json();
                return [address, data] as [string, WalletBalance];
            });

            const results = await Promise.all(balancePromises);
            const newBalances = Object.fromEntries(results);

            set((state) => ({
                balances: {
                    ...state.balances,
                    ...newBalances
                },
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch balances',
                isLoading: false
            });
        }
    }
})); 