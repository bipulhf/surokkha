"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) return;
  await transporter.sendMail({ from, to, subject, html });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "পেন্ডিং",
  acknowledged: "একনলেজড",
  resolved: "রিজলভড",
};

const TYPE_LABELS: Record<string, string> = {
  ragging: "র‍্যাগিং",
  safety: "নিরাপত্তা",
};

export const updateStatusAndNotify = action({
  args: {
    id: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("acknowledged"), v.literal("resolved")),
    statusNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.runQuery(api.reports.getById, { id: args.id });
    if (!report) throw new Error("Report not found");

    const reporter = await ctx.runQuery(api.students.getByIdWithDepartment, {
      id: report.reporterId,
    });

    await ctx.runMutation(api.reports.updateStatus, {
      id: args.id,
      status: args.status,
      statusNote: args.statusNote,
    });

    if (reporter?.email) {
      const base = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";
      const link = `${base}/report/${report.publicToken}`;
      const statusLabel = STATUS_LABELS[args.status] ?? args.status;
      const typeLabel = TYPE_LABELS[report.type] ?? report.type;

      let html = `${reporter.name},<br><br>আপনার রিপোর্টের স্ট্যাটাস আপডেট করা হয়েছে।<br><br>টাইপ: ${typeLabel}<br>নতুন স্ট্যাটাস: ${statusLabel}<br>`;
      if (args.statusNote != null && String(args.statusNote).trim()) {
        html += `<br>অ্যাডমিনের মন্তব্য:<br>${String(args.statusNote).trim()}<br>`;
      }
      html += `<br>রিপোর্ট লিংক: <a href="${link}">${link}</a>`;

      try {
        await sendEmail(reporter.email, "সুরক্ষা রিপোর্ট - স্ট্যাটাস আপডেট", html);
        console.log("[ReportStatus] Email sent to", reporter.email);
      } catch (err) {
        console.error("[ReportStatus] Failed to send email:", err);
      }
    }

    return { ok: true };
  },
});
