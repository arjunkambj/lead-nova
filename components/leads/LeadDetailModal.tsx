"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useLeadActivities } from "@/hooks/useLeads";
import type { EnrichedLead } from "@/types/leads";

interface LeadDetailModalProps {
  leadId: Id<"leads">;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailModal({
  leadId,
  isOpen,
  onClose,
}: LeadDetailModalProps) {
  const lead = useQuery(api.core.leads.getLeadDetails, { leadId }) as
    | EnrichedLead
    | null
    | undefined;
  const { activities, isLoading: activitiesLoading } =
    useLeadActivities(leadId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Lead Details</ModalHeader>
        <ModalBody>
          {!lead ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lead Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">Name</p>
                    <p className="font-medium">{lead.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Email</p>
                    <p className="font-medium">{lead.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Phone</p>
                    <p className="font-medium">{lead.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Company</p>
                    <p className="font-medium">{lead.company || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Activity Timeline
                </h3>
                {activitiesLoading ? (
                  <Spinner size="sm" />
                ) : activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex gap-3 p-2 hover:bg-default-100 rounded"
                      >
                        <Icon
                          icon="solar:history-linear"
                          className="text-default-500 mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-default-400">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-default-500">No activities yet</p>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={() => {}}>
            Edit Lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
