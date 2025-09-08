import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages用のベースパス設定（リポジトリ名に合わせて変更）
  basePath: process.env.NODE_ENV === 'production' ? '/Omutsu-Navi' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Omutsu-Navi/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
