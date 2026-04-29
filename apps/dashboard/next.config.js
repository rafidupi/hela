/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@hela/contracts', '@hela/data-access'],
  experimental: {
    // Allows importing workspace packages without pre-build.
    externalDir: true,
  },
  webpack: (config) => {
    // Our workspace packages use ".js" import specifiers (required for
    // Node ESM runtime) but resolve to ".ts" sources. Tell webpack to try
    // TypeScript first before falling back to JS.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
