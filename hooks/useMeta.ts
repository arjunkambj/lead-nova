"use client";

import { useAction, useMutation, useQuery } from "convex/react";
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

export function useGetPageForms() {
  return useAction(api.integration.meta.getPageForms);
}

export function useTriggerSyncWithForms() {
  return useMutation(api.integration.meta.triggerSyncWithForms);
}
