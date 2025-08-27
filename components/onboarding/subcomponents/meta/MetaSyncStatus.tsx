"use client";

import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

interface MetaSyncStatusProps {
  syncStatus?: string;
}

export default function MetaSyncStatus({ syncStatus }: MetaSyncStatusProps) {
  if (syncStatus !== "syncing") {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3">
        <Icon
          icon="solar:refresh-circle-bold"
          width={20}
          height={20}
          className="animate-spin text-primary"
        />
        <div>
          <p className="font-medium">Syncing historical leads...</p>
          <p className="text-sm text-default-500">
            This may take a few minutes. You can continue with the setup.
          </p>
        </div>
      </div>
    </Card>
  );
}