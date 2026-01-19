import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const createOrUpdateFromClerk = mutation({
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("correspondent"), v.literal("student")),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        isVerified: args.isVerified ?? existing.isVerified,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      role: args.role,
      isVerified: args.isVerified ?? false,
      createdAt: now,
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const setVerified = mutation({
  args: { userId: v.id("users"), isVerified: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isVerified: args.isVerified });
  },
});

export const syncFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("correspondent"), v.literal("student")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      role: args.role,
      isVerified: false,
      createdAt: now,
    });
  },
});
