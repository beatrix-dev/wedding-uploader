import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (process.env.AWS_CLOUDFRONT_DOMAIN) {
  remotePatterns.push({
    protocol: "https",
    hostname: process.env.AWS_CLOUDFRONT_DOMAIN,
    pathname: "/**",
  });
}

if (process.env.AWS_BUCKET_NAME && process.env.AWS_REGION) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
