/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure server components can handle external packages if needed
  serverExternalPackages: ["@mysten-incubation/memwal"],
};

export default nextConfig;
