"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  payInvoice,
  cancelInvoice,
} from "@/services/invoices.service";
import type { Invoice, InvoiceCreate } from "@/types/invoice";

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices({ page: 1, limit: 10 }),
  });

  const create = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & InvoiceCreate) => updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const send = useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const pay = useMutation({
    mutationFn: payInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const cancel = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    invoices: (data?.items ?? []) as Invoice[],
    isLoading,
    create,
    update,
    remove,
    send,
    pay,
    cancel,
  };
}

export function useInvoice(id: string | undefined) {
  return useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });
}
