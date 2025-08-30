"use client";

import { Avatar, Button, Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useMetaConnectionStatus } from "@/hooks/useMeta";
import {
  useOnboardingStatus,
  useSkipOnboardingStep,
  useUpdateOnboardingStep,
} from "@/hooks/useOnboarding";
import MetaCallbackHandler from "./subcomponents/meta/MetaCallbackHandler";
import MetaConnectButton from "./subcomponents/meta/MetaConnectButton";
import MetaDisconnectAction from "./subcomponents/meta/MetaDisconnectAction";
import MetaSyncStatus from "./subcomponents/meta/MetaSyncStatus";

export default function MetaConnectView() {
  const router = useRouter();
  const onboardingStatus = useOnboardingStatus();
  const connectionStatus = useMetaConnectionStatus();
  const updateOnboardingStep = useUpdateOnboardingStep();
  const skipOnboardingStep = useSkipOnboardingStep();

  const isMetaConnected = onboardingStatus?.isMetaConnected || false;
  const isLoading =
    onboardingStatus === undefined || connectionStatus === undefined;

  // Redirect to select-page if already connected and coming back
  useEffect(() => {
    if (isMetaConnected && connectionStatus?.pageId) {
      // If Meta is already connected, redirect to select-page step
      router.push("/onboarding/select-page");
    }
  }, [isMetaConnected, connectionStatus?.pageId, router]);

  const handleContinue = async () => {
    if (
      onboardingStatus?.onboardingStep &&
      onboardingStatus.onboardingStep < 3
    ) {
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

        {isLoading ? (
          <div className="space-y-4">
            {/* Skeleton for connected page info */}
            <Skeleton className="rounded-xl">
              <Card>
                <CardBody className="p-4">
                  <div className="h-16 rounded-xl bg-default-300" />
                </CardBody>
              </Card>
            </Skeleton>

            {/* Skeleton for buttons */}
            <Skeleton className="rounded-lg">
              <div className="h-12 rounded-lg bg-default-300" />
            </Skeleton>
          </div>
        ) : isMetaConnected && connectionStatus ? (
          <div className="space-y-6">
            {/* Connected Page Info */}
            <Card className="w-full">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    icon={
                      <Icon icon="solar:facebook-bold" width={20} height={20} />
                    }
                    className="bg-primary flex-shrink-0"
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {connectionStatus.pageName}
                    </p>
                    <p className="text-sm text-default-500">
                      Facebook Page Connected
                    </p>
                  </div>
                  <Chip color="success" size="sm" variant="flat">
                    Connected
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                color="primary"
                onPress={handleContinue}
                size="lg"
                className="w-full"
                endContent={
                  <Icon icon="solar:alt-arrow-right-linear" width={20} />
                }
              >
                Continue
              </Button>

              <div className="flex justify-end">
                <MetaDisconnectAction />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <MetaConnectButton />

            <div className="flex justify-end">
              <Button
                variant="flat"
                size="md"
                onPress={handleSkip}
                className="text-default-500"
              >
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
