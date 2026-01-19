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

function withCountryCode88(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits.startsWith("88") ? digits : "88" + digits;
}

async function sendBulkSMS(messages: { number: string; text: string }[]) {
  const apiKey = process.env.ONECODESOFT_API_KEY;
  const senderId = process.env.ONECODESOFT_SENDER_ID;
  if (!apiKey || !senderId) {
    console.log("[SMS] Missing ONECODESOFT_API_KEY or ONECODESOFT_SENDER_ID");
    return;
  }
  if (messages.length === 0) {
    console.log("[SMS] No recipients to send to");
    return;
  }
  const MessageParameters = messages.map((m) => ({
    Number: withCountryCode88(m.number),
    Text: m.text,
  }));
  console.log(
    "[SMS] Sending to",
    messages.length,
    "recipients:",
    MessageParameters.map((p) => p.Number)
  );
  try {
    const res = await fetch("https://sms.onecodesoft.com/api/send-bulk-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, senderid: senderId, MessageParameters }),
    });
    const data = await res.text();
    console.log("[SMS] Response:", res.status, data);
  } catch (err) {
    console.error("[SMS] Failed to send:", err);
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) return;
  await transporter.sendMail({ from, to, subject, html });
}

export const submit = action({
  args: {
    reporterId: v.id("students"),
    type: v.union(v.literal("ragging"), v.literal("safety")),
    description: v.string(),
    photoPath: v.optional(v.string()),
    audioPath: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const { reportId, publicToken } = await ctx.runMutation(api.reports.create, {
      reporterId: args.reporterId,
      type: args.type,
      description: args.description,
      photoPath: args.photoPath,
      audioPath: args.audioPath,
      initialLatitude: args.latitude,
      initialLongitude: args.longitude,
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";
    const link = `${base}/report/${publicToken}`;

    const reporter = await ctx.runQuery(api.students.getByIdWithDepartment, {
      id: args.reporterId,
    });
    const name = reporter?.name ?? "—";
    const dept = reporter?.departmentName ?? "—";
    const regNo = reporter?.registrationNumber ?? "—";
    const mobile = reporter?.mobile ?? "—";

    const msg = `নাম: ${name}\nবিভাগ: ${dept}\nরেজি নম্বর: ${regNo}\nমোবাইল নম্বর: ${mobile}\nলিংক: ${link}`;
    const html = `<br><br>একটি নতুন রিপোর্ট হয়েছে।<br><br>নাম: ${name}<br>বিভাগ: ${dept}<br>রেজি নম্বর: ${regNo}<br>মোবাইল নম্বর: ${mobile}<br>লিংক: <a href="${link}">${link}</a>`;

    const proctors = await ctx.runQuery(api.proctors.listActive);
    console.log("[Report] Found", proctors.length, "active proctors");
    
    const withMobile = proctors.filter((p): p is typeof p & { mobile: string } => !!p.mobile);
    console.log("[Report] Proctors with mobile:", withMobile.length);
    
    if (withMobile.length > 0) {
      await sendBulkSMS(withMobile.map((p) => ({ number: p.mobile, text: msg })));
    }
    
    for (const p of proctors) {
      if (p.email) {
        try {
          await sendEmail(p.email, "সুরক্ষা - নতুন রিপোর্ট", html);
          console.log("[Email] Sent to", p.email);
        } catch (err) {
          console.error("[Email] Failed to send to", p.email, err);
        }
      }
    }

    return { reportId, publicToken };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;
