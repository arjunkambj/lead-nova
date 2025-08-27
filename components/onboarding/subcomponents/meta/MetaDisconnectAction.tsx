"use client";

import { Button } from "@heroui/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface MetaDisconnectActionProps {
  onDisconnected?: () => void;
}

export default function MetaDisconnectAction({
  onDisconnected,
}: MetaDisconnectActionProps) {
  const disconnectMeta = useMutation(api.integration.meta.disconnectMetaAccount);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectMeta();
      toast.success("Disconnected from Meta");
      onDisconnected?.();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Button 
      color="danger" 
      variant="flat" 
      onPress={handleDisconnect}
      isLoading={isDisconnecting}
    >
      Disconnect
    </Button>
  );
}