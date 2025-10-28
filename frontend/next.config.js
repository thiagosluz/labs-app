/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
