import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "সুরক্ষা - SUST", template: "%s | সুরক্ষা - SUST" },
  description: "বিশ্ববিদ্যালয়ের র‍্যাগিং ও নিরাপত্তা সংক্রান্ত ঘটনায় ত্বরিৎ ব্যবস্থা। আপনার নিরাপত্তা, আমাদের অগ্রাধিকার।",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={dmSans.variable}>
      <body
        className={`${geistSans.variable} font-july ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
