"use client";

import React from "react";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import {
  useCompleteOnboarding,
  useOnboardingStatus,
} from "@/hooks/useOnboarding";
import { useOrganization } from "@/hooks/useOrganization";

export default function OnboardingOverview() {
  const router = useRouter();
  const completeOnboarding = useCompleteOnboarding();
  const onboardingStatus = useOnboardingStatus();
  const organizationWithMembers = useOrganization();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const result = await completeOnboarding();

      if (result.success) {
        addToast({
          title: "Setup complete!",
          description: "Your organization is ready to go",
          color: "success",
        });
        router.push("/overview");
      }
    } catch (error) {
      addToast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete onboarding",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!onboardingStatus || !organizationWithMembers) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  const { organization } = onboardingStatus;
  const { invitedMembers } = organizationWithMembers;

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-4">
        {/* Organization */}
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:check-circle-bold"
            width={20}
            className="text-success"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Organization created</p>
            <p className="text-xs text-default-500">{organization.name}</p>
          </div>
        </div>

        {/* Meta Connection */}
        {onboardingStatus.isMetaConnected && (
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:check-circle-bold"
              width={20}
              className="text-success"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Facebook connected</p>
              <p className="text-xs text-default-500">Ready to receive leads</p>
            </div>
          </div>
        )}

        {/* Team */}
        <div className="flex items-center gap-3">
          <Icon
            icon={invitedMembers.length > 0 ? "solar:check-circle-bold" : "solar:minus-circle-linear"}
            width={20}
            className={invitedMembers.length > 0 ? "text-success" : "text-default-300"}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Team members</p>
            <p className="text-xs text-default-500">
              {invitedMembers.length > 0
                ? `${invitedMembers.length} invited`
                : "No members invited"}
            </p>
          </div>
        </div>
      </div>

      <Button
        color="primary"
        className="w-full"
        size="lg"
        onPress={handleComplete}
        isLoading={isLoading}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}