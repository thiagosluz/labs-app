import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-tabs',
    '@radix-ui/react-dialog',
    '@radix-ui/react-primitive',
    '@radix-ui/react-portal',
    '@radix-ui/react-presence',
    '@radix-ui/react-dismissable-layer',
    '@radix-ui/react-focus-scope',
    '@radix-ui/react-focus-guards',
  ],
};

export default nextConfig;
