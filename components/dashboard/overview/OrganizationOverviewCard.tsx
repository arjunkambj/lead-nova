"use client";

import { memo } from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface OrganizationOverviewCardProps {
  user: {
    createdAt?: number;
  };
  organization: {
    name: string;
    activeMembers?: string[];
    invitedMembers?: number;
  };
  roleInfo: {
    label: string;
    color: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
  };
  isResettingEverything: boolean;
  onResetClick: () => void;
}

const OrganizationOverviewCard = memo(({ 
  user, 
  organization, 
  roleInfo, 
  isResettingEverything, 
  onResetClick 
}: OrganizationOverviewCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Organization Overview</h3>
        <Icon icon="solar:buildings-bold" width={24} className="text-primary" />
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Organization Name</span>
              <span className="text-sm font-medium">{organization.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Active Members</span>
              <span className="text-sm font-medium">
                {organization.activeMembers?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Invited Members</span>
              <span className="text-sm font-medium">
                {organization.invitedMembers || 0}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Your Role</span>
              <Chip size="sm" color={roleInfo.color} variant="flat">
                {roleInfo.label}
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Onboarding Status</span>
              <Chip size="sm" color="success" variant="flat">
                Completed
              </Chip>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Account Created</span>
              <span className="text-sm font-medium">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        <Divider className="my-4" />
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-danger">Danger Zone</p>
            <p className="text-xs text-default-500">
              Permanently delete all your data and start fresh. This cannot be undone.
            </p>
          </div>
          <Button
            color="danger"
            variant="flat"
            size="sm"
            isLoading={isResettingEverything}
            onPress={onResetClick}
            startContent={!isResettingEverything && <Icon icon="solar:trash-bin-trash-linear" width={16} />}
          >
            Reset Everything
          </Button>
        </div>
      </CardBody>
    </Card>
  );
});

OrganizationOverviewCard.displayName = "OrganizationOverviewCard";

export default OrganizationOverviewCard;