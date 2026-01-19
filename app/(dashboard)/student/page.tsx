"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  Clock,
  User,
  Plus,
  MapPin,
  CalendarDays,
} from "lucide-react";

export default function StudentPage() {
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const student = useQuery(
    api.students.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const departments = useQuery(api.departments.list) ?? [];
  const deps = new Map(
    departments.map((d: { _id: string; name: string }) => [d._id, d])
  );
  const reports =
    useQuery(
      api.reports.listByReporter,
      student?._id ? { reporterId: student._id } : "skip"
    ) ?? [];

  const statusLabels: Record<string, string> = {
    pending: "পেন্ডিং",
    acknowledged: "একনলেজড",
    resolved: "রিজলভড",
  };

  const statusColors: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    pending: "secondary",
    acknowledged: "default",
    resolved: "outline",
  };

  if (student === undefined)
    return (
      <p className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</p>
    );
  if (!student) return null;

  const totalReports = reports.length;
  const pendingCount = reports.filter(
    (r: any) => r.status === "pending"
  ).length;
  const resolvedCount = reports.filter(
    (r: any) => r.status === "resolved"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-july text-3xl font-bold tracking-tight text-foreground">
            ড্যাশবোর্ড
          </h1>
          <p className="text-muted-foreground mt-1">স্বাগতম, {student.name}</p>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link href="/student/report">
            <Plus className="size-4" />
            নতুন রিপোর্ট
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট রিপোর্ট</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              আপনার জমা দেওয়া সকল রিপোর্ট
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">পেন্ডিং</CardTitle>
            <Clock className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              তদন্তের জন্য অপেক্ষমান
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সমধান হয়েছে</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">সম্পন্ন রিপোর্টসমূহ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-july text-xl">
                সাম্প্রতিক রিপোর্ট
              </CardTitle>
              <CardDescription>
                আপনার পাঠানো রিপোর্টের বর্তমান অবস্থা দেখুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                    <FileText className="size-10 mb-3 opacity-20" />
                    <p>কোনো রিপোর্ট পাওয়া যায়নি</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/student/report">প্রথম রিপোর্ট করুন</Link>
                    </Button>
                  </div>
                ) : (
                  reports.map(
                    (r: {
                      _id: string;
                      type: string;
                      description: string;
                      status: string;
                      _creationTime: number;
                    }) => (
                      <div
                        key={r._id}
                        className="group flex flex-col gap-4 rounded-xl border p-4 transition-all hover:bg-muted/50 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {r.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা"}
                            </span>
                            <Badge variant={statusColors[r.status] as any}>
                              {statusLabels[r.status] ?? r.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-lg">
                            {r.description}
                          </p>
                          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                            {/* Assuming creation time might be available or we just skip it if type issues */}
                            <span className="flex items-center gap-1">
                              ভলান্টিয়ার দ্বারা যাচাইকৃত
                            </span>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                        >
                          <Link href={`/student/report/${r._id}`}>
                            বিবরণ দেখুন
                          </Link>
                        </Button>
                      </div>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-july text-xl flex items-center gap-2">
                <User className="size-5" />
                প্রোফাইল
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {student.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">বিভাগ</span>
                  <span className="font-medium">
                    {
                      (
                        deps.get(student.departmentId) as
                          | { name?: string }
                          | undefined
                      )?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">রেজি নম্বর</span>
                  <span className="font-medium">
                    {student.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">মোবাইল</span>
                  <span className="font-medium">{student.mobile}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">স্ট্যাটাস</span>
                  <Badge variant={student.isVerified ? "default" : "secondary"}>
                    {student.isVerified ? "ভেরিফাইড" : "পেন্ডিং"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 bg-background rounded-full shrink-0">
                <MapPin className="size-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">জরুরি প্রয়োজনে</h4>
                <p className="text-xs text-muted-foreground">
                  যেকোনো জরুরি প্রয়োজনে প্রক্টর অফিসে যোগাযোগ করুন অথবা হটলাইন
                  নম্বরে কল করুন।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
