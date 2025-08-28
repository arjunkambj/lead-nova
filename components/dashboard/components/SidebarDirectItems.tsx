"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/theme";

type DirectItem = {
  key: string;
  href: string;
  icon: string;
  activeIcon: string;
  label: string;
};

type SidebarDirectItemsProps = {
  items: DirectItem[];
};

const SidebarDirectItems: React.FC<SidebarDirectItemsProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const iconToUse = isActive ? item.activeIcon : item.icon;

        return (
          <Link
            key={item.key}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 min-h-9",
              "no-underline w-full",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-default-600 hover:text-default-900 hover:bg-default-100"
            )}
            href={item.href as Route}
            prefetch={true}
          >
            <Icon
              aria-hidden
              className="shrink-0 transition-colors w-5 h-5"
              icon={iconToUse}
            />
            <span className="text-sm font-medium truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default SidebarDirectItems;