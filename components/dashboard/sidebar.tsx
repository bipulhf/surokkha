"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar as UiSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  FilePlus,
  UserCog,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "ওভারভিউ", icon: LayoutDashboard },
  { href: "/admin/reports", label: "রিপোর্ট", icon: FileText },
  { href: "/admin/students", label: "ছাত্র", icon: Users },
  { href: "/admin/correspondents", label: "করেসপন্ডেন্ট", icon: UserCog },
  { href: "/admin/proctors", label: "প্রক্টর", icon: ShieldCheck },
  { href: "/admin/departments", label: "বিভাগ", icon: Building2 },
];

const correspondentNav = [
  { href: "/correspondent", label: "রিপোর্টসমূহ", icon: FileText },
];

const studentNav = [
  { href: "/student", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/student/report", label: "রিপোর্ট করুন", icon: FilePlus },
];

export function Sidebar({
  role,
}: {
  role: "admin" | "correspondent" | "student";
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const nav =
    role === "admin"
      ? adminNav
      : role === "correspondent"
        ? correspondentNav
        : studentNav;

  return (
    <UiSidebar variant="inset">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" asLink={false} />
          <span className="font-july text-xl font-bold tracking-tight text-primary">
            সুরক্ষা
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ href, label, icon: Icon }) => {
                const isExactOnly =
                  href === "/admin" ||
                  href === "/student" ||
                  href === "/correspondent";
                const isActive =
                  pathname === href ||
                  (!isExactOnly && pathname.startsWith(href + "/"));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className="gap-3 h-10 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium transition-all duration-200"
                    >
                      <Link
                        href={href}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </UiSidebar>
  );
}
