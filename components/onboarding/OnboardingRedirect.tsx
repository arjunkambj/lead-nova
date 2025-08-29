"use client";

import { Spinner } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOnboardingRoute, ONBOARDING_ROUTES } from "@/configs/onboarding";
import { useOnboardingStatus } from "@/hooks/useOnboarding";
import { useCurrentUser } from "@/hooks/useUser";

export default function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingStatus = useOnboardingStatus();
  const user = useCurrentUser();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;

    if (!user) return; // Still loading user

    // If user is already fully onboarded, redirect to main overview
    if (user.isOnboarded) {
      setHasRedirected(true);
      router.replace("/overview");
      return;
    }

    // If no organization, start from the beginning
    if (!user.organizationId) {
      setHasRedirected(true);
      router.replace("/onboarding/create-organization");
      return;
    }

    // Wait for onboarding status to load
    if (onboardingStatus === undefined) return;

    // If no onboarding record exists, create one by going to step 1
    if (!onboardingStatus) {
      setHasRedirected(true);
      router.replace("/onboarding/create-organization");
      return;
    }

    // Determine the appropriate route based on step
    const route = getOnboardingRoute(
      onboardingStatus.onboardingStep,
      onboardingStatus.isCompleted,
      user.isOnboarded,
    );

    // Validate step progression - don't allow skipping steps
    const currentStep = onboardingStatus.onboardingStep || 1;
    const stepRoutes = Object.values(ONBOARDING_ROUTES) as string[];

    // Get the index of the current path in the step routes
    const currentPathIndex = stepRoutes.indexOf(pathname);

    // If user is trying to access a step they haven't reached yet
    if (currentPathIndex >= 0 && currentPathIndex + 1 > currentStep) {
      // Redirect to the correct step
      setHasRedirected(true);
      router.replace(route);
      return;
    }

    // Only redirect if we're not already on the correct route
    if (pathname !== route) {
      setHasRedirected(true);
      router.replace(route);
    }
  }, [onboardingStatus, user, router, pathname, hasRedirected]);

  // Show loading while determining redirect
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-default-500">
          Setting up your onboarding...
        </p>
      </div>
    </div>
  );
}
