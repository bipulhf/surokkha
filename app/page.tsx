"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ShieldAlert, MapPin, Bell } from "lucide-react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background relative overflow-hidden">
        {/* Loading Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 blur-[100px] rounded-full animate-pulse" />
        <Logo
          size="xl"
          asLink={false}
          className="relative z-10 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-brand-500/30 font-july relative overflow-hidden">
      {/* Background Gradients/Blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header/Nav (Minimal) */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          {/* Small Logo for Header if needed, but we focus on hero */}
        </div>
        <div className="flex gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/student"
                className="text-sm font-medium hover:text-brand-500 transition-colors"
              >
                ড্যাশবোর্ড
              </Link>
              <Link
                href="/student/report"
                className="text-sm font-medium hover:text-brand-500 transition-colors"
              >
                নতুন রিপোর্ট
              </Link>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium hover:text-brand-500 transition-colors"
            >
              লগ ইন
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 relative z-10 w-full max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Logo & Title */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-brand-orange opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity duration-500" />
            <Logo
              size="xl"
              asLink={false}
              className="relative z-10 drop-shadow-xl"
            />
          </div>

          <div className="space-y-4 max-w-2xl">
            <h1 className="font-july text-5xl md:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm">
              <span className="text-brand-500">সুরক্ষা</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST)
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
              বিশ্ববিদ্যালয়ের র‍্যাগিং ও নিরাপত্তা সংক্রান্ত ঘটনায়{" "}
              <span className="text-brand-500 font-bold">ত্বরিৎ ব্যবস্থা</span>।{" "}
              <br className="hidden md:block" />
              আপনার নিরাপত্তা, আমাদের অগ্রাধিকার।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            {isSignedIn ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-400 text-white border-0 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all rounded-full px-8 text-base font-july"
                >
                  <Link href="/student">ড্যাশবোর্ডে যান</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 hover:bg-muted/50 rounded-full px-8 text-base backdrop-blur-sm bg-background/50"
                >
                  <Link href="/student/report">নতুন রিপোর্ট</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-400 text-white border-0 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all rounded-full px-8 text-base font-july"
                >
                  <Link href="/sign-in">সাইন ইন (Sign In)</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 hover:bg-muted/50 rounded-full px-8 text-base backdrop-blur-sm bg-background/50"
                >
                  <Link href="/sign-up">নতুন একাউন্ট (Sign Up)</Link>
                </Button>
              </>
            )}
          </div>

          {/* Features Grid (Mini) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
            <FeatureCard
              icon={<ShieldAlert className="w-6 h-6 text-brand-500" />}
              title="গোপন রিপোর্ট"
              description="আপনার পরিচয় গোপন রেখে র‍্যাগিং বা অন্যায়ের প্রতিবাদ করুন।"
            />
            <FeatureCard
              icon={<MapPin className="w-6 h-6 text-brand-orange" />}
              title="লাইভ লোকেশন"
              description="বিপদে পড়লে তাৎক্ষণিক জিপিএস লোকেশন শেয়ার করুন।"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-brand-500" />}
              title="দ্রুত নোটিফিকেশন"
              description="প্রক্টর এবং প্রশাসনের কাছে পৌঁছে যাবে আপনার বার্তা।"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground relative z-10">
        <p>© {new Date().getFullYear()} সুরক্ষা (SUST). সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-md hover:bg-card/80 hover:border-brand-500/30 transition-all shadow-sm group">
      <div className="mb-3 p-2 bg-background/80 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
