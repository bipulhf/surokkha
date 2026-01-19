"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminStudentsPage() {
  const students = useQuery(api.students.list) ?? [];
  const departments = useQuery(api.departments.list) ?? [];
  const setVerified = useMutation(api.students.update);
  const deps = new Map(departments.map((d: { _id: Id<"departments">; name: string; code: string }) => [d._id, d]));

  async function toggleVerified(id: Id<"students">, isVerified: boolean) {
    await setVerified({ id, isVerified });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-july text-2xl font-semibold">ছাত্র তালিকা</h1>
      <Card>
        <CardHeader>
          <CardTitle>সব ছাত্র</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((s: { _id: Id<"students">; name: string; email: string; registrationNumber: string; departmentId: Id<"departments">; isVerified: boolean; selfiePhotoPath?: string; idCardPhotoPath?: string }) => (
              <div
                key={s._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.email} · {s.registrationNumber} · {(deps.get(s.departmentId) as { name?: string } | undefined)?.name ?? ""}
                  </p>
                  {!s.isVerified && (s.selfiePhotoPath || s.idCardPhotoPath) && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {s.selfiePhotoPath && (
                        <a
                          href={`/api/files/${s.selfiePhotoPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 text-xs"
                        >
                          <img
                            src={`/api/files/${s.selfiePhotoPath}`}
                            alt="সেলফি"
                            className="h-14 w-14 rounded border object-cover"
                          />
                          <span>সেলফি</span>
                        </a>
                      )}
                      {s.idCardPhotoPath && (
                        <a
                          href={`/api/files/${s.idCardPhotoPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 text-xs"
                        >
                          <img
                            src={`/api/files/${s.idCardPhotoPath}`}
                            alt="আইডি কার্ড"
                            className="h-14 w-14 rounded border object-cover"
                          />
                          <span>আইডি কার্ড</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.isVerified ? "default" : "secondary"}>
                    {s.isVerified ? "ভেরিফাইড" : "পেন্ডিং"}
                  </Badge>
                  {!s.isVerified && (
                    <Button
                      size="sm"
                      onClick={() => toggleVerified(s._id, true)}
                    >
                      ভেরিফাই করুন
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
