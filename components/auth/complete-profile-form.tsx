"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Hash,
  MapPin,
  Building2,
  RefreshCw,
  X,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";

export function CompleteProfileForm() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress ?? ""
  );
  const [mobile, setMobile] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [departmentId, setDepartmentId] = useState<Id<"departments"> | "">("");
  const [presentAddress, setPresentAddress] = useState("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const existingStudent = useQuery(
    api.students.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const departments = useQuery(api.departments.list) ?? [];
  const deps = new Map(
    departments.map((d: { _id: Id<"departments">; name: string }) => [d._id, d])
  );
  const createStudent = useMutation(api.students.create);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play();
  }, [cameraOpen]);

  async function startSelfieCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ক্যামেরা খুলতে পারছি না";
      setCameraError(
        msg.includes("Permission") || msg.includes("denied")
          ? "ক্যামেরার অনুমতি দিন"
          : "ক্যামেরা সমর্থিত না বা অ্যাক্সেস করতে পারছি না। মোবাইল বা ওয়েবক্যাম ব্যবহার করুন।"
      );
    }
  }

  function closeSelfieCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraError(null);
  }

  function captureSelfie() {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the image if it's the front camera usually
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfiePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setSelfieFile(file);
        closeSelfieCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  function retakeSelfie() {
    setSelfiePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelfieFile(null);
  }

  if (convexUser === undefined || existingStudent === undefined) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="py-8 text-center text-muted-foreground animate-pulse">
          লোড হচ্ছে...
        </CardContent>
      </Card>
    );
  }

  if (!convexUser) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          ব্যবহারকারী খুঁজে পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।
        </CardContent>
      </Card>
    );
  }

  if (existingStudent?.isProfileComplete && existingStudent?.isVerified) {
    router.replace("/student");
    return null;
  }

  if (convexUser.role !== "student") {
    // router.replace("/"); // Careful redirecting without explaining
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          শুধুমাত্র ছাত্ররা এই পেজটি অ্যাক্সেস করতে পারে।
        </CardContent>
      </Card>
    );
  }

  if (
    existingStudent &&
    existingStudent.isProfileComplete &&
    !existingStudent.isVerified
  ) {
    return (
      <Card className="border-amber-500/50 bg-amber-500/5 shadow-md">
        <CardHeader>
          <CardTitle className="font-july text-xl text-amber-700 dark:text-amber-400">
            যাচাইকরণ প্রক্রিয়াধীন
          </CardTitle>
          <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
            আপনার প্রোফাইল ও যাচাইয়ের ছবি সফলভাবে জমা হয়েছে। এডমিন যাচাই
            সম্পন্ন করলে আপনি ড্যাশবোর্ড ও রিপোর্ট সেবা ব্যবহার করতে পারবেন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase">
                নাম
              </span>
              <p className="font-medium">{existingStudent.name}</p>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase">
                রেজি নম্বর
              </span>
              <p className="font-medium">
                {existingStudent.registrationNumber}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase">
                বিভাগ
              </span>
              <p className="font-medium">
                {(
                  deps.get(existingStudent.departmentId) as
                    | { name?: string }
                    | undefined
                )?.name ?? "—"}
              </p>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase">
                মোবাইল
              </span>
              <p className="font-medium">{existingStudent.mobile}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("type", "photos");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "আপলোড ব্যর্থ");
    }
    const { path } = (await res.json()) as { path: string };
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!departmentId) {
      setError("বিভাগ নির্বাচন করুন");
      return;
    }
    if (!selfieFile || !idCardFile) {
      setError("সেলফি এবং স্টুডেন্ট আইডি কার্ডের ছবি আপলোড করুন");
      return;
    }
    setSubmitting(true);
    try {
      const [selfiePhotoPath, idCardPhotoPath] = await Promise.all([
        uploadPhoto(selfieFile),
        uploadPhoto(idCardFile),
      ]);
      await createStudent({
        userId: convexUser!._id,
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        registrationNumber: registrationNumber.trim(),
        departmentId: departmentId as Id<"departments">,
        presentAddress: presentAddress.trim(),
        selfiePhotoPath,
        idCardPhotoPath,
        isProfileComplete: true,
        isVerified: false,
      });
      router.replace("/complete-profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ত্রুটি হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-lg border-muted/60">
      <CardHeader>
        <CardTitle className="font-july text-2xl">
          প্রোফাইল সম্পূর্ণ করুন
        </CardTitle>
        <CardDescription>
          যাচাইয়ের জন্য সঠিক তথ্য প্রদান করুন। এই তথ্যগুলো শুধুমাত্র প্রশাসনিক
          কাজের জন্য ব্যবহৃত হবে।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 space-y-1">
              <span className="text-sm font-semibold text-destructive flex items-center gap-2">
                <X className="size-4" />
                ত্রুটি হয়েছে
              </span>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" /> পুরো নাম
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="আপনার নাম লিখুন"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" /> ইমেইল
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" /> মোবাইল
                  নম্বর
                </Label>
                <Input
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg" className="flex items-center gap-2">
                  <Hash className="size-4 text-muted-foreground" /> রেজিস্ট্রেশন
                  নম্বর
                </Label>
                <Input
                  id="reg"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" /> বিভাগ
              </Label>
              <Select
                value={departmentId}
                onValueChange={(v) => setDepartmentId(v as Id<"departments">)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder="বিভাগ নির্বাচন করুন"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(
                    (d: {
                      _id: Id<"departments">;
                      name: string;
                      code: string;
                    }) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" /> বর্তমান
                ঠিকানা
              </Label>
              <Textarea
                id="address"
                value={presentAddress}
                onChange={(e) => setPresentAddress(e.target.value)}
                required
                placeholder="হলের নাম বা মেসের ঠিকানা..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid gap-6 pt-4 border-t">
            {/* Selfie Section */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <Camera className="size-4 text-primary" /> সেলফি যাচাইকরণ
                </Label>
                <p className="text-xs text-muted-foreground">
                  অবশ্যই লাইভ ক্যামেরা ব্যবহার করে সেলফি তুলতে হবে।
                </p>
              </div>

              {cameraError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
                  <X className="size-4" />
                  {cameraError}
                </div>
              )}

              {!selfieFile && !cameraOpen && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={startSelfieCamera}
                  className="w-full h-48 flex flex-col gap-4 border-dashed border-2 hover:bg-muted/50 transition-all hover:border-primary/50 group"
                >
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Camera className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    ক্যামেরা চালু করুন
                  </span>
                </Button>
              )}

              {cameraOpen && (
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl aspect-[3/4] ring-4 ring-offset-2 ring-primary/20">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  {/* Camera UI Overlay */}
                  <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center text-white">
                    <span className="text-xs font-medium tracking-wider uppercase opacity-80 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500 animate-pulse" />{" "}
                      Live Camera
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center gap-6">
                    <p className="text-white/80 text-xs text-center font-medium">
                      চেহারা পরিষ্কারভাবে ফ্রেমে রাখুন
                    </p>

                    <div className="flex items-center justify-between w-full max-w-xs px-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full size-10 text-white hover:bg-white/20 hover:text-white"
                        onClick={closeSelfieCamera}
                        title="বাতিল"
                      >
                        <X className="size-6" />
                      </Button>
                      <button
                        type="button"
                        className="group relative flex items-center justify-center"
                        onClick={captureSelfie}
                      >
                        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-20 group-hover:scale-125 transition-transform duration-300"></span>
                        <span className="relative inline-flex size-16 rounded-full border-4 border-white items-center justify-center">
                          <span className="size-14 rounded-full bg-white group-active:scale-90 transition-transform duration-100" />
                        </span>
                      </button>
                      <div className="size-10" /> {/* Spacer for centering */}
                    </div>
                  </div>
                </div>
              )}

              {selfiePreview && selfieFile && (
                <div className="relative rounded-xl overflow-hidden border aspect-[3/4] group ring-2 ring-primary/10 shadow-lg">
                  <img
                    src={selfiePreview}
                    alt="সেলফি প্রিভিউ"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 bg-backdrop-blur-sm flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-medium text-sm">
                      ছবিটি পরিবর্তন করতে চান?
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={retakeSelfie}
                      className="gap-2 shadow-lg"
                    >
                      <RefreshCw className="size-4" /> আবার তুলুন
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md border border-white/10">
                    সেলফি প্রিভিউ
                  </div>
                </div>
              )}
            </div>

            {/* ID Card Section */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <CreditCard className="size-4 text-primary" /> আইডি কার্ড
                </Label>
                <p className="text-xs text-muted-foreground">
                  স্টুডেন্ট আইডি কার্ডের পরিষ্কার ছবি আপলোড করুন।
                </p>
              </div>

              <div className="relative">
                {!idCardPreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        <span className="font-semibold">
                          ছবি আপলোড করতে ক্লিক করুন
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        JPG, PNG or WebP (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept={ACCEPT_IMAGES}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setIdCardPreview((prev) => {
                          if (prev) URL.revokeObjectURL(prev);
                          return f ? URL.createObjectURL(f) : null;
                        });
                        setIdCardFile(f);
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border aspect-video group shadow-md hover:shadow-lg transition-shadow">
                    <img
                      src={idCardPreview}
                      alt="আইডি কার্ড"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIdCardPreview(null);
                          setIdCardFile(null);
                        }}
                        className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                      >
                        <X className="size-4" /> মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {idCardFile && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                  <div className="p-2 bg-background rounded-md border shadow-sm">
                    <ImageIcon className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground/90">
                      {idCardFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(idCardFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="bg-green-500/10 text-green-600 p-1.5 rounded-full">
                    <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20"
            disabled={submitting || !selfieFile || !idCardFile}
          >
            {submitting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" /> সেভ হচ্ছে...
              </>
            ) : (
              "জমা দিন ও প্রোফাইল সম্পন্ন করুন"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
