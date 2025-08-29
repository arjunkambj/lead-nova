"use client";

import { Card, CardBody, Spinner } from "@heroui/react";
import { memo, useMemo } from "react";
import type { Id } from "@/convex/_generated/dataModel";
// import { Icon } from "@iconify/react";
import { useLeadsKanban } from "@/hooks/useLeads";
import type { EnrichedLead, LeadFilters } from "@/types/leads";

interface LeadsKanbanViewProps {
  filters?: LeadFilters;
  onLeadClick?: (leadId: Id<"leads">) => void;
}

// Memoized card component for better performance
const LeadCard = memo(function LeadCard({
  lead,
  onLeadClick,
}: {
  lead: EnrichedLead;
  onLeadClick?: (leadId: Id<"leads">) => void;
}) {
  return (
    <Card
      key={lead._id}
      isPressable
      onPress={() => onLeadClick?.(lead._id)}
      className="cursor-pointer"
    >
      <CardBody className="p-3">
        <p className="font-medium">
          {lead.fullName || lead.email || "Unnamed Lead"}
        </p>
        {lead.company && (
          <p className="text-sm text-default-500">{lead.company}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-default-400">
            Score: {lead.score || 0}
          </span>
          {lead.assignedUser && (
            <span className="text-xs text-default-400">
              {lead.assignedUser.name}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

// Memoized stage column component
const StageColumn = memo(function StageColumn({
  stage,
  onLeadClick,
}: {
  stage: {
    stage: string;
    stageInfo?: { label: string; color: string };
    leads: EnrichedLead[];
    count: number;
  };
  onLeadClick?: (leadId: Id<"leads">) => void;
}) {
  return (
    <div className="min-w-[300px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {stage.stageInfo?.label || stage.stage}
        </h3>
        <p className="text-sm text-default-500">{stage.count} leads</p>
      </div>
      <div className="space-y-2">
        {stage.leads.map((lead: EnrichedLead) => (
          <LeadCard key={lead._id} lead={lead} onLeadClick={onLeadClick} />
        ))}
      </div>
    </div>
  );
});

export const LeadsKanbanView = memo(function LeadsKanbanView({
  filters,
  onLeadClick,
}: LeadsKanbanViewProps) {
  const { stages, isLoading } = useLeadsKanban(filters);

  // Memoize the rendered stages to prevent unnecessary re-renders
  const renderedStages = useMemo(
    () =>
      stages.map((stage) => (
        <StageColumn
          key={stage.stage}
          stage={stage}
          onLeadClick={onLeadClick}
        />
      )),
    [stages, onLeadClick],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex gap-4 overflow-x-auto">{renderedStages}</div>
    </div>
  );
});
