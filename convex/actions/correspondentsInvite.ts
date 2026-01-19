"use node";

import crypto from "crypto";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import nodemailer from "nodemailer";

function generatePassword(length = 12): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(crypto.randomBytes(length), (b) => alphabet[b % alphabet.length]).join("");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM not configured");
  await transporter.sendMail({ from, to, subject, html });
}

export const invite = action({
  args: {
    name: v.string(),
    email: v.string(),
    mobile: v.string(),
  },
  handler: async (ctx, args) => {
    const password = generatePassword();
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret)
      throw new Error(
        "CLERK_SECRET_KEY not configured. Set it in Convex: npx convex env set CLERK_SECRET_KEY <your-key> (and in Production if you use it)."
      );

    const res = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [args.email],
        password,
        first_name: args.name,
        public_metadata: { role: "correspondent" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      let errMsg = `Clerk API: ${res.status} ${t}`;
      if (res.status === 422) {
        try {
          const j = JSON.parse(t) as { errors?: Array<{ code?: string; meta?: { param_name?: string } }> };
          const emailParamErr = j.errors?.some(
            (e) => e.code === "form_param_unknown" && e.meta?.param_name === "email_address"
          );
          if (emailParamErr) {
            errMsg +=
              ' Enable "Email address" in Clerk: Dashboard → User & Authentication → Email, phone, username.';
          }
        } catch {
          /* keep original errMsg */
        }
      }
      throw new Error(errMsg);
    }
    const data = (await res.json()) as { id: string };
    const clerkId = data.id;

    await ctx.runMutation(api.users.createOrUpdateFromClerk, {
      clerkId,
      role: "correspondent",
    });

    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId });
    if (!user) throw new Error("User not found after create");

    await ctx.runMutation(api.correspondents.create, {
      userId: user._id,
      name: args.name,
      email: args.email,
      mobile: args.mobile,
    });

    await sendEmail(
      args.email,
      "সুরক্ষা - করেসপন্ডেন্ট অ্যাকাউন্ট",
      `${args.name},<br><br>আপনার অ্যাকাউন্ট তৈরি হয়েছে।<br>ইমেইল: ${args.email}<br>পাসওয়ার্ড: ${password}<br><br>সাইন ইন: ${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/sign-in`
    );

    return { ok: true };
  },
});
