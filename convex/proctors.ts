import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const proctors = await ctx.db.query("proctors").collect();
    return await Promise.all(
      proctors.map(async (p) => {
        const dept = await ctx.db.get(p.departmentId);
        return { ...p, departmentName: dept?.name ?? "—" };
      })
    );
  },
});

export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("proctors")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("proctors", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("proctors"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    mobile: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    isActive: v.optional(v.boolean()),
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

export const remove = mutation({
  args: { id: v.id("proctors") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
