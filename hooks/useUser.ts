"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  return useQuery(api.core.users.getCurrentUser);
}

export function useResetEverything() {
  return useMutation(api.core.users.resetEverything);
}
