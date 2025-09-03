"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";

const navigationItems = [
  {
    key: "settings",
    href: "/settings/general",
    icon: "solar:settings-linear",
    label: "Settings",
  },
  {
    key: "billing",
    href: "/settings/billing-invoices",
    icon: "solar:card-linear",
    label: "Billing",
  },
  {
    key: "help",
    href: "/settings/help",
    icon: "solar:question-circle-linear",
    label: "Help & Support",
  },
];

const UserProfile = React.memo(() => {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    router.push("/auth");
  }, [router]);

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://example.com/image.png",
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform"
          name={user.name}
          size="md"
          radius="sm"
          src={user.image || undefined}
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection>
          <DropdownItem
            key="profile"
            className="h-14 gap-2"
            textValue="Profile"
          >
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-default-500">{user.email}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          {navigationItems.map((item) => (
            <DropdownItem
              key={item.key}
              as={Link}
              className="data-[hover=true]:bg-default-100"
              href={item.href}
              startContent={<Icon icon={item.icon} width={18} />}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection>
          <DropdownItem
            key="logout"
            color="danger"
            className="text-danger"
            startContent={<Icon icon="solar:logout-2-linear" width={18} />}
            onPress={handleLogout}
          >
            Log Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
});

UserProfile.displayName = "UserProfile";

export default UserProfile;
