"use client";

import { Button, Chip, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MetaConnectButton from "./subcomponents/meta/MetaConnectButton";
import MetaDisconnectAction from "./subcomponents/meta/MetaDisconnectAction";
import MetaSyncStatus from "./subcomponents/meta/MetaSyncStatus";
import MetaCallbackHandler from "./subcomponents/meta/MetaCallbackHandler";
import { useOnboardingStatus, useUpdateOnboardingStep, useSkipOnboardingStep } from "@/hooks/useOnboarding";
import { useMetaConnectionStatus } from "@/hooks/useMeta";

export default function MetaConnectView() {
  const router = useRouter();
  const onboardingStatus = useOnboardingStatus();
  const connectionStatus = useMetaConnectionStatus();
  const updateOnboardingStep = useUpdateOnboardingStep();
  const skipOnboardingStep = useSkipOnboardingStep();

  const isMetaConnected = onboardingStatus?.isMetaConnected || false;

  const handleContinue = async () => {
    if (onboardingStatus && onboardingStatus.onboardingStep && onboardingStatus.onboardingStep < 3) {
      try {
        await updateOnboardingStep({ step: 3 });
      } catch (error) {
        console.error("Failed to update step:", error);
        toast.error("Failed to continue");
        return;
      }
    }
    router.push("/onboarding/invite-team");
  };

  const handleSkip = async () => {
    try {
      await skipOnboardingStep({ currentStep: 2 });
      router.push("/onboarding/invite-team");
    } catch (error) {
      console.error("Failed to skip step:", error);
      toast.error("Failed to skip step");
    }
  };

  return (
    <>
      <MetaCallbackHandler />
      
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          {isMetaConnected ? "Meta Account Connected" : "Connect Facebook"}
        </h1>
        <p className="text-default-500 text-sm mb-8">
          {isMetaConnected 
            ? "Your Facebook page is linked" 
            : "Start receiving leads from Facebook"}
        </p>

        {isMetaConnected && connectionStatus ? (
          <div className="space-y-6">
            {/* Connected Page Info */}
            <div className="flex items-center gap-4 p-4 bg-content2 rounded-lg">
              <Avatar
                icon={<Icon icon="solar:facebook-bold" width={20} height={20} />}
                className="bg-primary"
              />
              <div className="flex-1">
                <p className="font-medium">{connectionStatus.pageName}</p>
                <p className="text-sm text-default-500">
                  Page ID: {connectionStatus.pageId}
                </p>
              </div>
              <Chip color="success" size="sm" variant="flat">
                Connected
              </Chip>
            </div>

            {/* Connection Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-default-500">Last Synced</p>
                <p className="text-sm font-medium">
                  {connectionStatus.lastSyncedAt
                    ? new Date(connectionStatus.lastSyncedAt).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-500">Lead Count</p>
                <p className="text-sm font-medium">{connectionStatus.leadCount || 0}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <MetaDisconnectAction />
              <Button color="primary" onPress={handleContinue} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <MetaConnectButton />
            
            <div className="text-center">
              <Button variant="flat" size="sm" onPress={handleSkip}>
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* Sync Status */}
        <MetaSyncStatus syncStatus={connectionStatus?.syncStatus} />
      </div>
    </>
  );
}