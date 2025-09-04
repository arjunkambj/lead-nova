import { httpAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const clerkUserHandler = httpAction(async (ctx, request) => {
  "use node";
  const secret = process.env.CLERK_WEBSITE_SECRET ?? process.env.CLERK_WEBHOOK_SECRET;
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  console.log("[clerk:webhook] incoming", { svixId });
  const body = await request.text();

  if (!secret) {
    console.error("[clerk:webhook] missing secret env (CLERK_WEBSITE_SECRET/CLERK_WEBHOOK_SECRET)");
    return new Response("Missing webhook secret", { status: 500 });
  }
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  // Verify signature using Svix
  let payload: any;
  try {
    const svixModule: any = await import("svix");
    const WebhookCtor = svixModule?.Webhook ?? svixModule?.default?.Webhook;
    if (typeof WebhookCtor !== "function") {
      console.error("[clerk:webhook] svix import shape unexpected", Object.keys(svixModule || {}));
      throw new TypeError("Svix Webhook class not found");
    }
    const wh = new WebhookCtor(secret);
    payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
    console.log("[clerk:webhook] signature verified", { svixId, type: payload?.type });
  } catch (err) {
    console.error("[clerk:webhook] signature verify failed", { svixId, err });
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const type = payload.type as string;
    const data = payload.data as any;

    // Normalize minimal fields for internal mutation (omit null/undefined fields)
    // Prefer primary email when available
    const emails = Array.isArray(data.email_addresses) ? data.email_addresses : [];
    const primaryId = data.primary_email_address_id as string | undefined;
    const primaryEmail = primaryId
      ? emails.find((e: any) => e?.id === primaryId)?.email_address
      : emails[0]?.email_address;

    const normalized = {
      id: String(data.id),
      ...(data.first_name != null ? { firstName: String(data.first_name) } : {}),
      ...(data.last_name != null ? { lastName: String(data.last_name) } : {}),
      ...(data.image_url != null ? { imageUrl: String(data.image_url) } : {}),
      ...(data.profile_image_url != null ? { profileImageUrl: String(data.profile_image_url) } : {}),
      ...(primaryEmail ? { email: String(primaryEmail) } : {}),
      ...(data.first_name != null || data.last_name != null
        ? { fullName: [data.first_name, data.last_name].filter(Boolean).join(" ") }
        : {}),
    } as const;

    await ctx.runMutation(internal.webhook.clerk.handleClerkEvent, {
      type,
      data: normalized,
    });
    console.log("[clerk:webhook] dispatched to internal handler", { type, clerkId: normalized.id });
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("[clerk:webhook] handler error", err);
    return new Response("Handler error", { status: 500 });
  }
});

// Single internal mutation to handle Clerk user created/updated/deleted
export const handleClerkEvent = internalMutation({
  args: {
    type: v.string(),
    data: v.object({
      id: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      profileImageUrl: v.optional(v.string()),
      email: v.optional(v.string()),
      fullName: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { type, data }) => {
    console.log("[clerk:handle] event received", { type, clerkId: data.id });
    switch (type) {
      case "user.created":
      case "user.updated": {
        await upsertUserAndDefaultOrg(ctx, data);
        return null;
      }
      case "user.deleted": {
        await deleteUserAndMemberships(ctx, data.id);
        return null;
      }
      default: {
        console.log("[clerk:handle] ignoring unsupported event", { type });
        return null;
      }
    }
  },
});

async function upsertUserAndDefaultOrg(
  ctx: any,
  data: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    profileImageUrl?: string;
    email?: string;
    fullName?: string;
  }
) {
  const clerkId = data.id;
  const name = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || data.fullName || "";
  const imageUrl = data.profileImageUrl || data.imageUrl || "";
  const email = data.email ?? "";
  const fullName = data.fullName ?? name;
  const tokenIdentifier = `clerk|${clerkId}`;

  const existing = await ctx.db
    .query("users")
    .withIndex("ByClerkId", (q: any) => q.eq("clerkId", clerkId))
    .unique();
  const now = Date.now();

  let userId = existing?._id;
  if (!existing) {
    userId = await ctx.db.insert("users", {
      name,
      email,
      imageUrl,
      clerkId,
      fullName,
      tokenIdentifier,
    });

    const slug = makeSlug(fullName || name || `user-${clerkId.slice(-6)}`);
    const orgId = await ctx.db.insert("organizations", {
      name: fullName || name || "My Workspace",
      slug,
      imageUrl: imageUrl || undefined,
      ownerId: userId!,
      createdAt: now,
      updatedAt: now,
    });
    await ensureMembership(ctx, orgId, userId!, "owner");
    console.log("[clerk:handle] created user and default org", { clerkId, userId, orgId, slug });
    return;
  }

  await ctx.db.patch(existing._id, {
    name,
    email,
    imageUrl,
    fullName,
    tokenIdentifier,
  });
  console.log("[clerk:handle] updated user", { clerkId, userId: existing._id });
}

async function deleteUserAndMemberships(ctx: any, clerkId: string) {
  const existing = await ctx.db
    .query("users")
    .withIndex("ByClerkId", (q: any) => q.eq("clerkId", clerkId))
    .unique();
  if (!existing) return;

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("ByUser", (q: any) => q.eq("userId", existing._id))
    .collect();
  for (const m of memberships) {
    await ctx.db.delete(m._id);
  }
  await ctx.db.delete(existing._id);
  console.log("[clerk:handle] deleted user and memberships", { clerkId, removedMemberships: memberships.length });
}

function makeSlug(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `org-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureMembership(
  ctx: any,
  orgId: any,
  userId: any,
  role: "owner" | "admin" | "member"
) {
  const existing = await ctx.db
    .query("memberships")
    .withIndex("ByOrg", (q: any) => q.eq("orgId", orgId))
    .collect();
  const found = existing.find((m: any) => m.userId === userId);
  if (found) return;
  await ctx.db.insert("memberships", {
    orgId,
    userId,
    role,
    createdAt: Date.now(),
  });
}
