const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const prefix = isProduction ? "https://chaospace.github.io/" : "";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
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
