"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function GoogleAuth() {
  const { isLoaded, signIn } = useSignIn();

  const handleGoogleAuth = () => {
    if (!isLoaded) return;

    try {
      signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/overview",
        redirectUrlComplete: "/overview",
      });
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <Button
      radius="full"
      className="w-full"
      size="lg"
      onPress={handleGoogleAuth}
      disabled={!isLoaded}
    >
      <Icon icon="mdi:google" />
      Continue with Google
    </Button>
  );
}
