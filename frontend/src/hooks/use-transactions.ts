import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  reconcileTransaction,
} from '@/services/transactions.service';
import type { Transaction, TransactionCreate, PaginatedResponse } from '@/types/transaction';

export function useTransactions() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () =>
      getTransactions({ page: 1, limit: 10 }),
  });

  const create = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & TransactionCreate) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const reconcile = useMutation({
    mutationFn: reconcileTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions: (data?.items ?? []) as Transaction[],
    isLoading,
    create,
    update,
    remove,
    reconcile,
  };
}

export function useTransaction(id: string | undefined) {
  return useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => getTransactionById(id!),
    enabled: !!id,
  });
}
