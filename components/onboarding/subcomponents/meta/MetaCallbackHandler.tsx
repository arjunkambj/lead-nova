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
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  }

  return null;
}

function getErrorMessage(error: string): string {
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
}