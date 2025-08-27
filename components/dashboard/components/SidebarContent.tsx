"use client";

import React, { useMemo, useCallback } from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { useAtom } from "jotai";

import { sidebarOpenAtom } from "@/store/atoms";
import {
  DASHBOARD_DIRECT_ITEMS,
  sectionItems,
} from "@/constants/dashboard-sidebar";

import SidebarMenu from "./SidebarMenu";
import SidebarDirectItems from "./SidebarDirectItems";
import { FooterItems } from "./FooterItems";
import Logo from "../../shared/Logo";

interface SidebarContentProps {
  onClose: () => void;
}

const SidebarContent = React.memo(({ onClose }: SidebarContentProps) => {
  const [isOpen] = useAtom(sidebarOpenAtom);

  const containerClasses = useMemo(
    () =>
      `relative flex h-full max-w-[280px] flex-1 flex-col bg-content1 rounded-2xl border border-divider transition-all duration-300 ease-in-out ${
        isOpen
          ? "w-[280px] p-6 opacity-100 overflow-visible ml-4"
          : "w-0 p-0 opacity-0 overflow-hidden"
      }`,
    [isOpen]
  );

  const scrollShadowClasses = useMemo(
    () =>
      `h-full max-h-full transition-all duration-300 ${
        isOpen ? "-mr-6 pr-6 opacity-100" : "opacity-0"
      }`,
    [isOpen]
  );

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const logoSection = useMemo(
    () => (
      <div className="flex items-center justify-between px-2 py-2">
        <Logo />
        {/* Close button - only visible on mobile */}
        <Button
          isIconOnly
          aria-label="Close sidebar"
          className="sm:hidden absolute right-2 top-2"
          size="sm"
          variant="light"
          onPress={handleCloseClick}
        >
          <Icon icon="solar:close-circle-bold" width={20} />
        </Button>
      </div>
    ),
    [handleCloseClick]
  );

  const directItemsContent = useMemo(
    () => <SidebarDirectItems items={DASHBOARD_DIRECT_ITEMS} />,
    []
  );

  const sidebarMenuContent = useMemo(
    () => (
      <SidebarMenu
        items={sectionItems.map((section) => ({
          key: section.label.toLowerCase().replace(/\s+/g, "-"),
          title: section.label,
          items: section.items.map((item) => ({
            key: item.key,
            title: item.label,
            icon: item.icon,
            href: item.href,
          })),
        }))}
      />
    ),
    []
  );

  const footerItemsContent = useMemo(() => <FooterItems />, []);

  return (
    <div className={containerClasses}>
      {/* Logo and Close Button */}
      <div className="mb-4">{logoSection}</div>

      {/* Direct Navigation Items */}
      <div className="mb-4">{directItemsContent}</div>

      {/* Category Navigation */}
      <div className="flex-1 min-h-0">
        <ScrollShadow className={scrollShadowClasses}>
          {sidebarMenuContent}
        </ScrollShadow>
      </div>

      {/* Footer Items */}
      <div className="mt-auto pt-6 border-t border-divider">
        {footerItemsContent}
      </div>
    </div>
  );
});

SidebarContent.displayName = "SidebarContent";

export default SidebarContent;
