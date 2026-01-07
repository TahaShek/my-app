import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure service worker is properly served
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
