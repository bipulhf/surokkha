import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

export const create = mutation({
  args: {
    reporterId: v.id("students"),
    type: v.union(v.literal("ragging"), v.literal("safety")),
    description: v.string(),
    photoPath: v.optional(v.string()),
    audioPath: v.optional(v.string()),
    initialLatitude: v.number(),
    initialLongitude: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const publicToken = nanoid(21);
    const reportId = await ctx.db.insert("reports", {
      reporterId: args.reporterId,
      type: args.type,
      description: args.description,
      photoPath: args.photoPath,
      audioPath: args.audioPath,
      status: "pending",
      publicToken,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("reportLocations", {
      reportId,
      latitude: args.initialLatitude,
      longitude: args.initialLongitude,
      timestamp: now,
    });
    return { reportId, publicToken };
  },
});

export const getByToken = query({
  args: { publicToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_public_token", (q) => q.eq("publicToken", args.publicToken))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdAsReporter = query({
  args: { id: v.id("reports"), reporterId: v.id("students") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report || report.reporterId !== args.reporterId) return null;
    return report;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const listWithReporter = query({
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").collect();
    return await Promise.all(
      reports.map(async (r) => {
        const student = await ctx.db.get(r.reporterId);
        const dept = student ? await ctx.db.get(student.departmentId) : null;
        return {
          ...r,
          reporter: student
            ? {
                name: student.name,
                email: student.email,
                mobile: student.mobile,
                registrationNumber: student.registrationNumber,
                departmentName: dept?.name ?? "—",
              }
            : null,
        };
      })
    );
  },
});

export const listForDashboard = query({
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").collect();
    return await Promise.all(
      reports.map(async (r) => {
        const loc = await ctx.db
          .query("reportLocations")
          .withIndex("by_report_id", (q) => q.eq("reportId", r._id))
          .order("desc")
          .first();
        return {
          _id: r._id,
          type: r.type,
          status: r.status,
          description: r.description,
          publicToken: r.publicToken,
          createdAt: r.createdAt,
          latitude: loc?.latitude ?? null,
          longitude: loc?.longitude ?? null,
        };
      })
    );
  },
});

export const listByReporter = query({
  args: { reporterId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", args.reporterId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("acknowledged"), v.literal("resolved")),
    statusNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: { status: "pending" | "acknowledged" | "resolved"; updatedAt: number; statusNote?: string } = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.statusNote != null && String(args.statusNote).trim()) {
      patch.statusNote = args.statusNote.trim();
    }
    await ctx.db.patch(args.id, patch);
  },
});

export const updateAudio = mutation({
  args: { id: v.id("reports"), audioPath: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { audioPath: args.audioPath, updatedAt: Date.now() });
  },
});
