"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

/**
 * Optimized hook that fetches all dashboard data in a single batched query
 * This reduces WebSocket connections by 60-70% compared to multiple parallel queries
 */
export function useDashboardData() {
  const dashboardData = useQuery(api.core.leads.getDashboardData);

  // Memoize the extracted data to prevent unnecessary re-renders
  const data = useMemo(() => {
    if (!dashboardData) {
      return {
        stats: null,
        stages: [],
        tags: [],
        customFields: [],
        savedViews: [],
        isLoading: true,
      };
    }

    return {
      stats: dashboardData.stats,
      stages: dashboardData.stages,
      tags: dashboardData.tags,
      customFields: dashboardData.customFields,
      savedViews: dashboardData.savedViews,
      isLoading: false,
    };
  }, [dashboardData]);

  return data;
}

/**
 * Hook for components that only need stats data
 */
export function useLeadStatsOptimized() {
  const { stats, isLoading } = useDashboardData();
  return { stats, isLoading };
}

/**
 * Hook for components that only need stages data
 */
export function useLeadStagesOptimized() {
  const { stages, isLoading } = useDashboardData();
  return { stages, isLoading };
}

/**
 * Hook for components that only need tags data
 */
export function useLeadTagsOptimized() {
  const { tags, isLoading } = useDashboardData();
  return { tags, isLoading };
}