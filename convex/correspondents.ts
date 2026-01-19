import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("correspondents")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("correspondents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("correspondents"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    mobile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(filtered).length === 0) return id;
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
    return id;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("correspondents").collect();
  },
});
