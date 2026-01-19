import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("departments").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("departments", {
      name: args.name,
      code: args.code,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("departments"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    ) as { name?: string; code?: string };
    if (Object.keys(filtered).length === 0) return id;
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
