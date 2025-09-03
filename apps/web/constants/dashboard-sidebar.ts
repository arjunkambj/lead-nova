export const DASHBOARD_SIDEBAR_ITEMS = [
  {
    label: "AI",
    items: [
      {
        key: "agent",
        href: "/agent",
        icon: "solar:robot-linear",
        activeIcon: "solar:robot-bold",
        label: "Agent",
      },
    ],
  },
];

export const DASHBOARD_FOOTER_ITEMS = [
  {
    key: "orgs",
    href: "/orgs",
    icon: "solar:team-linear",
    activeIcon: "solar:team-bold",
    label: "Teams & Orgs",
  },
  {
    key: "integrations",
    href: "/integrations",
    icon: "hugeicons:connect",
    activeIcon: "hugeicons:connect",
    label: "Integrations",
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
