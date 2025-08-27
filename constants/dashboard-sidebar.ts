// Direct navigation items (not in categories)
export const DASHBOARD_DIRECT_ITEMS = [
  {
    key: "overview",
    href: "/overview",
    icon: "lucide:chart-bar",
    activeIcon: "lucide:chart-bar",
    label: "Overview",
  },
  {
    key: "leads",
    href: "/leads",
    icon: "lucide:users",
    activeIcon: "lucide:users",
    label: "Leads",
  },
];

// Category items with sub-navigation
export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    label: "Workflows",
    items: [
      {
        key: "tasks",
        href: "/tasks",
        icon: "lucide:check-square",
        activeIcon: "lucide:check-square",
        label: "Tasks",
      },
      {
        key: "meetings",
        href: "/meetings",
        icon: "lucide:calendar",
        activeIcon: "lucide:calendar",
        label: "Meetings",
      },
      {
        key: "invoices",
        href: "/invoices",
        icon: "lucide:file-text",
        activeIcon: "lucide:file-text",
        label: "Invoices",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "integrations",
    href: "/integrations",
    icon: "lucide:plug",
    activeIcon: "lucide:plug",
    label: "Integrations",
  },
  {
    key: "team",
    href: "/team",
    icon: "lucide:users-2",
    activeIcon: "lucide:users-2",
    label: "Team",
  },
  {
    key: "settings",
    href: "/settings",
    icon: "lucide:settings",
    activeIcon: "lucide:settings",
    label: "Settings",
  },
];

// Legacy exports for backward compatibility
export const sectionItems = DASHBOARD_SIDEBAR_ITEMS;
export const footerItems = DASHBOARD_FOOTER_ITEMS;
export const dashboardSidebar = {
  sectionItems: DASHBOARD_SIDEBAR_ITEMS,
  footerItems: DASHBOARD_FOOTER_ITEMS,
};
