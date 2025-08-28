import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { today, getLocalTimeZone } from "@internationalized/date";

// Analytics date range interface
export interface AnalyticsDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  preset?: string;
}

// Helper to get default date range (today to last 30 days)
function getDefaultDateRange(): AnalyticsDateRange {
  const todayDate = today(getLocalTimeZone());
  const thirtyDaysAgo = todayDate.subtract({ days: 30 });

  return {
    start: `${thirtyDaysAgo.year}-${String(thirtyDaysAgo.month).padStart(2, "0")}-${String(thirtyDaysAgo.day).padStart(2, "0")}`,
    end: `${todayDate.year}-${String(todayDate.month).padStart(2, "0")}-${String(todayDate.day).padStart(2, "0")}`,
    preset: "last_30_days",
  };
}

// Global analytics date range atom
export const analyticsDateRangeAtom = atom<AnalyticsDateRange>(
  getDefaultDateRange()
);

// UI State atoms
export const sidebarOpenAtom = atomWithStorage("sidebar-open", true);

// Dashboard filter atoms
export const dashboardFiltersAtom = atom({
  platform: "all" as "all" | "shopify" | "meta" | "google",
  channel: "all" as string,
  productId: undefined as string | undefined,
});

// Table pagination atoms
export const tablePaginationAtom = atom({
  pageSize: 10,
  currentPage: 1,
});

// Modal state atoms
export const modalStatesAtom = atom({
  isAddExpenseOpen: false,
  isImportCSVOpen: false,
  isProductCostOpen: false,
  isRequestIntegrationOpen: false,
});

// Sync status atoms
export const syncStatusAtom = atom({
  isAnySyncing: false,
  syncingPlatforms: [] as string[],
});

// Selected items atoms (for bulk operations)
export const selectedItemsAtom = atom<Set<string>>(new Set<string>());

// Chart preferences atom
export const chartPreferencesAtom = atomWithStorage("chart-prefs", {
  showGrid: true,
  showLegend: true,
  chartType: "line" as "line" | "bar" | "area",
  timeGranularity: "daily" as "daily" | "weekly" | "monthly",
});

// Table view preferences atom
export const tableViewPreferencesAtom = atomWithStorage("table-view-prefs", {
  density: "normal" as "compact" | "normal" | "spacious",
  showFilters: true,
  columnsVisible: {} as Record<string, boolean>,
});

// Notification preferences atom
export const notificationPreferencesAtom = atomWithStorage(
  "notification-prefs",
  {
    showSyncNotifications: true,
    showErrorNotifications: true,
    showSuccessNotifications: true,
  }
);

// Performance monitoring atom (for dev)
export const performanceMetricsAtom = atom({
  renderCount: 0,
  lastRenderTime: 0,
  slowComponents: [] as string[],
});
