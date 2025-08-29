"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useBasicStats() {
  return useQuery(api.core.dashboard.getBasicStats);
}

export function useLatestLeads(limit?: number) {
  return useQuery(api.core.dashboard.getLatestLeads, { limit });
}

export function useSyncStatus() {
  return useQuery(api.core.dashboard.getSyncStatus);
}

export function useDashboardData(leadLimit?: number) {
  return useQuery(api.core.dashboard.getDashboardData, { leadLimit });
}
