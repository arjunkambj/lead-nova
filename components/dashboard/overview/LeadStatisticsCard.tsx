"use client";

import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { memo } from "react";

interface LeadStatisticsCardProps {
  stats: {
    totalLeads: number;
    leadsToday: number;
    connectedPages: number;
    lastSyncTime?: number;
    leadsByStatus: {
      new: number;
      contacted: number;
      qualified: number;
      converted: number;
      lost: number;
    };
  };
}

const LeadStatisticsCard = memo(({ stats }: LeadStatisticsCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Statistics</h3>
        <Icon icon="solar:graph-up-bold" width={24} className="text-primary" />
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.totalLeads}
            </p>
            <p className="text-xs text-default-500">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {stats.leadsToday}
            </p>
            <p className="text-xs text-default-500">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {stats.leadsByStatus.new}
            </p>
            <p className="text-xs text-default-500">New</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {stats.connectedPages}
            </p>
            <p className="text-xs text-default-500">Meta Pages</p>
          </div>
        </div>

        <Divider className="my-2" />

        <div className="space-y-2">
          <p className="text-sm font-medium">Lead Status Breakdown</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Chip size="sm" variant="flat" color="primary">
              New: {stats.leadsByStatus.new}
            </Chip>
            <Chip size="sm" variant="flat" color="secondary">
              Contacted: {stats.leadsByStatus.contacted}
            </Chip>
            <Chip size="sm" variant="flat" color="warning">
              Qualified: {stats.leadsByStatus.qualified}
            </Chip>
            <Chip size="sm" variant="flat" color="success">
              Converted: {stats.leadsByStatus.converted}
            </Chip>
            <Chip size="sm" variant="flat" color="danger">
              Lost: {stats.leadsByStatus.lost}
            </Chip>
          </div>
        </div>

        {stats.lastSyncTime && (
          <div className="flex justify-between items-center text-xs text-default-500">
            <span>Last Sync:</span>
            <span className="flex items-center gap-1">
              {new Date(stats.lastSyncTime).toLocaleString()}
              {Date.now() - stats.lastSyncTime < 60000 && (
                <Chip size="sm" color="success" variant="dot" className="ml-1">
                  New
                </Chip>
              )}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
});

LeadStatisticsCard.displayName = "LeadStatisticsCard";

export default LeadStatisticsCard;
