import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

const clerkWebhook = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }
  const raw = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };
  let evt: { type: string; data: { id?: string } };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(raw, headers) as { type: string; data: { id?: string } };
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const clerkId = evt.data?.id;
    if (!clerkId) return new Response("Bad payload", { status: 400 });
    const role = (evt.data as { public_metadata?: { role?: "admin" | "correspondent" | "student" } }).public_metadata?.role ?? "student";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.runMutation((internal as any).users.syncFromClerk, { clerkId, role });
  }
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
