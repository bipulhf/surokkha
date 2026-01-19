import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateLocation = mutation({
  args: {
    reportId: v.id("reports"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reportLocations", {
      reportId: args.reportId,
      latitude: args.latitude,
      longitude: args.longitude,
      timestamp: Date.now(),
    });
  },
});

export const getLatest = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reportLocations")
      .withIndex("by_report_id", (q) => q.eq("reportId", args.reportId))
      .order("desc")
      .first();
  },
});

export const subscribe = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reportLocations")
      .withIndex("by_report_id", (q) => q.eq("reportId", args.reportId))
      .order("desc")
      .take(1);
  },
});
