import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';
import { generateId } from '@core/utils/id';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  createdAt: number;
  splitWith?: string; // e.g. "Rahul, Sneha"
}

interface FinanceState {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getSplitOwed: () => number; // Simple assumption: If splitWith is filled, they owe you 50%
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (data) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...data, id: generateId(), createdAt: Date.now() },
          ],
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      getTotalIncome: () =>
        get().transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      getTotalExpense: () =>
        get().transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      getSplitOwed: () =>
        get().transactions
          .filter((t) => t.type === 'expense' && t.splitWith && t.splitWith.trim() !== '')
          .reduce((sum, t) => sum + t.amount / 2, 0),
    }),
    {
      name: 'finance-store',
      storage: zustandStorage,
    }
  )
);
