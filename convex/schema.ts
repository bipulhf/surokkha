import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roles = ["admin", "correspondent", "student"] as const;
export const reportTypes = ["ragging", "safety"] as const;
export const reportStatuses = ["pending", "acknowledged", "resolved"] as const;

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("correspondent"), v.literal("student")),
    isVerified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]),

  students: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
    registrationNumber: v.string(),
    departmentId: v.id("departments"),
    presentAddress: v.string(),
    selfiePhotoPath: v.optional(v.string()),
    idCardPhotoPath: v.optional(v.string()),
    isProfileComplete: v.boolean(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  correspondents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"]),

  proctors: defineTable({
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
    departmentId: v.id("departments"),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  reports: defineTable({
    reporterId: v.id("students"),
    type: v.union(v.literal("ragging"), v.literal("safety")),
    description: v.string(),
    photoPath: v.optional(v.string()),
    audioPath: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("acknowledged"), v.literal("resolved")),
    statusNote: v.optional(v.string()),
    publicToken: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_public_token", ["publicToken"])
    .index("by_reporter", ["reporterId"])
    .index("by_status", ["status"]),

  reportLocations: defineTable({
    reportId: v.id("reports"),
    latitude: v.number(),
    longitude: v.number(),
    timestamp: v.number(),
  })
    .index("by_report_id", ["reportId"]),

  departments: defineTable({
    name: v.string(),
    code: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"]),
});
