import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "img.logo.dev" },
      { protocol: "https", hostname: "**.googleapis.com" },
    ],
  },
  serverExternalPackages: ["pdf-parse", "mammoth", "docx", "pdfkit"],
};

export default nextConfig;
