"use client";

import { Button } from "@heroui/react";
import { toast } from "sonner";
import { useDisconnectMetaAccount } from "@/hooks/useMeta";
import { useState } from "react";

interface MetaDisconnectActionProps {
  onDisconnected?: () => void;
}

export default function MetaDisconnectAction({
  onDisconnected,
}: MetaDisconnectActionProps) {
  const disconnectMeta = useDisconnectMetaAccount();
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