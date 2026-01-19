"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioRecorder } from "@/components/reports/audio-recorder";
import {
  Map,
  MapMarker,
  MapControls,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Mic,
  Share2,
  ShieldAlert,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";

async function uploadFile(
  file: File | Blob,
  type: "photos" | "audio"
): Promise<string> {
  const f =
    file instanceof File
      ? file
      : new File([file], type === "photos" ? "report.jpg" : "audio.webm", {
          type: (file as Blob).type,
        });
  const fd = new FormData();
  fd.set("file", f);
  fd.set("type", type);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  if (!r.ok) throw new Error("Upload failed");
  const j = await r.json();
  return j.path;
}

export default function StudentReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const student = useQuery(
    api.students.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const report = useQuery(
    api.reports.getByIdAsReporter,
    id && student?._id
      ? { id: id as Id<"reports">, reporterId: student._id }
      : "skip"
  );
  const latest = useQuery(
    api.reportLocations.getLatest,
    report?._id ? { reportId: report._id } : "skip"
  );

  const updateLocationMutation = useMutation(
    api.reportLocations.updateLocation
  );
  const updateAudioMutation = useMutation(api.reports.updateAudio);

  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [lastSharedAt, setLastSharedAt] = useState<number | null>(null);
  const [sharingActive, setSharingActive] = useState(true);
  const [gpsCenter, setGpsCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [postReportAudioPath, setPostReportAudioPath] = useState<string | null>(
    null
  );
  const [postReportAudioSaving, setPostReportAudioSaving] = useState(false);
  const [postReportAudioError, setPostReportAudioError] = useState<
    string | null
  >(null);

  const latestPosRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setGpsCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!report?._id || !sharingActive || !("geolocation" in navigator)) return;
    const provided = latest
      ? { lat: latest.latitude, lng: latest.longitude }
      : null;
    const initial = provided ?? gpsCenter ?? { lat: 23.8103, lng: 90.4125 };
    latestPosRef.current = initial;
    setLiveLocation(initial);

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        latestPosRef.current = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        };
      },
      () => {},
      { enableHighAccuracy: true }
    );

    const intervalId = setInterval(async () => {
      const pos = latestPosRef.current;
      if (!pos) return;
      try {
        await updateLocationMutation({
          reportId: report._id,
          latitude: pos.lat,
          longitude: pos.lng,
        });
        setLiveLocation(pos);
        setLastSharedAt(Date.now());
      } catch {
        // ignore
      }
    }, 10_000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [
    report?._id,
    sharingActive,
    latest?.latitude,
    latest?.longitude,
    updateLocationMutation,
  ]);

  // Sync displayed audio when report.audioPath changes (e.g. from another tab)
  useEffect(() => {
    if (report?.audioPath) setPostReportAudioPath(report.audioPath);
  }, [report?.audioPath]);

  if (student === undefined || report === undefined) {
    return (
      <p className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</p>
    );
  }
  if (!student || !report) {
    router.replace("/student");
    return null;
  }

  const typeLabel = report.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা";
  const provided = latest
    ? { lat: latest.latitude, lng: latest.longitude }
    : null;
  const center = liveLocation ??
    provided ??
    gpsCenter ?? { lat: 23.8103, lng: 90.4125 };
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/report/${report.publicToken}`
      : "";

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link
              href="/student"
              className="flex items-center hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 size-4" />
              ড্যাশবোর্ড
            </Link>
            <span>/</span>
            <span>বিস্তারিত</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-july text-xl sm:text-2xl font-bold tracking-tight">
              রিপোর্ট #{report._id.slice(-6)}
            </h1>
            <Badge
              variant={report.type === "ragging" ? "destructive" : "default"}
              className="uppercase tracking-wider font-semibold"
            >
              {report.type === "ragging" ? (
                <AlertTriangle className="mr-1.5 size-3" />
              ) : (
                <ShieldAlert className="mr-1.5 size-3" />
              )}
              {typeLabel}
            </Badge>
          </div>
        </div>
        {link && (
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={link} target="_blank" rel="noreferrer">
              <Share2 className="size-4" />
              শেয়ার লিংক
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left Column: Report Details */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/40 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-july flex items-center gap-2">
                  <ShieldAlert className="size-5 text-primary" />
                  ঘটনার বিবরণ
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-full border">
                  <Calendar className="size-3" />
                  {new Date(report._creationTime).toLocaleDateString()}
                  <span className="w-px h-3 bg-border mx-1" />
                  <Clock className="size-3" />
                  {new Date(report._creationTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {report.photoPath && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-4" />
                    সংযুক্ত ছবি
                  </p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={`/api/files/${report.photoPath}`}
                      alt="রিপোর্ট এর প্রমাণ"
                      className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Section - Mobile Optimized placement in flow */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-july text-base">
                <Mic className="size-5 text-primary" />
                অডিও রেকর্ড
              </CardTitle>
              <CardDescription>
                পরিস্থিতির অডিও রেকর্ড সংযুক্ত করুন। এটি প্রমাণ হিসেবে খুবই
                গুরুত্বপূর্ণ।
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postReportAudioError && (
                <p className="text-destructive text-sm mb-2 bg-destructive/10 p-2 rounded flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  {postReportAudioError}
                </p>
              )}
              {postReportAudioPath ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <audio
                    controls
                    src={`/api/files/${postReportAudioPath}`}
                    className="w-full h-10 accent-primary"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPostReportAudioPath(null)}
                      disabled={postReportAudioSaving}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      মুছে ফেলুন এবং নতুন রেকর্ড করুন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-muted/50 hover:border-primary/50">
                  <AudioRecorder
                    onRecordingComplete={async (blob) => {
                      if (!report._id) return;
                      setPostReportAudioError(null);
                      setPostReportAudioSaving(true);
                      try {
                        const path = await uploadFile(blob, "audio");
                        await updateAudioMutation({
                          id: report._id,
                          audioPath: path,
                        });
                        setPostReportAudioPath(path);
                      } catch (e) {
                        setPostReportAudioError(
                          e instanceof Error ? e.message : "অডিও সংরক্ষণ ব্যর্থ"
                        );
                      } finally {
                        setPostReportAudioSaving(false);
                      }
                    }}
                  />
                  {postReportAudioSaving && (
                    <p className="mt-2 animate-pulse text-sm text-primary font-medium">
                      সার্ভারে সংরক্ষণ করা হচ্ছে...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Location */}
        <div className="space-y-6 h-full">
          <Card className="h-full flex flex-col shadow-sm border-primary/20 bg-gradient-to-b from-background to-primary/5 hover:to-primary/10 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-july text-base">
                    <MapPin className="size-5 text-primary animate-pulse" />
                    লাইভ লোকেশন
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {sharingActive
                      ? "আপনার লোকেশন শেয়ারিং চালু আছে"
                      : "আপনার লোকেশন শেয়ারিং বন্ধ আছে"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {sharingActive && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {sharingActive && lastSharedAt != null && (
                  <Badge
                    variant="outline"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    <Clock className="mr-1 size-3" />
                    আপডেট: {Math.round((Date.now() - lastSharedAt) / 1000)}s আগে
                  </Badge>
                )}
                <Button
                  type="button"
                  variant={sharingActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setSharingActive((v) => !v)}
                  className="ml-auto"
                >
                  {sharingActive ? "শেয়ার বন্ধ করুন" : "চালু করুন"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] lg:min-h-[400px] p-0 overflow-hidden relative">
              <div className="absolute inset-0">
                <Map center={[center.lng, center.lat]} zoom={15} theme="light">
                  <MapMarker latitude={center.lat} longitude={center.lng}>
                    <MarkerContent>
                      <div className="relative">
                        <div className="size-4 rounded-full border-2 border-white bg-primary shadow-lg z-10 relative" />
                        <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                      </div>
                    </MarkerContent>
                    <MarkerPopup>
                      <div className="min-w-48 p-1">
                        <p className="font-semibold text-sm flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />
                          বর্তমান অবস্থান
                        </p>
                        <p className="text-muted-foreground text-xs font-mono mt-1 bg-muted p-1 rounded">
                          {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {sharingActive
                            ? "লাইভ ট্র্যাকিং সক্রিয়"
                            : "সর্বশেষ জানা অবস্থান"}
                        </p>
                      </div>
                    </MarkerPopup>
                  </MapMarker>
                  <MapControls position="bottom-right" showZoom showLocate />
                </Map>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
