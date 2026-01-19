"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportRouteMap } from "@/components/reports/report-route-map";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function PublicReportPage() {
  const params = useParams();
  const token = params.token as string;
  const report = useQuery(api.reports.getByToken, token ? { publicToken: token } : "skip");
  const latest = useQuery(
    api.reportLocations.getLatest,
    report?._id ? { reportId: report._id } : "skip"
  );
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [myLocationLoading, setMyLocationLoading] = useState(true);
  const [myLocationError, setMyLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => {
        setMyLocationError("অবস্থান সাপোর্ট করা হয় না");
        setMyLocationLoading(false);
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMyLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setMyLocationError(null);
        setMyLocationLoading(false);
      },
      () => {
        setMyLocationError("অবস্থান পায়নি");
        setMyLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function requestMyLocation() {
    setMyLocationLoading(true);
    setMyLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMyLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setMyLocationError(null);
        setMyLocationLoading(false);
      },
      () => {
        setMyLocationError("অবস্থান পায়নি");
        setMyLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }

  if (report === undefined) return <div className="flex min-h-[50vh] items-center justify-center p-4">লোড হচ্ছে...</div>;
  if (!report) return <div className="flex min-h-[50vh] items-center justify-center p-4">রিপোর্ট খুঁজে পাওয়া যাচ্ছে না।</div>;

  const typeLabel = report.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা";

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <h1 className="font-july text-2xl font-semibold">সুরক্ষা রিপোর্ট</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{typeLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{report.description}</p>
            {report.photoPath && (
              <img src={`/api/files/${report.photoPath}`} alt="রিপোর্ট" className="max-h-64 rounded object-cover" />
            )}
            {report.audioPath && (
              <audio controls src={`/api/files/${report.audioPath}`} className="w-full" />
            )}
          </CardContent>
        </Card>
        {latest && (
          <Card>
            <CardHeader>
              <CardTitle>রিপোর্ট ও আপনার অবস্থান</CardTitle>
              <p className="text-muted-foreground text-sm">
                {myLocationLoading && "আপনার অবস্থান যুক্ত করা হচ্ছে…"}
                {myLocationError && "আমার অবস্থান পায়নি—কেবল রিপোর্টের মানচিত্র।"}
                {myLocation && "আপনার ও রিপোর্টের মধ্যে পথ দেখানো হয়েছে।"}
              </p>
              {myLocationError && (
                <Button type="button" variant="outline" size="sm" onClick={requestMyLocation}>
                  আবার চেষ্টা করুন
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-72 overflow-hidden rounded-lg">
                <ReportRouteMap
                  reportLat={latest.latitude}
                  reportLng={latest.longitude}
                  myLat={myLocation?.lat}
                  myLng={myLocation?.lng}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
