"use client";

import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { memo } from "react";

const QuickActionsGrid = memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Icon
              icon="solar:users-group-rounded-bold"
              width={24}
              className="text-primary"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Manage Team</p>
            <p className="text-xs text-default-500">Invite or manage members</p>
          </div>
        </CardBody>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="p-3 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
            <Icon
              icon="solar:settings-bold"
              width={24}
              className="text-secondary"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Settings</p>
            <p className="text-xs text-default-500">Configure preferences</p>
          </div>
        </CardBody>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardBody className="flex flex-row items-center gap-4">
          <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
            <Icon
              icon="solar:chart-square-bold"
              width={24}
              className="text-success"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-xs text-default-500">View insights</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
});

QuickActionsGrid.displayName = "QuickActionsGrid";

export default QuickActionsGrid;
