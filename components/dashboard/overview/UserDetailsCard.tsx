"use client";

import { memo } from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Chip, 
  Avatar
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface UserDetailsCardProps {
  user: {
    _id: string;
    name?: string;
    email: string;
    image?: string;
    role?: string;
    status?: string;
    createdAt?: number;
  };
  organization: {
    _id: string;
    name: string;
    totalMembers?: number;
  };
  roleInfo: {
    label: string;
    color: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
  };
}

const UserDetailsCard = memo(({ user, organization, roleInfo }: UserDetailsCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar
            name={user.name || user.email}
            src={user.image}
            size="lg"
            className="text-large"
          />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{user.name || "Not set"}</h3>
            <p className="text-sm text-default-500">{user.email || "No email"}</p>
            <Chip
              size="sm"
              color={roleInfo.color}
              variant="flat"
            >
              {roleInfo.label}
            </Chip>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<Icon icon="solar:settings-linear" width={16} />}
          >
            Settings
          </Button>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-default-500 mb-1">Organization</p>
            <p className="text-sm font-medium">{organization.name}</p>
          </div>
          <div>
            <p className="text-xs text-default-500 mb-1">Status</p>
            <Chip size="sm" color="success" variant="flat">
              {user.status || "Active"}
            </Chip>
          </div>
          <div>
            <p className="text-xs text-default-500 mb-1">Team Members</p>
            <p className="text-sm font-medium">{organization.totalMembers || 0}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

UserDetailsCard.displayName = "UserDetailsCard";

export default UserDetailsCard;