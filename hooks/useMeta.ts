"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useMetaConnectionStatus() {
  return useQuery(api.integration.meta.getConnectionStatus);
}

export function useDisconnectMetaAccount() {
  return useMutation(api.integration.meta.disconnectMetaAccount);
}

export function useConnectMetaPage() {
  return useMutation(api.integration.meta.connectMetaAccount);
}