const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const prefix = ""; //isProduction ? "/." : ".";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chaospace.github.io",
        port: "",
      },
    ],
  },
  experimental: {
    serverActions: false,
    appDir: true,
  },
  assetPrefix: prefix,
  sassOptions: {
    includePaths: [path.join(__dirname, "css")],
  },
};

module.exports = nextConfig;
