import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, getClientById } from '@/services/clients.service';
import type { ClientFull } from '@/services/clients.service';

export function useClients() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients({ page: 1, limit: 10 }),
  });

  const create = useMutation({
    mutationFn: (data: Omit<ClientFull, 'id' | 'balance' | 'status' | 'createdAt'>) =>
      data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: (data?.items ?? []) as ClientFull[],
    isLoading,
    create,
  };
}

export function useClient(id: string | undefined) {
  return useQuery<ClientFull>({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });
}
