"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/* eslint-disable @typescript-eslint/no-explicit-any */
const updateStatusAndNotifyRef = (api as any)["actions/reportStatusUpdate"]?.updateStatusAndNotify;

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "পেন্ডিং",
  acknowledged: "একনলেজড",
  resolved: "রিজলভড",
};

type Status = "pending" | "acknowledged" | "resolved";

type ReportRow = {
  _id: Id<"reports">;
  type: string;
  description: string;
  status: string;
  publicToken: string;
  createdAt: number;
  reporter: { name: string; email: string; mobile: string; registrationNumber: string; departmentName: string } | null;
};

export default function AdminReportsPage() {
  const reports = useQuery(api.reports.listWithReporter) ?? [];
  const [copiedId, setCopiedId] = useState<Id<"reports"> | null>(null);
  const [modalReport, setModalReport] = useState<ReportRow | null>(null);
  const [modalStatus, setModalStatus] = useState<Status>("pending");
  const [modalNote, setModalNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateErr, setUpdateErr] = useState<string | null>(null);

  const updateStatusAndNotify = useAction(updateStatusAndNotifyRef);

  useEffect(() => {
    if (modalReport) {
      setModalStatus(modalReport.status as Status);
      setModalNote("");
      setUpdateErr(null);
    }
  }, [modalReport]);

  async function copyLink(reportId: Id<"reports">, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(reportId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  async function handleUpdateStatus() {
    if (!modalReport) return;
    setUpdateErr(null);
    setUpdating(true);
    try {
      await updateStatusAndNotify({
        id: modalReport._id,
        status: modalStatus,
        statusNote: modalNote.trim() || undefined,
      });
      setModalReport(null);
    } catch (e) {
      setUpdateErr(e instanceof Error ? e.message : "স্ট্যাটাস আপডেট ব্যর্থ");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">সব রিপোর্ট</h1>
      <Card>
        <CardHeader>
          <CardTitle hidden>রিপোর্ট ও রিপোর্টার</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length === 0 && (
              <p className="text-muted-foreground py-6 text-center">কোনো রিপোর্ট নেই।</p>
            )}
            {reports.map((r: ReportRow) => {
              const href = `/report/${r.publicToken}`;
              return (
                <div
                  key={r._id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {r.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা"}
                      </span>
                      <Badge
                        variant={
                          r.status === "resolved"
                            ? "outline"
                            : r.status === "acknowledged"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {formatTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {r.description.length > 120
                        ? r.description.slice(0, 120) + "…"
                        : r.description}
                    </p>
                    {r.reporter && (
                      <div className="text-muted-foreground grid gap-0.5 text-sm sm:grid-cols-2">
                        <p>
                          <span className="text-foreground font-medium">{r.reporter.name}</span>
                          {" · "}
                          {r.reporter.registrationNumber}
                          {" · "}
                          {r.reporter.departmentName}
                        </p>
                        <p>
                          {r.reporter.email}
                          {" · "}
                          {r.reporter.mobile}
                        </p>
                      </div>
                    )}
                    {!r.reporter && (
                      <p className="text-muted-foreground text-sm">রিপোর্টার তথ্য নেই</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalReport(r)}
                    >
                      স্ট্যাটাস পরিবর্তন
                    </Button>
                    <Button asChild size="sm">
                      <a href={href} target="_blank" rel="noreferrer">
                        রিপোর্ট খুলুন
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyLink(
                          r._id,
                          (typeof window !== "undefined" ? window.location.origin : "") +
                            "/report/" +
                            r.publicToken
                        )
                      }
                    >
                      {copiedId === r._id ? "কপি হয়েছে" : "লিংক কপি"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={modalReport !== null} onOpenChange={(o) => !o && setModalReport(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>স্ট্যাটাস পরিবর্তন</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>স্ট্যাটাস</Label>
              <Select value={modalStatus} onValueChange={(v) => setModalStatus(v as Status)}>
                <SelectTrigger>
                  <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">পেন্ডিং</SelectItem>
                  <SelectItem value="acknowledged">একনলেজড</SelectItem>
                  <SelectItem value="resolved">রিজলভড</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>নোট (ঐচ্ছিক)</Label>
              <Textarea
                placeholder="রিপোর্টারকে ইমেইলে যাবে"
                rows={3}
                className="resize-none"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
              />
            </div>
            {updateErr && <p className="text-destructive text-sm">{updateErr}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "আপডেট হচ্ছে…" : "আপডেট"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}