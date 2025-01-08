import { create } from 'zustand';

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

interface WalletState {
    balances: Record<string, WalletBalance>;
    isLoading: boolean;
    error: string | null;
    fetchBalances: (addresses: string[]) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
    balances: {},
    isLoading: false,
    error: null,

    fetchBalances: async (addresses) => {
        try {
            set({ isLoading: true, error: null });

            const balancePromises = addresses.map(async (address) => {
                const response = await fetch(
                    `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
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