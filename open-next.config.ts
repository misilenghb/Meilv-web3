import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // 配置缓存策略
  cache: {
    // 静态资源缓存
    static: {
      maxAge: 31536000, // 1年
    },
    // API路由缓存
    api: {
      maxAge: 0, // 不缓存API响应
    },
  },
  
  // 配置环境变量
  env: {
    // 这些环境变量将在构建时注入
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // 配置路由
  routes: {
    // 确保API路由正确处理
    api: "/api/*",
    // 静态文件路由
    static: "/_next/static/*",
  },
});
