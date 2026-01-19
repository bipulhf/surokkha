import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByIdWithDepartment = query({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.id);
    if (!s) return null;
    const dept = await ctx.db.get(s.departmentId);
    return {
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      registrationNumber: s.registrationNumber,
      departmentName: dept?.name ?? "—",
    };
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
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
    registrationNumber: v.string(),
    departmentId: v.id("departments"),
    presentAddress: v.string(),
    selfiePhotoPath: v.string(),
    idCardPhotoPath: v.string(),
    isProfileComplete: v.boolean(),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("students", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("students"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    mobile: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    presentAddress: v.optional(v.string()),
    selfiePhotoPath: v.optional(v.string()),
    idCardPhotoPath: v.optional(v.string()),
    isProfileComplete: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
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
    return await ctx.db.query("students").collect();
  },
});

export const listPendingVerification = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("isVerified"), false))
      .collect();
  },
});
