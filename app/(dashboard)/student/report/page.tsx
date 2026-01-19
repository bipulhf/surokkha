import type { Metadata } from "next";
import { ReportForm } from "@/components/reports/report-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "রিপোর্ট করুন",
  description: "র্যাগিং বা নিরাপত্তা সংক্রান্ত ঘটনা রিপোর্ট করুন।",
};

export default function StudentReportPage() {
  return (
    <div className="space-y-6">
      <Card className="border-l-brand-500 shadow-md bg-linear-to-br from-card to-brand-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <CardTitle className="font-july text-2xl font-bold">
                নতুন রিপোর্ট তৈরি করুন
              </CardTitle>
              <CardDescription className="text-base">
                জরুরি পরিস্থিতিতে দ্রুত রিপোর্ট পাঠান। জমা দিলে স্বয়ংক্রিয়ভাবে
                আপনার ছবি ও লোকেশন প্রক্টরদের কাছে পৌঁছে যাবে।
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ReportForm />
    </div>
  );
}
