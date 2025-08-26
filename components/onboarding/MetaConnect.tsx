"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Spinner, Chip, Avatar } from "@heroui/react";
import { Facebook, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useUser";
import { useSkipOnboardingStep } from "@/hooks/useOnboarding";
import { toast } from "sonner";

export default function MetaConnect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const skipOnboardingStep = useSkipOnboardingStep();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Array<{
    id: string;
    name: string;
    selected?: boolean;
  }>>([]);
  
  // Get current connection status
  const connectionStatus = useQuery(api.integration.meta.getConnectionStatus);
  const disconnectMeta = useMutation(api.integration.meta.disconnectMetaAccount);
  
  // Check for OAuth callback parameters
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const pageName = searchParams.get("page");
    const pagesParam = searchParams.get("pages");
    
    if (success === "true") {
      toast.success(
        pageName 
          ? `Successfully connected to ${pageName}` 
          : "Successfully connected to Meta"
      );
      
      // Parse pages if available
      if (pagesParam) {
        try {
          const pages = JSON.parse(pagesParam);
          setSelectedPages(pages);
        } catch (e) {
          console.error("Failed to parse pages:", e);
        }
      }
    } else if (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  }, [searchParams]);
  
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "no_pages":
        return "No Facebook pages found. Please ensure you have admin access to at least one page.";
      case "oauth_init_failed":
        return "Failed to start Meta connection. Please try again.";
      case "oauth_failed":
        return "Failed to connect to Meta. Please try again.";
      case "api_error":
        return "Failed to fetch data from Meta. Please try again.";
      case "missing_parameters":
        return "Invalid request. Please try again.";
      case "auth_failed":
        return "Authentication failed. Please sign in and try again.";
      case "callback_failed":
        return "Connection failed. Please try again.";
      default:
        return `Connection error: ${error}`;
    }
  };
  
  const handleConnect = async () => {
    if (!user?.organizationId) {
      toast.error("Please create an organization first");
      router.push("/onboarding/create-organization");
      return;
    }
    
    setIsConnecting(true);
    
    // Redirect to OAuth flow
    window.location.href = `/api/meta/auth?org=${user.organizationId}`;
  };
  
  const handleDisconnect = async () => {
    try {
      await disconnectMeta();
      toast.success("Disconnected from Meta");
      setSelectedPages([]);
    } catch {
      toast.error("Failed to disconnect");
    }
  };
  
  const handleContinue = async () => {
    // Connection successful, advance to step 3 (already updated by connectMetaAccount)
    router.push("/onboarding/invite-team");
  };
  
  const handleSkip = async () => {
    // Skip Meta connection and advance to step 3
    try {
      await skipOnboardingStep({ currentStep: 2 });
      router.push("/onboarding/invite-team");
    } catch (error) {
      console.error("Failed to skip step:", error);
      toast.error("Failed to skip step");
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Meta Connection Status</h3>
          {connectionStatus?.isConnected && (
            <Chip
              color="success"
              variant="flat"
              startContent={<CheckCircle className="w-4 h-4" />}
            >
              Connected
            </Chip>
          )}
        </div>
        
        {connectionStatus?.isConnected ? (
          <div className="space-y-4">
            {/* Connected Page Info */}
            <div className="flex items-center space-x-3 p-3 bg-default-50 rounded-lg">
              <Avatar
                icon={<Facebook className="w-5 h-5" />}
                className="bg-primary"
              />
              <div className="flex-1">
                <p className="font-medium">{connectionStatus.pageName}</p>
                <p className="text-sm text-default-500">
                  Page ID: {connectionStatus.pageId}
                </p>
              </div>
            </div>
            
            {/* Connection Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-default-500">Last Synced</p>
                <p className="font-medium">
                  {connectionStatus.lastSyncedAt
                    ? new Date(connectionStatus.lastSyncedAt).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-default-500">Lead Count</p>
                <p className="font-medium">{connectionStatus.leadCount || 0}</p>
              </div>
              <div>
                <p className="text-default-500">Sync Status</p>
                <p className="font-medium capitalize">
                  {connectionStatus.syncStatus || "Idle"}
                </p>
              </div>
              <div>
                <p className="text-default-500">Token Expires</p>
                <p className="font-medium">
                  {connectionStatus.tokenExpiresAt
                    ? new Date(connectionStatus.tokenExpiresAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                color="danger"
                variant="flat"
                onPress={handleDisconnect}
              >
                Disconnect
              </Button>
              <Button
                color="primary"
                onPress={handleContinue}
              >
                Continue Setup
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-default-600">
              Connect your Facebook page to start receiving leads directly in LeadNova.
            </p>
            
            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Real-time lead capture from Facebook forms</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Automatic historical lead import (last 30 days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm">Secure token encryption</span>
              </div>
            </div>
            
            {/* Connect Button */}
            <Button
              color="primary"
              className="w-full"
              size="lg"
              startContent={
                isConnecting ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <Facebook className="w-5 h-5" />
                )
              }
              onPress={handleConnect}
              isDisabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect with Meta"}
            </Button>
            
            {/* Skip Option */}
            <div className="text-center">
              <Button
                variant="light"
                size="sm"
                onPress={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Selected Pages (if multiple) */}
      {selectedPages.length > 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Pages</h3>
          <div className="space-y-2">
            {selectedPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    icon={<Facebook className="w-4 h-4" />}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{page.name}</p>
                    <p className="text-xs text-default-500">ID: {page.id}</p>
                  </div>
                </div>
                {page.selected && (
                  <Chip size="sm" color="primary" variant="flat">
                    Active
                  </Chip>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-warning-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
              <p className="text-sm text-warning-700">
                Currently, only one page can be connected at a time. 
                Multi-page support coming soon!
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Sync Status (if syncing) */}
      {connectionStatus?.syncStatus === "syncing" && (
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <RefreshCcw className="w-5 h-5 animate-spin text-primary" />
            <div>
              <p className="font-medium">Syncing historical leads...</p>
              <p className="text-sm text-default-500">
                This may take a few minutes. You can continue with the setup.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}