import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com", "images.spr.so", "res.cloudinary.com", "ethglobal.b-cdn.net", "assets.poap.xyz", "storage.googleapis.com",
      "gateway.pinata.cloud", "ipfs.io"
    ],
  },
};

export default nextConfig;
