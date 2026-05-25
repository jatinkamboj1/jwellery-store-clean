/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: ""
          },
        ],
      },
      env: {
        SERVER_URL: process.env.SERVER_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        PLACEHOLDER_IMAGE: process.env.PLACEHOLDER_IMAGE,
      },
      compress: true,
};

export default nextConfig;
