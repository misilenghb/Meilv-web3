/**
 * Cloudflare Workers 环境变量类型定义
 * 这个文件定义了在Cloudflare Workers中可用的环境变量
 */

interface CloudflareEnv {
  // Supabase 配置
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // 应用配置
  NODE_ENV: string;
  
  // Cloudflare 特定配置
  CLOUDFLARE_IMAGES_ACCOUNT_ID?: string;
  CLOUDFLARE_IMAGES_API_TOKEN?: string;
  
  // 其他可能的环境变量
  APP_URL?: string;
  WEBHOOK_SECRET?: string;
  
  // Cloudflare Workers 绑定
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

// 扩展全局类型
declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
}

export { CloudflareEnv };
