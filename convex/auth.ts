import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import {
  createOrganizationForUser,
  handleExistingUser,
  shouldCreateOrganization,
} from "./helpers/auth";
import { ResendOTP } from "./helpers/ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, ResendOTP],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      return await handleExistingUser(ctx, args.existingUserId, args.profile);
    },
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      if (await shouldCreateOrganization(ctx, userId)) {
        const user = await ctx.db.get(userId);
        if (user) {
          await createOrganizationForUser(ctx, userId, user);
        }
      }
    },
  },
});
