"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  BulkUpdateData,
  LeadFieldValue,
  LeadFilters,
  SortConfig,
} from "@/types/leads";

// Debounce hook for values
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Table view hook with pagination
export function useLeadsTable(filters?: LeadFilters, sorting?: SortConfig) {
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const debouncedFilters = useDebounceValue(JSON.stringify(filters || {}), 500);
  const debouncedSorting = useDebounceValue(JSON.stringify(sorting || {}), 500);

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.core.leads.getLeadsTable,
    {
      filters: debouncedFilters,
      sorting: debouncedSorting,
    },
    { initialNumItems: pageSize },
  );

  return {
    leads: results || [],
    isLoading,
    loadMore,
    status,
    page,
    setPage,
  };
}

// Kanban view hook
export function useLeadsKanban(filters?: LeadFilters) {
  const debouncedFilters = useDebounceValue(JSON.stringify(filters || {}), 500);

  const stages = useQuery(api.core.leads.getLeadsKanban, {
    filters: debouncedFilters,
  });

  return {
    stages: stages || [],
    isLoading: stages === undefined,
  };
}

// Single lead field update with optimistic updates
export function useUpdateLeadField() {
  const updateField = useMutation(api.core.leads.updateLeadField);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, LeadFieldValue>
  >(new Map());

  const updateOptimistic = useCallback(
    async (leadId: Id<"leads">, field: string, value: LeadFieldValue) => {
      // Optimistically update the UI immediately
      const updateKey = `${leadId}-${field}`;
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(updateKey, value);
        return next;
      });

      try {
        if (value === undefined) {
          value = null;
        }
        await updateField({
          leadId,
          field,
          value: value as
            | string
            | number
            | boolean
            | Id<"users">
            | Id<"leadTags">[]
            | null,
        });

        // Clear optimistic update on success
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateKey);
          return next;
        });

        return { success: true };
      } catch (error) {
        console.error("Failed to update lead field:", error);

        // Rollback optimistic update on error
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(updateKey);
          return next;
        });

        return { success: false, error };
      }
    },
    [updateField],
  );

  return { updateOptimistic, optimisticUpdates };
}

// Bulk operations hook
export function useBulkUpdateLeads() {
  const bulkUpdate = useMutation(api.core.leads.bulkUpdateLeads);

  const performBulkUpdate = useCallback(
    async (leadIds: Id<"leads">[], updates: BulkUpdateData) => {
      try {
        // Filter out null values for the mutation
        const cleanedUpdates = {
          ...(updates.stage !== undefined && { stage: updates.stage }),
          ...(updates.priority !== undefined && { priority: updates.priority }),
          ...(updates.assignedTo !== undefined &&
            updates.assignedTo !== null && { assignedTo: updates.assignedTo }),
          ...(updates.tags !== undefined && { tags: updates.tags }),
        };
        const result = await bulkUpdate({ leadIds, updates: cleanedUpdates });
        return { success: true, ...result };
      } catch (error) {
        console.error("Bulk update failed:", error);
        return { success: false, error };
      }
    },
    [bulkUpdate],
  );

  return performBulkUpdate;
}

// Custom fields management
export function useCustomFields() {
  const fields = useQuery(api.core.leads.getCustomFields);
  const createField = useMutation(api.core.leads.createCustomField);

  return {
    fields: fields || [],
    isLoading: fields === undefined,
    createField,
  };
}

// Stages management
export function useLeadStages() {
  const stages = useQuery(api.core.leads.getStages);
  const ensureStages = useMutation(api.core.leads.ensureDefaultStages);

  // Ensure default stages exist
  const initializeStages = useCallback(async () => {
    if (stages && stages.length === 0) {
      await ensureStages();
    }
  }, [stages, ensureStages]);

  return {
    stages: stages || [],
    isLoading: stages === undefined,
    initializeStages,
  };
}

// Tags management
export function useLeadTags() {
  const tags = useQuery(api.core.leads.getTags);
  const upsertTag = useMutation(api.core.leads.upsertTag);

  return {
    tags: tags || [],
    isLoading: tags === undefined,
    upsertTag,
  };
}

// Lead activities
export function useLeadActivities(leadId: Id<"leads">) {
  const activities = useQuery(api.core.leads.getLeadActivities, {
    leadId,
    limit: 50,
  });

  return {
    activities: activities || [],
    isLoading: activities === undefined,
  };
}

// Saved views management
export function useSavedViews() {
  const views = useQuery(api.core.leads.getSavedViews);
  const saveView = useMutation(api.core.leads.saveView);

  return {
    views: views || [],
    isLoading: views === undefined,
    saveView,
  };
}

// Lead statistics
export function useLeadStats() {
  const stats = useQuery(api.core.leads.getLeadStats);

  return {
    stats,
    isLoading: stats === undefined,
  };
}

// Lead selection management (client-side state)
export function useLeadSelection() {
  const [selectedLeads, setSelectedLeads] = useState<Set<Id<"leads">>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelection = useCallback((leadId: Id<"leads">) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (allLeadIds: Id<"leads">[]) => {
      if (selectAll) {
        setSelectedLeads(new Set());
        setSelectAll(false);
      } else {
        setSelectedLeads(new Set(allLeadIds));
        setSelectAll(true);
      }
    },
    [selectAll],
  );

  const clearSelection = useCallback(() => {
    setSelectedLeads(new Set());
    setSelectAll(false);
  }, []);

  const isSelected = useCallback(
    (leadId: Id<"leads">) => {
      return selectedLeads.has(leadId);
    },
    [selectedLeads],
  );

  return {
    selectedLeads: Array.from(selectedLeads),
    selectedCount: selectedLeads.size,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectAll,
  };
}

// Filter state management with memoization
export function useLeadFilters() {
  const [filters, setFilters] = useState({
    stage: null as string | null,
    priority: null as string | null,
    assignedTo: null as Id<"users"> | null,
    tags: [] as Id<"leadTags">[],
    search: "",
    dateField: "createdTime" as string,
    dateRange: null as {
      start: Date;
      end: Date;
      preset?: string | null;
    } | null,
    score: null as { min: number; max: number } | null,
  });

  const updateFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      stage: null,
      priority: null,
      assignedTo: null,
      tags: [],
      search: "",
      dateField: "createdTime",
      dateRange: null,
      score: null,
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.stage) count++;
    if (filters.priority) count++;
    if (filters.assignedTo) count++;
    if (filters.tags.length > 0) count++;
    if (filters.search) count++;
    if (filters.dateRange) count++;
    if (filters.score) count++;
    return count;
  }, [filters]);

  // Memoize the serialized filters to prevent unnecessary re-renders
  const serializedFilters = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  return {
    filters,
    serializedFilters,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
}

// Sorting state management
export function useLeadSort() {
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = useCallback((field: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.field !== field) {
        return { field, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { field, direction: "desc" };
      }
      return null;
    });
  }, []);

  const getSortIcon = useCallback(
    (field: string) => {
      if (!sortConfig || sortConfig.field !== field) {
        return "solar:sort-linear";
      }
      return sortConfig.direction === "asc"
        ? "solar:sort-from-bottom-to-top-linear"
        : "solar:sort-from-top-to-bottom-linear";
    },
    [sortConfig],
  );

  return {
    sortConfig,
    handleSort,
    getSortIcon,
  };
}
