"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inviteRef = (api as any)["actions/correspondentsInvite"].invite;

export default function AdminCorrespondentsPage() {
  const correspondents = useQuery(api.correspondents.list) ?? [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const invite = useAction(inviteRef);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await invite({ name, email, mobile });
      setName("");
      setEmail("");
      setMobile("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "ত্রুটি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">করেসপন্ডেন্ট</h1>

      <Card>
        <CardHeader>
          <CardTitle>নতুন করেসপন্ডেন্ট</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-2">
            {err && <p className="col-span-full text-destructive">{err}</p>}
            <div>
              <Label>নাম</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>মোবাইল</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || !name || !email || !mobile}>
                {loading ? "তৈরি হচ্ছে..." : "ইনভাইট করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {correspondents.map((c: { _id: string; name: string; email: string; mobile: string }) => (
              <div key={c._id} className="flex justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.email} · {c.mobile}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
