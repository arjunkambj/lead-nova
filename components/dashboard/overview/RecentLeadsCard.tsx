"use client";

import { memo } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Chip
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface Lead {
  _id: string;
  leadId: string;
  formName?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  status: string;
  createdTime: number;
  platform?: string;
  city?: string;
  campaignName?: string;
}

interface RecentLeadsCardProps {
  latestLeads: Lead[];
}

const RecentLeadsCard = memo(({ latestLeads }: RecentLeadsCardProps) => {
  if (!latestLeads || latestLeads.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Leads</h3>
        <Icon icon="solar:users-group-rounded-bold" width={24} className="text-primary" />
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-2">
          {latestLeads.map((lead) => (
            <div key={lead._id} className="p-3 bg-default-50 dark:bg-default-100/20 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{lead.fullName || "No Name"}</p>
                    <Chip size="sm" variant="flat" color={
                      lead.status === "new" ? "primary" :
                      lead.status === "contacted" ? "secondary" :
                      lead.status === "qualified" ? "warning" :
                      lead.status === "converted" ? "success" : "danger"
                    }>
                      {lead.status}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-default-500">
                    {lead.email && (
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:letter-bold" width={12} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:phone-bold" width={12} />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.city && (
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:map-point-bold" width={12} />
                        <span>{lead.city}</span>
                      </div>
                    )}
                    {lead.formName && (
                      <div className="flex items-center gap-1">
                        <Icon icon="solar:document-text-bold" width={12} />
                        <span>{lead.formName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-default-500">
                    {new Date(lead.createdTime).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-default-400">
                    {new Date(lead.createdTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
});

RecentLeadsCard.displayName = "RecentLeadsCard";

export default RecentLeadsCard;