"use client";

import type { ReactNode } from "react";
import { ReactQueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </ReactQueryProvider>
  );
}
