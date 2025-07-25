import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing config
  allowedDevOrigins: ['*.lhr.life'],

  async headers() {
    return [
      {
        source: "/splash.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;