export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    label: "Leads",
    items: [
      {
        key: "my-leads",
        href: "/my-leads",
        icon: "solar:user-linear",
        activeIcon: "solar:user-bold",
        label: "My Leads",
      },
      {
        key: "all-leads",
        href: "/all-leads",
        icon: "solar:users-group-rounded-linear",
        activeIcon: "solar:users-group-rounded-bold",
        label: "All Leads",
      },
      {
        key: "new-leads",
        href: "/new-leads",
        icon: "solar:add-circle-linear",
        activeIcon: "solar:add-circle-bold",
        label: "New Leads",
      },
    ],
  },
  {
    label: "Automations",
    items: [
      {
        key: "automations",
        href: "/automations",
        icon: "solar:smartphone-2-linear",
        activeIcon: "solar:smartphone-2-bold",
        label: "Automations",
      },
      {
        key: "sources",
        href: "/sources",
        icon: "solar:database-linear",
        activeIcon: "solar:database-bold",
        label: "Sources",
      },
      {
        key: "page-forms",
        href: "/page-forms",
        icon: "solar:document-text-linear",
        activeIcon: "solar:document-text-bold",
        label: "Pages & Forms",
      },
      {
        key: "integrations",
        href: "/integrations",
        icon: "solar:plug-circle-linear",
        activeIcon: "solar:plug-circle-bold",
        label: "Integrations",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "team-management",
    href: "/team-management",
    icon: "solar:users-group-two-rounded-linear",
    activeIcon: "solar:users-group-two-rounded-bold",
    label: "Team Management",
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
