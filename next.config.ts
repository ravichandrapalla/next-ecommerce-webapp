import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   staleTimes: {
  //     dynamic: 30,
  //     static: 180,
  //   },
  // },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "utfs.io", port: "" }],
  },
};

export default nextConfig;
