"use client";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainHeader from "@/components/shared/MainHeader";
import { useDashboardData } from "@/hooks/useDashboard";
import { useResetEverything } from "@/hooks/useUser";
import LeadStatisticsCard from "./LeadStatisticsCard";
import OrganizationOverviewCard from "./OrganizationOverviewCard";
import QuickActionsGrid from "./QuickActionsGrid";
import RecentLeadsCard from "./RecentLeadsCard";
import SyncStatusCard from "./SyncStatusCard";
import UserDetailsCard from "./UserDetailsCard";

export default function OverviewView() {
  const router = useRouter();
  const dashboardData = useDashboardData(5);
  const resetEverything = useResetEverything();

  const [isResettingEverything, setIsResettingEverything] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const prevSyncJobRef = useRef<string | null>(null);

  const user = dashboardData?.user;
  const organization = dashboardData?.organization;
  const stats = dashboardData?.stats;
  const latestLeads = dashboardData?.latestLeads;
  const syncStatus = dashboardData?.syncStatus;

  const getUserRoleDisplay = useCallback((role?: string) => {
    const roleMap = {
      clientAdmin: { label: "Admin", color: "primary" as const },
      manager: { label: "Manager", color: "secondary" as const },
      member: { label: "Member", color: "default" as const },
      superAdmin: { label: "Super Admin", color: "danger" as const },
      oppsDev: { label: "Ops Dev", color: "warning" as const },
    };
    return (
      roleMap[role as keyof typeof roleMap] || {
        label: "Unknown",
        color: "default" as const,
      }
    );
  }, []);

  const roleInfo = useMemo(
    () => getUserRoleDisplay(user?.role),
    [user?.role, getUserRoleDisplay],
  );

  useEffect(() => {
    if (syncStatus) {
      const currentJobId = syncStatus.currentJob?._id || null;
      const prevJobId = prevSyncJobRef.current;

      if (prevJobId && !currentJobId) {
        const completedJob = syncStatus.recentJobs.find(
          (job) => job._id === prevJobId,
        );
        if (completedJob) {
          if (completedJob.status === "completed") {
            addToast({
              title: "Sync Completed",
              description: `Successfully synced ${completedJob.totalLeads || 0} leads`,
              color: "success",
            });
          } else if (completedJob.status === "failed") {
            addToast({
              title: "Sync Failed",
              description: "The sync job encountered an error",
              color: "danger",
            });
          }
        }
      }

      prevSyncJobRef.current = currentJobId;
    }
  }, [syncStatus]);

  const handleResetEverything = useCallback(async () => {
    if (resetConfirmText !== "RESET") {
      addToast({
        title: "Invalid Confirmation",
        description: "Please type RESET to confirm",
        color: "warning",
      });
      return;
    }

    setIsResettingEverything(true);
    setShowResetModal(false);

    try {
      const result = await resetEverything();

      if (result.success) {
        addToast({
          title: "Reset Complete",
          description: result.message,
          color: "success",
        });

        setTimeout(() => {
          router.push("/onboarding/create-organization");
        }, 1000);
      }
    } catch (error) {
      addToast({
        title: "Reset Failed",
        description:
          error instanceof Error ? error.message : "Failed to reset everything",
        color: "danger",
      });
      setIsResettingEverything(false);
    }
  }, [resetConfirmText, resetEverything, router]);

  const handleResetClick = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowResetModal(false);
    setResetConfirmText("");
  }, []);

  if (!user || !organization || !stats || !syncStatus) {
    return (
      <div className="flex flex-col gap-1">
        <MainHeader title="Overview" />
        <div className="flex-1 space-y-6">
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <MainHeader title="Overview" />

      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome back, {user.name || "User"}!
          </h2>
          <Button
            variant="light"
            size="sm"
            startContent={<Icon icon="lucide:plus" width={16} />}
          >
            New Task
          </Button>
        </div>

        <UserDetailsCard
          user={user}
          organization={organization}
          roleInfo={roleInfo}
        />

        <OrganizationOverviewCard
          user={user}
          organization={organization}
          roleInfo={roleInfo}
          isResettingEverything={isResettingEverything}
          onResetClick={handleResetClick}
        />

        <LeadStatisticsCard stats={stats} />

        <SyncStatusCard
          syncStatus={syncStatus}
          prevSyncJobId={prevSyncJobRef.current}
        />

        <RecentLeadsCard latestLeads={latestLeads || []} />

        <QuickActionsGrid />
      </div>

      <Modal
        isOpen={showResetModal}
        onClose={handleModalClose}
        size="md"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-danger">Reset Everything</h3>
            <p className="text-xs text-default-500 font-normal">
              This action cannot be undone
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <p className="text-sm text-danger font-medium mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-xs text-danger-600 dark:text-danger-400 space-y-1 list-disc list-inside">
                  <li>All your leads and lead data</li>
                  <li>All Meta/Facebook integrations</li>
                  <li>All sync jobs and history</li>
                  <li>Your onboarding progress</li>
                  <li>Organization settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  To confirm, type{" "}
                  <span className="font-mono font-bold">RESET</span> below:
                </p>
                <Input
                  placeholder="Type RESET to confirm"
                  value={resetConfirmText}
                  onValueChange={setResetConfirmText}
                  variant="bordered"
                  classNames={{
                    input: "font-mono",
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleModalClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleResetEverything}
              isDisabled={resetConfirmText !== "RESET"}
              isLoading={isResettingEverything}
            >
              Reset Everything
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
