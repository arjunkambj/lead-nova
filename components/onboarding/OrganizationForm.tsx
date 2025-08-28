"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import {
  useCreateOrganization,
  useOnboardingStatus,
} from "@/hooks/useOnboarding";
import { useCurrentUser } from "@/hooks/useUser";

export default function OrganizationForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [operatingCity, setOperatingCity] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ 
    name?: string; 
    mobileNumber?: string; 
  }>({});
  const [isEditMode, setIsEditMode] = React.useState(false);
  const hasInitialized = useRef(false);

  const createOrganization = useCreateOrganization();
  const onboardingStatus = useOnboardingStatus();
  const user = useCurrentUser();

  // Handle form data population - only once on initial load
  useEffect(() => {
    // Only populate form once when organization data is first available
    if (onboardingStatus?.organization && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsEditMode(true);
      setName(onboardingStatus.organization.name);
      if (onboardingStatus.organization.mobileNumber) {
        setMobileNumber(onboardingStatus.organization.mobileNumber);
      }
      if (onboardingStatus.organization.operatingCity) {
        setOperatingCity(onboardingStatus.organization.operatingCity);
      }
    }
  }, [onboardingStatus?.organization]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  }, [errors.name]);

  const handleMobileNumberChange = useCallback((value: string) => {
    setMobileNumber(value);
    if (errors.mobileNumber) {
      setErrors(prev => ({ ...prev, mobileNumber: undefined }));
    }
  }, [errors.mobileNumber]);

  const validateForm = useCallback(() => {
    const newErrors: { name?: string; mobileNumber?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Organization name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Validate mobile number if provided
    if (mobileNumber && !/^[+]?[\d\s()-]+$/.test(mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, mobileNumber]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrganization({
        name: name.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        operatingCity: operatingCity.trim() || undefined,
      });

      if (result.success) {
        addToast({
          title: isEditMode ? "Organization updated" : "Organization created",
          description: isEditMode 
            ? "Your organization has been updated successfully"
            : "Your organization has been created successfully",
          color: "success",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push("/onboarding/meta-connect" as any);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create organization",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, createOrganization, name, mobileNumber, operatingCity, isEditMode, router]);

  // Unified loading state - check after all hooks are defined
  const isLoading = useMemo(() => !user, [user]);
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-default-700 mb-2 block">
            Name <span className="text-danger">*</span>
          </label>
          <Input
            placeholder="Acme Inc."
            value={name}
            onValueChange={handleNameChange}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            description="This is the name that will be displayed to your team members."
            isRequired
            classNames={{
              input: "text-sm",
              description: "text-xs",
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-default-700 mb-2 block">
            Mobile Number
          </label>
          <Input
            placeholder="+1 (555) 123-4567"
            value={mobileNumber}
            onValueChange={handleMobileNumberChange}
            isInvalid={!!errors.mobileNumber}
            errorMessage={errors.mobileNumber}
            description="Contact number for your organization (optional)."
            classNames={{
              input: "text-sm",
              description: "text-xs",
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-default-700 mb-2 block">
            Operating City
          </label>
          <Input
            placeholder="New York"
            value={operatingCity}
            onValueChange={setOperatingCity}
            description="Primary city where your organization operates (optional)."
            classNames={{
              input: "text-sm",
              description: "text-xs",
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full mt-4"
        isLoading={isSubmitting}
      >
        {isEditMode ? "Update & Continue" : "Create Organization"}
      </Button>
    </form>
  );
}