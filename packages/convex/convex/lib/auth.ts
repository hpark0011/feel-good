import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth/client";

/**
 * Query builder that requires authentication.
 * ctx.user is the Better Auth user, guaranteed non-null.
 */
export const authQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    return { user };
  }),
);

/**
 * Mutation builder that requires authentication.
 * ctx.user is the Better Auth user, guaranteed non-null.
 */
export const authMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    return { user };
  }),
);
