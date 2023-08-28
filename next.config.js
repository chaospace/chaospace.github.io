const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    appDir: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "css")],
  },
};

module.exports = nextConfig;
