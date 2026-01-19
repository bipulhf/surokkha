"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveLocationMap } from "@/components/reports/live-location-map";

export default function CorrespondentReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const report = useQuery(api.reports.getById, id ? { id: id as Id<"reports"> } : "skip");
  const latest = useQuery(api.reportLocations.getLatest, id ? { reportId: id as Id<"reports"> } : "skip");
  const updateStatus = useMutation(api.reports.updateStatus);

  if (report === undefined) return <p className="p-4">লোড হচ্ছে...</p>;
  if (!report) return <p className="p-4">রিপোর্ট খুঁজে পাওয়া যাচ্ছে না।</p>;

  const typeLabel = report.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা";

  async function setStatus(s: "pending" | "acknowledged" | "resolved") {
    await updateStatus({ id: report!._id, status: s });
  }

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${base}/report/${report.publicToken}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>পিছনে</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{typeLabel}</CardTitle>
            <Badge variant={report.status === "resolved" ? "default" : "secondary"}>{report.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{report.description}</p>
          {report.photoPath && (
            <img src={`/api/files/${report.photoPath}`} alt="রিপোর্ট" className="max-h-48 rounded object-cover" />
          )}
          {report.audioPath && (
            <audio controls src={`/api/files/${report.audioPath}`} className="w-full" />
          )}
          <p className="text-sm text-muted-foreground">শেয়ার লিংক: <a href={shareUrl} className="underline" target="_blank" rel="noreferrer">{shareUrl}</a></p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setStatus("acknowledged")}>দেখা হয়েছে</Button>
            <Button size="sm" onClick={() => setStatus("resolved")}>সমাধান</Button>
          </div>
        </CardContent>
      </Card>
      {latest && (
        <Card>
          <CardHeader>
            <CardTitle>সর্বশেষ লোকেশন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded overflow-hidden">
              <LiveLocationMap lat={latest.latitude} lng={latest.longitude} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
