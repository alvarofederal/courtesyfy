import type { NextConfig } from "next";
import path from "path";

// Em git worktree, node_modules fica na raiz do projeto (3 níveis acima de .claude/worktrees/<name>)
const projectRoot = __dirname.includes(".claude") && __dirname.includes("worktrees")
  ? path.resolve(__dirname, "../../..")
  : __dirname

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  output: 'standalone',

  // jsPDF precisa rodar no servidor sem bundling do Next.js
  serverExternalPackages: ['jspdf', 'html2canvas'],

  turbopack: {
    root: projectRoot,
  },

  images: {
    unoptimized: false,
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
