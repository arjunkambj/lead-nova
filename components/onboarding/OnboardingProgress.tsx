"use client";

import { usePathname } from "next/navigation";
import React from "react";

const ONBOARDING_STEPS = [
  { path: "/onboarding/create-organization", step: 1 },
  { path: "/onboarding/meta-connect", step: 2 },
  { path: "/onboarding/select-page", step: 2 }, // Part of Meta Connect flow
  { path: "/onboarding/select-forms", step: 2 }, // Part of Meta Connect flow
  { path: "/onboarding/invite-team", step: 3 },
  { path: "/onboarding/overview", step: 4 },
];

export default function OnboardingProgress() {
  const pathname = usePathname();

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => pathname === step.path,
  );
  const currentStep = currentStepData?.step || 1;

  // Only show the main 4 steps
  const mainSteps = [1, 2, 3, 4];

  return (
    <div className="flex items-center gap-3">
      {mainSteps.map((stepNum, index) => {
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div
              className={`h-2 transition-all duration-300 rounded-full ${
                isActive
                  ? "w-8 bg-primary"
                  : isCompleted
                    ? "w-2 bg-primary"
                    : "w-2 bg-default-200"
              }`}
            />

            {index < mainSteps.length - 1 && (
              <div
                className={`h-[1px] w-8 transition-colors duration-300 ${
                  isCompleted ? "bg-primary" : "bg-default-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
