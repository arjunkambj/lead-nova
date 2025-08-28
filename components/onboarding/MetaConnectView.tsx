"use client";

import { Card, Chip, Avatar, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OnboardingCard from "./OnboardingCard";
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

  // Determine if Meta is connected from onboarding status
  const isMetaConnected = onboardingStatus?.isMetaConnected || false;

  const handleContinue = async () => {
    // Ensure we're on the right step before continuing
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
      {/* Process OAuth callback parameters */}
      <MetaCallbackHandler />
      
      <OnboardingCard
        title={isMetaConnected ? "Meta Account Connected" : "Connect Your Facebook Page"}
        subtitle={isMetaConnected 
          ? "Your Facebook page is successfully linked" 
          : "Start receiving leads from your Facebook ads"}
      >
        <div className="space-y-6">
          <Card className="p-6">
            {/* Connection Status Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Meta Connection Status</h3>
              {isMetaConnected && (
                <Chip
                  color="success"
                  variant="flat"
                  startContent={
                    <Icon icon="solar:check-circle-bold" width={16} height={16} />
                  }
                >
                  Connected
                </Chip>
              )}
            </div>

            {isMetaConnected && connectionStatus ? (
              <div className="space-y-4">
                {/* Connected Page Info */}
                <div className="flex items-center space-x-3 p-3 bg-default-50 rounded-lg">
                  <Avatar
                    icon={
                      <Icon icon="solar:facebook-bold" width={20} height={20} />
                    }
                    className="bg-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{connectionStatus.pageName}</p>
                    <p className="text-sm text-default-500">
                      Page ID: {connectionStatus.pageId}
                    </p>
                  </div>
                </div>

                {/* Connection Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-default-500">Last Synced</p>
                    <p className="font-medium">
                      {connectionStatus.lastSyncedAt
                        ? new Date(connectionStatus.lastSyncedAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Lead Count</p>
                    <p className="font-medium">{connectionStatus.leadCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-default-500">Sync Status</p>
                    <p className="font-medium capitalize">
                      {connectionStatus.syncStatus || "Idle"}
                    </p>
                  </div>
                  <div>
                    <p className="text-default-500">Token Expires</p>
                    <p className="font-medium">
                      {connectionStatus.tokenExpiresAt
                        ? new Date(connectionStatus.tokenExpiresAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <MetaDisconnectAction />
                  <Button color="primary" onPress={handleContinue}>
                    Continue Setup
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-default-600">
                  Connect your Facebook page to start receiving leads directly in LeadNova.
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      width={16}
                      height={16}
                      className="text-success"
                    />
                    <span className="text-sm">
                      Real-time lead capture from Facebook forms
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      width={16}
                      height={16}
                      className="text-success"
                    />
                    <span className="text-sm">
                      Automatic historical lead import (last 30 days)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      width={16}
                      height={16}
                      className="text-success"
                    />
                    <span className="text-sm">Secure token encryption</span>
                  </div>
                </div>

                {/* Connect Button */}
                <MetaConnectButton />

                {/* Skip Option */}
                <div className="text-center">
                  <Button variant="light" size="sm" onPress={handleSkip}>
                    Skip for now
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Sync Status if actively syncing */}
          <MetaSyncStatus syncStatus={connectionStatus?.syncStatus} />
          
          {/* Development Mode Notice */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="p-4 bg-blue-50">
              <div className="flex items-start space-x-2">
                <Icon 
                  icon="solar:info-circle-bold" 
                  width={20} 
                  height={20} 
                  className="text-blue-600 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">
                    Development Mode Active
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your Facebook app is in development mode. Some features may be limited:
                  </p>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1">
                    <li>• Lead forms may not be accessible via API</li>
                    <li>• Only test leads from app users will be captured</li>
                    <li>• Webhooks will only receive events from test users</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2 font-medium">
                    To access all features, submit your app for Facebook review.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </OnboardingCard>
    </>
  );
}