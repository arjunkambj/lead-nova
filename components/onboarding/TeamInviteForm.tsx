"use client";

import React from "react";
import { Button, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { useInviteTeamMembers } from "@/hooks/useOrganization";
import {
  useUpdateOnboardingStep,
  useOnboardingStatus,
} from "@/hooks/useOnboarding";
import { useCurrentUser } from "@/hooks/useUser";

interface TeamMember {
  id: string;
  email: string;
  role: "member" | "manager";
}

const roles = [
  { value: "member", label: "Member" },
  { value: "manager", label: "Manager" },
];

export default function TeamInviteForm() {
  const router = useRouter();
  const inviteTeamMembers = useInviteTeamMembers();
  const updateOnboardingStep = useUpdateOnboardingStep();
  const onboardingStatus = useOnboardingStatus();
  const user = useCurrentUser();

  const [members, setMembers] = React.useState<TeamMember[]>([
    { id: "1", email: "", role: "member" },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!onboardingStatus || !user) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const addMember = () => {
    setMembers([
      ...members,
      { id: Date.now().toString(), email: "", role: "member" },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter((m) => m.id !== id));
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateMember = (id: string, field: "email" | "role", value: string) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const validateEmails = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validMembers = members.filter((m) => m.email.trim() !== "");

    if (validMembers.length === 0) {
      return true;
    }

    validMembers.forEach((member) => {
      if (!emailRegex.test(member.email)) {
        newErrors[member.id] = "Invalid email address";
      }
    });

    const emails = validMembers.map((m) => m.email.toLowerCase());
    const duplicates = emails.filter(
      (email, index) => emails.indexOf(email) !== index
    );
    if (duplicates.length > 0) {
      members.forEach((member) => {
        if (duplicates.includes(member.email.toLowerCase())) {
          newErrors[member.id] = "Duplicate email address";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmails()) {
      return;
    }

    const validMembers = members.filter((m) => m.email.trim() !== "");

    if (validMembers.length === 0) {
      await handleSkip();
      return;
    }

    setIsLoading(true);

    try {
      const result = await inviteTeamMembers({
        members: validMembers.map((m) => ({
          email: m.email.trim(),
          role: m.role,
        })),
      });

      if (result.success) {
        await updateOnboardingStep({ step: 4 });

        if (result.failed.length > 0) {
          addToast({
            title: "Some invites failed",
            description: `Successfully invited ${result.invited} member(s). ${result.failed.length} failed.`,
            color: "warning",
          });
        } else {
          addToast({
            title: "Team invited",
            description: `Successfully invited ${result.invited} team member(s)`,
            color: "success",
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push("/onboarding/overview" as any);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to invite team members",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await updateOnboardingStep({ step: 4 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push("/onboarding/overview" as any);
    } catch {
      addToast({
        title: "Error",
        description: "Failed to skip step",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-3">
        {members.map((member, index) => (
          <div key={member.id} className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={member.email}
              onValueChange={(value) =>
                updateMember(member.id, "email", value)
              }
              isInvalid={!!errors[member.id]}
              errorMessage={errors[member.id]}
              className="flex-1"
              variant="flat"
              size="lg"
              autoFocus={index === 0}
            />
            <Select
              selectedKeys={[member.role]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                updateMember(member.id, "role", value);
              }}
              className="w-40"
              size="lg"
              variant="flat"
            >
              {roles.map((role) => (
                <SelectItem key={role.value}>{role.label}</SelectItem>
              ))}
            </Select>
            {members.length > 1 && (
              <Button
                isIconOnly
                size="lg"
                variant="flat"
                onPress={() => removeMember(member.id)}
              >
                <Icon icon="solar:trash-bin-minimalistic-linear" width={18} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {members.length < 5 && (
        <Button
          variant="flat"
          startContent={<Icon icon="solar:add-circle-linear" width={18} />}
          onPress={addMember}
          className="w-full"
          size="lg"
        >
          Add another
        </Button>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="flat"
          className="flex-1"
          onPress={handleSkip}
          isDisabled={isLoading}
          size="lg"
        >
          Skip for now
        </Button>
        <Button
          type="submit"
          color="primary"
          className="flex-1"
          isLoading={isLoading}
          size="lg"
        >
          Send Invites
        </Button>
      </div>
    </form>
  );
}