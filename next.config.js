/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  images: {
    // Cloudflare Workers 支持的图片域名
    domains: ['localhost', 'imagedelivery.net'],
    // 使用 Cloudflare Images 进行优化
    unoptimized: false,
    // 配置 Cloudflare Images
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-image-loader.js',
  },

  // 实验性功能配置
  experimental: {
    // 启用 Server Components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 重定向配置
  async redirects() {
    return [
      // 可以在这里添加重定向规则
    ];
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
