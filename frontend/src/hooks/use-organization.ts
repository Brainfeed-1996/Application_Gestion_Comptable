"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Organization } from "@/types/organization";

export function useOrganization() {
  return useQuery<Organization | null>({
    queryKey: ["organization"],
    queryFn: () =>
      apiClient
        .get<Organization>("/organization")
        .then((r) => r.data)
        .catch(() => null),
    retry: false,
  });
}
