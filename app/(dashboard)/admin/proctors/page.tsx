"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Proctor = {
  _id: Id<"proctors">;
  name: string;
  email: string;
  mobile: string;
  departmentId: Id<"departments">;
  departmentName: string;
  isActive: boolean;
};

export default function AdminProctorsPage() {
  const proctors = useQuery(api.proctors.list) ?? [];
  const departments = useQuery(api.departments.list) ?? [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const create = useMutation(api.proctors.create);
  const update = useMutation(api.proctors.update);
  const remove = useMutation(api.proctors.remove);

  const [editing, setEditing] = useState<Proctor | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setEditName(editing.name);
      setEditEmail(editing.email);
      setEditMobile(editing.mobile);
      setEditDepartmentId(editing.departmentId);
      setEditIsActive(editing.isActive);
    }
  }, [editing]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!departmentId) return;
    setLoading(true);
    try {
      await create({ name, email, mobile, departmentId: departmentId as Id<"departments"> });
      setName("");
      setEmail("");
      setMobile("");
      setDepartmentId("");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editDepartmentId) return;
    setEditLoading(true);
    try {
      await update({
        id: editing._id,
        name: editName,
        email: editEmail,
        mobile: editMobile,
        departmentId: editDepartmentId as Id<"departments">,
        isActive: editIsActive,
      });
      setEditing(null);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">প্রক্টর</h1>

      <Card>
        <CardHeader>
          <CardTitle>প্রক্টর যোগ করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <Label>বিভাগ</Label>
              <Select value={departmentId || undefined} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || !departmentId}>যোগ করুন</Button>
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
            {proctors.map((p: Proctor) => (
              <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.email} · {p.mobile} · {p.departmentName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove({ id: p._id })}>
                    মুছুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রক্টর সম্পাদনা</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 pt-4">
            <div>
              <Label>নাম</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>মোবাইল</Label>
              <Input value={editMobile} onChange={(e) => setEditMobile(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>বিভাগ</Label>
              <Select value={editDepartmentId || undefined} onValueChange={setEditDepartmentId}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>স্ট্যাটাস</Label>
              <Select value={editIsActive ? "true" : "false"} onValueChange={(v) => setEditIsActive(v === "true")}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">সক্রিয়</SelectItem>
                  <SelectItem value="false">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={editLoading || !editDepartmentId}>
                {editLoading ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
