/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tinyride/types', '@tinyride/ui', '@tinyride/validation', '@tinyride/api-client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'orseixsidgyhqrkndxeb.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
