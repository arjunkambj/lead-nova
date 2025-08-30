"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useUser";

export default function MetaConnectButton() {
  const router = useRouter();
  const user = useCurrentUser();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!user?.organizationId) {
      toast.error("Please create an organization first");
      router.push("/onboarding/create-organization");
      return;
    }

    setIsConnecting(true);
    window.location.href = `/api/meta/auth?org=${user.organizationId}`;
  };

  return (
    <Button
      color="primary"
      className="w-full"
      size="lg"
      startContent={
        !isConnecting && (
          <Icon icon="solar:facebook-bold" width={20} height={20} />
        )
      }
      onPress={handleConnect}
      isLoading={isConnecting}
      isDisabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect with Meta"}
    </Button>
  );
}
