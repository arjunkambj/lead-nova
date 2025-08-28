"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToast } from "@heroui/react";
import { useCurrentUser, useResetEverything } from "./useUser";
import { useOrganization } from "./useOrganization";
import { useResetOnboarding } from "./useOnboarding";

export function useOverview() {
  const router = useRouter();
  const user = useCurrentUser();
  const organization = useOrganization();
  const resetOnboarding = useResetOnboarding();
  const resetEverything = useResetEverything();
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingEverything, setIsResettingEverything] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const handleResetOnboarding = async () => {
    setIsResetting(true);
    
    try {
      const result = await resetOnboarding();
      
      if (result.success) {
        addToast({
          title: "Onboarding Reset",
          description: "Redirecting to onboarding setup...",
          color: "success",
        });
        
        // Small delay to show toast
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push("/onboarding/create-organization" as any);
        }, 500);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset onboarding",
        color: "danger",
      });
      setIsResetting(false);
    }
  };

  const handleResetEverything = async () => {
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
        
        // Small delay to show toast
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push("/onboarding/create-organization" as any);
        }, 1000);
      }
    } catch (error) {
      addToast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset everything",
        color: "danger",
      });
      setIsResettingEverything(false);
    }
  };

  return {
    user,
    organization,
    isResetting,
    handleResetOnboarding,
    isResettingEverything,
    handleResetEverything,
    showResetModal,
    setShowResetModal,
    resetConfirmText,
    setResetConfirmText,
  };
}