"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "./audio-recorder";
import { Logo } from "@/components/logo";
import {
  Map,
  MapMarker,
  MapControls,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

/* eslint-disable @typescript-eslint/no-explicit-any */
const submitRef = (api as any)["actions/reportsSubmit"]?.submit as any;

export function ReportForm() {
  const { user } = useUser();
  const [type, setType] = useState<"ragging" | "safety">("safety");
  const [description, setDescription] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    reportId: Id<"reports">;
    publicToken: string;
    initialLat: number;
    initialLng: number;
  } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [lastSharedAt, setLastSharedAt] = useState<number | null>(null);
  const [sharingActive, setSharingActive] = useState(true);
  const [postReportAudioPath, setPostReportAudioPath] = useState<string | null>(
    null
  );
  const [postReportAudioSaving, setPostReportAudioSaving] = useState(false);
  const [postReportAudioError, setPostReportAudioError] = useState<
    string | null
  >(null);

  const submit = useAction(submitRef);
  const updateLocationMutation = useMutation(
    api.reportLocations.updateLocation
  );
  const updateAudioMutation = useMutation(api.reports.updateAudio);
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const student = useQuery(
    api.students.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("অবস্থান সাপোর্ট করা হয় না");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocationError(null);
        setLocationLoading(false);
      },
      () => {
        setLocationError("অবস্থান চালু করুন");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!location) return;
    setAddressLoading(true);
    setAddress(null);
    const t = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`,
        {
          headers: { "Accept-Language": "bn", "User-Agent": "SucsuReport/1.0" },
        }
      )
        .then((r) => r.json())
        .then((d) => setAddress(d?.display_name ?? "পাওয়া যায়নি"))
        .catch(() => setAddress("পাওয়া যায়নি"))
        .finally(() => setAddressLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [location]);

  const latestPosRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!done?.reportId || !sharingActive || !("geolocation" in navigator))
      return;
    latestPosRef.current = { lat: done.initialLat, lng: done.initialLng };
    setLiveLocation(latestPosRef.current);

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
          reportId: done.reportId,
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
    done?.reportId,
    done?.initialLat,
    done?.initialLng,
    sharingActive,
    updateLocationMutation,
  ]);

  function getPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { enableHighAccuracy: true }
      );
    });
  }

  function requestLocation() {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocationError(null);
        setLocationLoading(false);
      },
      () => {
        setLocationError("অবস্থান চালু করুন");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }

  async function capturePhotoFromCamera(): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      await new Promise((r) => setTimeout(r, 400));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        stream.getTracks().forEach((t) => t.stop());
        return null;
      }
      ctx.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
      });
    } catch {
      return null;
    }
  }

  async function uploadFile(
    file: File | Blob,
    type: "photos" | "audio"
  ): Promise<string> {
    const fd = new FormData();
    const f =
      file instanceof File
        ? file
        : new File([file], type === "photos" ? "report.jpg" : "audio.webm", {
            type: (file as Blob).type,
          });
    fd.set("file", f);
    fd.set("type", type);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error("Upload failed");
    const j = await r.json();
    return j.path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!student) {
      setError("প্রোফাইল খুঁজে পাওয়া যাচ্ছে না।");
      return;
    }
    setSubmitting(true);
    try {
      const { lat, lng } = location
        ? { lat: location.lat, lng: location.lng }
        : await getPosition();
      if (!location) setLocation({ lat, lng });

      const photoBlob = await capturePhotoFromCamera();
      const photoPath = photoBlob
        ? await uploadFile(
            new File([photoBlob], "report.jpg", { type: "image/jpeg" }),
            "photos"
          )
        : undefined;
      const audioPath = audioBlob
        ? await uploadFile(audioBlob, "audio")
        : undefined;
      const desc = description.trim() || "জরুরি রিপোর্ট";

      const out = await submit({
        reporterId: student._id,
        type,
        description: desc,
        photoPath,
        audioPath,
        latitude: lat,
        longitude: lng,
      });

      const { reportId, publicToken } = out as {
        reportId: Id<"reports">;
        publicToken: string;
      };
      setDone({ reportId, publicToken, initialLat: lat, initialLng: lng });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ত্রুটি");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/report/${done.publicToken}`
        : "";
    const center = liveLocation ?? {
      lat: done.initialLat,
      lng: done.initialLng,
    };
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Logo size="sm" asLink={false} />
              <CardTitle>রিপোর্ট তৈরি হয়েছে</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              প্রক্টরদের কাছে নোটিফিকেশন পাঠানো হয়েছে।
            </p>
            <p className="text-sm">
              শেয়ার লিংক:{" "}
              <a
                href={link}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {link}
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/student/report/${done.reportId}`}>
                  রিপোর্ট পেজে যান (লোকেশন ও অডিও)
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/student">ড্যাশবোর্ডে যান</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">অডিও যোগ করুন</CardTitle>
            <p className="text-muted-foreground text-sm">
              রিপোর্টে অডিও সংযুক্ত করুন। বাতিল করলে সংরক্ষণ হবে না। পেজ বন্ধ বা
              ট্যাব বদল করলে রেকর্ডিং স্বয়ংক্রিয় সংরক্ষণ হবে।
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {postReportAudioError && (
              <p className="text-destructive text-sm">{postReportAudioError}</p>
            )}
            {postReportAudioPath ? (
              <div className="space-y-2">
                <audio
                  controls
                  src={`/api/files/${postReportAudioPath}`}
                  className="w-full"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPostReportAudioPath(null)}
                  disabled={postReportAudioSaving}
                >
                  আরেকটি রেকর্ড করুন
                </Button>
              </div>
            ) : (
              <div>
                <AudioRecorder
                  onRecordingComplete={async (blob) => {
                    if (!done?.reportId) return;
                    setPostReportAudioError(null);
                    setPostReportAudioSaving(true);
                    try {
                      const path = await uploadFile(blob, "audio");
                      await updateAudioMutation({
                        id: done.reportId,
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
                  <p className="text-muted-foreground mt-1 text-sm">
                    সংরক্ষণ হচ্ছে…
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">লাইভ লোকেশন শেয়ার</CardTitle>
            <p className="text-muted-foreground text-sm">
              {sharingActive
                ? "যতক্ষণ শেয়ার চালু থাকবে, আপনার বর্তমান অবস্থান প্রতি ১০ সেকেন্ডে আপডেট হবে। বন্ধ করতে নিচের বাটনে চাপুন।"
                : "লোকেশন শেয়ার বন্ধ। আবার চালু করতে নিচের বাটনে চাপুন।"}
            </p>
            {sharingActive && lastSharedAt != null && (
              <p className="text-muted-foreground text-xs">
                শেষ আপডেট: {Math.round((Date.now() - lastSharedAt) / 1000)}{" "}
                সেকেন্ড আগে
              </p>
            )}
            <Button
              type="button"
              variant={sharingActive ? "outline" : "default"}
              size="sm"
              onClick={() => setSharingActive((v) => !v)}
            >
              {sharingActive ? "শেয়ার বন্ধ করুন" : "আবার চালু করুন"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-56 overflow-hidden rounded-lg">
              <Map center={[center.lng, center.lat]} zoom={15} theme="light">
                <MapMarker latitude={center.lat} longitude={center.lng}>
                  <MarkerContent>
                    <div className="size-4 rounded-full border-2 border-white bg-primary shadow" />
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="min-w-36 text-sm">
                      <p className="text-muted-foreground text-xs">
                        বর্তমান অবস্থান
                      </p>
                      <p>
                        {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                      </p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
                <MapControls position="bottom-right" showZoom />
              </Map>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map: your location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">আপনার অবস্থান</CardTitle>
        </CardHeader>
        <CardContent>
          {locationLoading ? (
            <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
              অবস্থান নেওয়া হচ্ছে...
            </div>
          ) : locationError || !location ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 text-center text-muted-foreground">
              <p>{locationError ?? "অবস্থান পায়নি"}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={requestLocation}
              >
                অবস্থান চালু করুন
              </Button>
            </div>
          ) : (
            <div className="h-48 overflow-hidden rounded-lg">
              <Map
                center={[location.lng, location.lat]}
                zoom={15}
                theme="light"
              >
                <MapMarker latitude={location.lat} longitude={location.lng}>
                  <MarkerContent>
                    <div className="size-4 rounded-full border-2 border-white bg-primary shadow" />
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="min-w-40 space-y-1 text-sm">
                      <p className="text-muted-foreground text-xs">স্থানাঙ্ক</p>
                      <p>
                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </p>
                      <p className="text-muted-foreground text-xs">ঠিকানা</p>
                      <p>{addressLoading ? "লোড হচ্ছে…" : (address ?? "—")}</p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
                <MapControls
                  position="bottom-right"
                  showZoom
                  showLocate
                  onLocate={(c) =>
                    setLocation({ lat: c.latitude, lng: c.longitude })
                  }
                />
              </Map>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">জরুরি রিপোর্ট</CardTitle>
          <p className="text-muted-foreground text-sm">
            এক ট্যাপে রিপোর্ট পাঠান। জমা দিলে অটো ছবি তোলা হবে।
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div>
              <p className="text-muted-foreground mb-1.5 text-sm">ধরন</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "safety" ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={() => setType("safety")}
                >
                  নিরাপত্তা
                </Button>
                <Button
                  type="button"
                  variant={type === "ragging" ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={() => setType("ragging")}
                >
                  র‍্যাগিং
                </Button>
              </div>
            </div>
            <div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="সংক্ষেপে লিখুন (ঐচ্ছিক)"
                className="h-10"
              />
            </div>
            {showAudio ? (
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  অডিও (ঐচ্ছিক)
                </p>
                <AudioRecorder onRecordingComplete={(b) => setAudioBlob(b)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    setShowAudio(false);
                    setAudioBlob(null);
                  }}
                >
                  অডিও বাতিল
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAudio(true)}
              >
                + অডিও যোগ করুন (ঐচ্ছিক)
              </Button>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "জমা হচ্ছে… (ছবি নেওয়া হচ্ছে)" : "রিপোর্ট পাঠান"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
