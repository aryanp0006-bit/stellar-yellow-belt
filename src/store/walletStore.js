import { create } from 'zustand';

export const useWalletStore = create((set) => ({
  wallet: null,
  walletName: null,
  balance: 0,
  loading: false,
  error: null,

  setWallet: (wallet, walletName) => set({ wallet, walletName }),
  setBalance: (balance) => set({ balance }),
  clearWallet: () => set({ wallet: null, walletName: null, balance: 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));