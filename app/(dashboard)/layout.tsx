import { PermissionsGate } from "@/components/permissions/permissions-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionsGate>
      <DashboardShell>{children}</DashboardShell>
    </PermissionsGate>
  );
}
