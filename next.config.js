/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Ensure env vars are available at runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Image optimization for Supabase Storage
  images: {
    domains: ['tciisbcovaipusfyofpt.supabase.co'],
  },

  // Exclude problematic files from webpack
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(sql|env\.local)$/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
