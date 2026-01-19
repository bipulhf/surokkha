"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CorrespondentPage() {
  const reports = useQuery(api.reports.list) ?? [];

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">রিপোর্টসমূহ</h1>
      <div className="space-y-2">
        {reports.map((r: { _id: Id<"reports"> }) => (
          <ReportCard key={r._id} reportId={r._id} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ reportId }: { reportId: Id<"reports"> }) {
  const report = useQuery(api.reports.getById, { id: reportId });
  const latest = useQuery(api.reportLocations.getLatest, { reportId });
  if (!report) return null;
  const typeLabel = report.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা";
  return (
    <Link href={`/correspondent/reports/${reportId}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{typeLabel}</CardTitle>
            <Badge variant={report.status === "resolved" ? "default" : report.status === "acknowledged" ? "secondary" : "outline"}>
              {report.status === "resolved" ? "সমাধান" : report.status === "acknowledged" ? "দেখা হয়েছে" : "পেন্ডিং"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {latest ? `সর্বশেষ লোকেশন: ${latest.latitude.toFixed(4)}, ${latest.longitude.toFixed(4)}` : "লোকেশন লোড হচ্ছে..."}
        </CardContent>
      </Card>
    </Link>
  );
}
