"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  hasAllPermissionsGranted,
  setPermissionsGranted,
  requestLocation,
  requestCamera,
  requestMicrophone,
} from "@/lib/permissions";

type Step = "intro" | "location" | "camera" | "microphone" | "done" | "blocked";

export function PermissionModal({
  open,
  onComplete,
  onBlocked,
}: {
  open: boolean;
  onComplete: () => void;
  onBlocked?: () => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doRequestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ok = await requestLocation();
    setLoading(false);
    if (ok) setStep("camera");
    else {
      setError("লোকেশন অনুমতি প্রয়োজন। ব্রাউজার সেটিংস থেকে চালু করুন।");
      setStep("blocked");
      onBlocked?.();
    }
  }, [onBlocked]);

  const doRequestCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ok = await requestCamera();
    setLoading(false);
    if (ok) setStep("microphone");
    else {
      setError("ক্যামেরা অনুমতি প্রয়োজন। ব্রাউজার সেটিংস থেকে চালু করুন।");
      setStep("blocked");
      onBlocked?.();
    }
  }, [onBlocked]);

  const doRequestMicrophone = useCallback(async () => {
    setLoading(true);
    setError(null);
    const ok = await requestMicrophone();
    setLoading(false);
    if (ok) {
      setPermissionsGranted();
      setStep("done");
      onComplete();
    } else {
      setError("মাইক্রোফোন অনুমতি প্রয়োজন। ব্রাউজার সেটিংস থেকে চালু করুন।");
      setStep("blocked");
      onBlocked?.();
    }
  }, [onComplete, onBlocked]);

  if (!open) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="font-july">
        <AlertDialogHeader>
          <Image src="/images/logo.png" alt="" width={40} height={40} className="mx-auto mb-1 object-contain" />
          <AlertDialogTitle>অনুমতি প্রয়োজন</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left">
              {step === "intro" && (
                <p>
                  ইন্সিডেন্ট রিপোর্ট ও লাইভ লোকেশন শেয়ার করতে লোকেশন, ক্যামেরা ও মাইক্রোফোন অনুমতি
                  দিন। চালিয়ে যেতে হবে।
                </p>
              )}
              {step === "location" && (
                <p>রিপোর্টে আপনার বর্তমান অবস্থান যুক্ত করতে লোকেশন এক্সেস দিন।</p>
              )}
              {step === "camera" && (
                <p>রিপোর্টের সাথে ছবি যোগ করতে ক্যামেরা এক্সেস দিন।</p>
              )}
              {step === "microphone" && (
                <p>রিপোর্টের সাথে অডিও রেকর্ড করতে মাইক্রোফোন এক্সেস দিন।</p>
              )}
              {step === "done" && <p>সব অনুমতি দেওয়া হয়েছে। ধন্যবাদ।</p>}
              {step === "blocked" && error && <p className="text-destructive">{error}</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {step === "intro" && (
            <Button onClick={() => setStep("location")}>শুরু করুন</Button>
          )}
          {step === "location" && (
            <Button onClick={doRequestLocation} disabled={loading}>
              {loading ? "অনুরোধ করা হচ্ছে..." : "লোকেশন অনুমতি দিন"}
            </Button>
          )}
          {step === "camera" && (
            <Button onClick={doRequestCamera} disabled={loading}>
              {loading ? "অনুরোধ করা হচ্ছে..." : "ক্যামেরা অনুমতি দিন"}
            </Button>
          )}
          {step === "microphone" && (
            <Button onClick={doRequestMicrophone} disabled={loading}>
              {loading ? "অনুরোধ করা হচ্ছে..." : "মাইক্রোফোন অনুমতি দিন"}
            </Button>
          )}
          {step === "blocked" && (
            <Button
              variant="outline"
              onClick={() => {
                setStep("intro");
                setError(null);
              }}
            >
              আবার চেষ্টা করুন
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
