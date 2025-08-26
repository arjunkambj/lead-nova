"use node";

import crypto from "crypto";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Verify webhook signature from Meta
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret?: string
): boolean {
  try {
    const secret = appSecret || process.env.META_APP_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    
    return `sha256=${expectedSignature}` === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Internal action to verify webhook signature
 * This runs in Node.js environment
 */
export const verifyWebhookSignatureAction = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return verifyWebhookSignature(args.payload, args.signature);
  },
});

/**
 * Generate a random token for webhooks
 */
export function generateWebhookToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Internal action to generate webhook token
 */
export const generateWebhookTokenAction = internalAction({
  args: {},
  returns: v.string(),
  handler: async () => {
    return generateWebhookToken();
  },
});