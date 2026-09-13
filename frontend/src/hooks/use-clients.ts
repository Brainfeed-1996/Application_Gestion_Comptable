'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useDebounce } from './use-debounce';
import { useApiMutation, useApiQuery } from './use-api';
import { clientsService } from '@/services/clients.service';
import type { Client, PaginatedResponse } from '@/types/client';

export interface ClientParams {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  country?: string;
}

export function useClients(params: ClientParams) {
  const debouncedSearch = useDebounce(params.search || '', 300);

  const queryParams = useMemo(
    () => ({
      ...params,
      search: debouncedSearch,
    }),
    [params, debouncedSearch],
  );

  return useApiQuery<PaginatedResponse<Client>>(
    `clients-${JSON.stringify(queryParams)}`,
    () => clientsService.list(queryParams),
  );
}

export function useClient(id: string) {
  return useApiQuery<Client>(
    `client-${id}`,
    () => clientsService.get(id),
    { enabled: !!id },
  );
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useApiMutation<Client, Partial<Client>>(
    clientsService.create,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success('Client créé');
      },
    },
  );
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<Client, Partial<Client>>(
    (data) => clientsService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success('Client mis à jour');
      },
    },
  );
}

export function useDeleteClient(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    () => clientsService.remove(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success('Client supprimé');
      },
    },
  );
}
