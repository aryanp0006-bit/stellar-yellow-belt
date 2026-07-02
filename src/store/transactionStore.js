
import { create } from 'zustand';

export const useTransactionStore = create((set) => ({
  transactions: [],
  currentTransaction: null,

  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions.filter(t => t.id !== tx.id)]
  })),
  setCurrentTransaction: (tx) => set({ currentTransaction: tx }),
  clearCurrentTransaction: () => set({ currentTransaction: null }),
}));