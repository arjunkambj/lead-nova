import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Meta webhook verification endpoint
http.route({
  path: "/webhook/meta",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    
    console.log("Webhook verification request:", { mode, token, challenge });
    
    // Verify the webhook subscription
    if (mode === "subscribe" && challenge) {
      // Use environment variable for verify token
      const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "leadnova_webhook_verify_2024";
      
      if (token === verifyToken) {
        console.log("Webhook verified successfully");
        // Return the challenge to verify the webhook with Meta
        return new Response(challenge, { 
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      } else {
        console.error("Invalid verify token received:", token);
      }
    }
    
    return new Response("Forbidden", { status: 403 });
  }),
});

// Meta webhook event handler - Direct processing
http.route({
  path: "/webhook/meta",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Get the raw body for signature verification
      const body = await request.text();
      const signature = request.headers.get("x-hub-signature-256");
      
      // Parse the JSON body
      const payload = JSON.parse(body);
      
      console.log("Webhook event received:", {
        object: payload.object,
        entryCount: payload.entry?.length || 0,
      });
      
      // Verify signature if provided (optional but recommended)
      if (signature && process.env.META_APP_SECRET) {
        const isValid = await ctx.runAction(
          internal.helpers.crypto.verifyWebhookSignatureAction,
          {
            payload: body,
            signature: signature,
          }
        );
        
        if (!isValid) {
          console.error("Invalid webhook signature");
          // Still process in development, but log the issue
          if (process.env.NODE_ENV === "production") {
            return new Response("Unauthorized", { status: 401 });
          }
        }
      }
      
      // Process the webhook event
      await ctx.runMutation(internal.webhook.meta.processWebhook, {
        payload,
        signature: signature || undefined,
        rawBody: body,
      });
      
      // Always return 200 to acknowledge receipt
      // Meta will retry if we don't respond quickly
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      
      // Return 200 even on error to prevent Meta from retrying immediately
      // The error is logged and can be handled asynchronously
      return new Response("OK", { status: 200 });
    }
  }),
});

export default http;
