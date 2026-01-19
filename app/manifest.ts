import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "সুরক্ষা - শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST)",
    short_name: "সুরক্ষা",
    description:
      "বিশ্ববিদ্যালয়ের র্যাগিং ও নিরাপত্তা সংক্রান্ত ঘটনায় ত্বরিৎ ব্যবস্থা। আপনার নিরাপত্তা, আমাদের অগ্রাধিকার।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff3131",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "নতুন রিপোর্ট",
        short_name: "রিপোর্ট",
        url: "/go?to=/student/report",
        icons: [{ src: "/images/logo.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "ড্যাশবোর্ড",
        short_name: "ড্যাশবোর্ড",
        url: "/go?to=/student",
        icons: [{ src: "/images/logo.png", sizes: "96x96", type: "image/png" }],
      },
    ],
    categories: ["education", "utilities"],
  };
}
