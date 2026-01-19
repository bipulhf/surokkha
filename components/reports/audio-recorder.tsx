"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type AudioRecorderProps = {
  onRecordingComplete: (blob: Blob) => void;
  onCancel?: () => void;
};

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  useEffect(() => {
    const onHide = () => {
      if (
        document.visibilityState === "hidden" &&
        mediaRecorderRef.current?.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
    const onPageHide = () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
    const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    cancelledRef.current = false;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      if (cancelledRef.current) {
        onCancel?.();
        return;
      }
      if (chunksRef.current.length) {
        const blob = new Blob(chunksRef.current, { type: mime });
        onRecordingComplete(blob);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function cancelRecording() {
    cancelledRef.current = true;
    mediaRecorderRef.current?.stop();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isRecording ? (
        <Button type="button" variant="outline" onClick={startRecording}>
          রেকর্ড শুরু
        </Button>
      ) : (
        <>
          <Button type="button" variant="destructive" onClick={stopRecording}>
            সংরক্ষণ করুন
          </Button>
          <Button type="button" variant="outline" onClick={cancelRecording}>
            বাতিল
          </Button>
        </>
      )}
    </div>
  );
}
