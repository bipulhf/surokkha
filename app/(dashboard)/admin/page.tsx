"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Map,
  MapClusterLayer,
  MapPopup,
  MapControls,
} from "@/components/ui/map";

const TYPE_COLORS = { ragging: "#dc2626", safety: "#2563eb" };
const STATUS_COLORS = { pending: "#f59e0b", acknowledged: "#3b82f6", resolved: "#22c55e" };

function getDateKey(ts: number) {
  return new Date(ts).toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
}

const DEFAULT_CENTER: [number, number] = [90.4125, 23.8103];

export default function AdminPage() {
  const data = useQuery(api.reports.listForDashboard) ?? [];
  const [gpsCenter, setGpsCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setGpsCenter([p.coords.longitude, p.coords.latitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const [clusterPopup, setClusterPopup] = useState<{
    lng: number;
    lat: number;
    type: string;
    description: string;
    publicToken: string;
  } | null>(null);

  const stats = useMemo(() => {
    const now = new Date().getTime();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return {
      total: data.length,
      pending: data.filter((r) => r.status === "pending").length,
      ragging: data.filter((r) => r.type === "ragging").length,
      safety: data.filter((r) => r.type === "safety").length,
      last7: data.filter((r) => r.createdAt >= weekAgo).length,
    };
  }, [data]);

  const chartByDate = useMemo(() => {
    const days = 14;
    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets: { date: string; র‍্যাগিং: number; নিরাপত্তা: number; মোট: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = now - (i + 1) * dayMs;
      const end = now - i * dayMs;
      const dayReports = data.filter((r) => r.createdAt >= start && r.createdAt < end);
      buckets.push({
        date: getDateKey(start + dayMs / 2),
        র‍্যাগিং: dayReports.filter((r) => r.type === "ragging").length,
        নিরাপত্তা: dayReports.filter((r) => r.type === "safety").length,
        মোট: dayReports.length,
      });
    }
    return buckets;
  }, [data]);

  const chartByType = useMemo(
    () => [
      { name: "র‍্যাগিং", value: stats.ragging, color: TYPE_COLORS.ragging },
      { name: "নিরাপত্তা", value: stats.safety, color: TYPE_COLORS.safety },
    ],
    [stats.ragging, stats.safety]
  );

  const chartByStatus = useMemo(
    () => [
      { name: "পেন্ডিং", value: data.filter((r) => r.status === "pending").length, color: STATUS_COLORS.pending },
      { name: "একনলেজড", value: data.filter((r) => r.status === "acknowledged").length, color: STATUS_COLORS.acknowledged },
      { name: "রিজলভড", value: data.filter((r) => r.status === "resolved").length, color: STATUS_COLORS.resolved },
    ],
    [data]
  );

  const geoJson = useMemo(() => {
    const features = data
      .filter((r): r is typeof r & { latitude: number; longitude: number } => r.latitude != null && r.longitude != null)
      .map((r) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [r.longitude, r.latitude] as [number, number] },
        properties: { id: r._id, type: r.type, description: r.description, publicToken: r.publicToken },
      }));
    return { type: "FeatureCollection" as const, features };
  }, [data]);

  const mapCenter: [number, number] = data.some((r) => r.latitude != null && r.longitude != null)
    ? (() => {
        const withLoc = data.filter((r) => r.latitude != null && r.longitude != null);
        const lng = withLoc.reduce((s, r) => s + r.longitude!, 0) / withLoc.length;
        const lat = withLoc.reduce((s, r) => s + r.latitude!, 0) / withLoc.length;
        return [lng, lat];
      })()
    : (gpsCenter ?? DEFAULT_CENTER);

  return (
    <div className="space-y-6">
      <h1 className="font-july text-2xl font-semibold">অ্যাডমিন ওভারভিউ</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">মোট রিপোর্ট</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">পেন্ডিং</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">র‍্যাগিং</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.ragging}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">নিরাপত্তা</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.safety}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">গত ৭ দিন</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.last7}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>রিপোর্ট (গত ১৪ দিন)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="র‍্যাগিং" stackId="a" fill={TYPE_COLORS.ragging} />
                  <Bar dataKey="নিরাপত্তা" stackId="a" fill={TYPE_COLORS.safety} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ধরন অনুযায়ী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={64}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => (value ? `${name}: ${value}` : null)}
                    >
                      {chartByType.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>স্ট্যাটাস অনুযায়ী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={64}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => (value ? `${name}: ${value}` : null)}
                    >
                      {chartByStatus.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map with clusters */}
      <Card>
        <CardHeader>
          <CardTitle>রিপোর্টের অবস্থান (র‍্যাগিং ও নিরাপত্তা)</CardTitle>
          <p className="text-muted-foreground text-sm">
            ক্লাস্টারে ক্লিক করে জুম ইন করুন; বিন্দুতে ক্লিক করে বিস্তারিত দেখুন।
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 overflow-hidden rounded-lg">
            <Map center={mapCenter} zoom={10} theme="light">
              <MapClusterLayer
                data={geoJson}
                clusterMaxZoom={14}
                clusterRadius={50}
                clusterColors={["#fecaca", "#fca5a5", "#dc2626"]}
                pointColor="#2563eb"
                onPointClick={(feature, coords) => {
                  const p = feature.properties as { type?: string; description?: string; publicToken?: string };
                  setClusterPopup({
                    lng: coords[0],
                    lat: coords[1],
                    type: p?.type ?? "—",
                    description: (p?.description ?? "").slice(0, 80) + ((p?.description?.length ?? 0) > 80 ? "…" : ""),
                    publicToken: p?.publicToken ?? "",
                  });
                }}
              />
              {clusterPopup && (
                <MapPopup
                  longitude={clusterPopup.lng}
                  latitude={clusterPopup.lat}
                  onClose={() => setClusterPopup(null)}
                  closeButton
                >
                  <div className="min-w-44 space-y-1 text-sm">
                    <p className="font-medium">{clusterPopup.type === "ragging" ? "র‍্যাগিং" : "নিরাপত্তা"}</p>
                    {clusterPopup.description && <p className="text-muted-foreground text-xs">{clusterPopup.description}</p>}
                    {clusterPopup.publicToken && (
                      <a
                        href={typeof window !== "undefined" ? `${window.location.origin}/report/${clusterPopup.publicToken}` : "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs underline"
                      >
                        রিপোর্ট খুলুন
                      </a>
                    )}
                  </div>
                </MapPopup>
              )}
              <MapControls position="bottom-right" showZoom showLocate />
            </Map>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link href="/admin/reports" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>রিপোর্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">সব রিপোর্ট ও লিংক দেখুন।</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/students" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>ছাত্র</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">ছাত্র তালিকা ও ভেরিফিকেশন ম্যানেজ করুন।</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/correspondents" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>করেসপন্ডেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">করেসপন্ডেন্ট অ্যাকাউন্ট ম্যানেজ করুন।</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/proctors" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>প্রক্টর</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">প্রক্টর তালিকা ও পরিচিতি ম্যানেজ করুন।</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/departments" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>বিভাগ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">বিভাগের তালিকা ম্যানেজ করুন।</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
