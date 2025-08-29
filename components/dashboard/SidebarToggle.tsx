"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { sidebarOpenAtom } from "@/store/atoms";

export default function SidebarToggle() {
  const isOpen = useAtomValue(sidebarOpenAtom);
  const setIsOpen = useSetAtom(sidebarOpenAtom);

  const handleToggle = useCallback(() => {
    setIsOpen((prev: boolean) => !prev);
  }, [setIsOpen]);

  return (
    <Button
      isIconOnly
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      variant="flat"
      size="sm"
      onPress={handleToggle}
    >
      <Icon
        icon={
          isOpen ? "solar:hamburger-menu-linear" : "solar:hamburger-menu-linear"
        }
        width={20}
      />
    </Button>
  );
}
