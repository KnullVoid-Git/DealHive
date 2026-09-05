/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: 'http://localhost:5173',
        permanent: false,
      },
      {
        source: '/signup',
        destination: 'http://localhost:5173',
        permanent: false,
      },
      {
        source: '/demo',
        destination: 'http://localhost:5173',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
