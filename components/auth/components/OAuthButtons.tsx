"use client";

import React, { useCallback } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";

interface OAuthButtonsProps {
  mode?: "login" | "signup";
}

const OAuthButtons = React.memo(function OAuthButtons({}: OAuthButtonsProps) {
  const { handleGoogleSignIn } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const onGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await handleGoogleSignIn();
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [handleGoogleSignIn]);

  const handleGithubSignIn = useCallback(async () => {
    addToast({
      title: "Coming Soon",
      description: "GitHub authentication will be available soon",
      color: "warning",
      timeout: 2000,
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Button
        startContent={<Icon icon="flat-color-icons:google" width={24} />}
        variant="flat"
        fullWidth
        className="bg-content2 hover:bg-content3"
        onPress={onGoogleSignIn}
        isLoading={isGoogleLoading}
      >
        Continue with Google
      </Button>
      <Button
        startContent={
          <Icon className="text-default-500" icon="fe:github" width={24} />
        }
        variant="flat"
        fullWidth
        className="bg-content2 hover:bg-content3"
        onPress={handleGithubSignIn}
      >
        Continue with Github
      </Button>
    </div>
  );
});

export default OAuthButtons;
