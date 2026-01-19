"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDepartmentsPage() {
  const departments = useQuery(api.departments.list) ?? [];
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.departments.create);
  const remove = useMutation(api.departments.remove);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await create({ name, code });
      setName("");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">বিভাগ</h1>

      <Card>
        <CardHeader>
          <CardTitle>বিভাগ যোগ করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <div>
              <Label>নাম</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>কোড</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>যোগ করুন</Button>
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
            {departments.map((d: { _id: Id<"departments">; name: string; code: string }) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">{d.name} ({d.code})</span>
                <Button size="sm" variant="destructive" onClick={() => remove({ id: d._id })}>
                  মুছুন
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
