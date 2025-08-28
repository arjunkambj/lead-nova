"use client";

import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRef } from "react";

export default function MetaCallbackHandler() {
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const pageName = searchParams.get("page");

  // Process callback parameters only once
  if (!hasProcessed.current && (success || error)) {
    hasProcessed.current = true;

    if (success === "true") {
      toast.success(
        pageName
          ? `Successfully connected to ${pageName}`
          : "Successfully connected to Meta"
      );
    } else if (error) {
      const errorMessage = getErrorMessage(error, searchParams);
      toast.error(errorMessage);
    }
  }

  return null;
}

function getErrorMessage(error: string, searchParams: URLSearchParams): string {
  const devMode = searchParams.get("dev_mode") === "true";
  const details = searchParams.get("details");
  
  switch (error) {
    case "no_pages":
      if (devMode && details) {
        return details;
      }
      return devMode 
        ? "No Facebook pages found. In development mode, ensure you're added as a tester/developer and have admin access to a page."
        : "No Facebook pages found. Please ensure you have admin access to at least one page.";
    
    case "missing_permissions":
      const missingPerms = details || "required permissions";
      return `Missing permissions: ${missingPerms}. Please reconnect and grant all requested permissions.`;
    
    case "oauth_init_failed":
      return "Failed to start Meta connection. Please try again.";
    
    case "oauth_failed":
      return "Failed to connect to Meta. Please try again.";
    
    case "api_error":
      return details 
        ? `Meta API error: ${details}`
        : "Failed to fetch data from Meta. Please try again.";
    
    case "missing_parameters":
      return "Invalid request. Please try again.";
    
    case "auth_failed":
      return "Authentication failed. Please sign in and try again.";
    
    case "callback_failed":
      return details
        ? `Connection failed: ${details}`
        : "Connection failed. Please try again.";
    
    case "no_access_token":
      return "Failed to obtain access token from Meta. Please try again.";
    
    default:
      return details 
        ? `${error}: ${details}`
        : `Connection error: ${error}`;
  }
}