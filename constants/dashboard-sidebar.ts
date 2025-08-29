// Direct navigation items (not in categories)
export const DASHBOARD_DIRECT_ITEMS = [
  {
    key: "overview",
    href: "/overview",
    icon: "solar:chart-2-linear",
    activeIcon: "solar:chart-2-bold",
    label: "Overview",
  },
  {
    key: "leads",
    href: "/leads",
    icon: "solar:users-group-rounded-linear",
    activeIcon: "solar:users-group-rounded-bold",
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
        icon: "solar:checklist-minimalistic-linear",
        activeIcon: "solar:checklist-minimalistic-bold",
        label: "Tasks",
      },
      {
        key: "meetings",
        href: "/meetings",
        icon: "solar:calendar-linear",
        activeIcon: "solar:calendar-bold",
        label: "Meetings",
      },
      {
        key: "invoices",
        href: "/invoices",
        icon: "solar:document-text-linear",
        activeIcon: "solar:document-text-bold",
        label: "Invoices",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "integrations",
    href: "/integrations",
    icon: "solar:widget-3-linear",
    activeIcon: "solar:widget-3-bold",
    label: "Integrations",
  },
  {
    key: "team",
    href: "/team",
    icon: "solar:users-group-two-rounded-linear",
    activeIcon: "solar:users-group-two-rounded-bold",
    label: "Team",
  },
  {
    key: "settings",
    href: "/settings",
    icon: "solar:settings-linear",
    activeIcon: "solar:settings-bold",
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
