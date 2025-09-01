/**
 * Cloudflare Workers 边缘运行时配置
 * 确保API路由兼容Cloudflare Workers环境
 */

// 导出运行时配置
export const runtime = 'edge';

// Cloudflare Workers 环境变量类型
export interface CloudflareEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NODE_ENV: string;
}

// 获取环境变量的辅助函数
export function getEnvVar(key: keyof CloudflareEnv, defaultValue?: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

// 边缘运行时兼容的错误处理
export function createErrorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// 边缘运行时兼容的成功响应
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// 解析请求体的辅助函数
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const body: Record<string, string> = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value.toString();
      }
      return body;
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const body: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
      return body;
    }
    
    return {};
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {};
  }
}

// 设置Cookie的辅助函数（边缘运行时兼容）
export function setCookie(response: Response, name: string, value: string, options: {
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  maxAge?: number;
  secure?: boolean;
} = {}) {
  const {
    httpOnly = true,
    sameSite = 'lax',
    path = '/',
    maxAge = 7 * 24 * 60 * 60, // 7天
    secure = true
  } = options;

  let cookieString = `${name}=${value}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  
  if (httpOnly) {
    cookieString += '; HttpOnly';
  }
  
  if (secure) {
    cookieString += '; Secure';
  }

  response.headers.set('Set-Cookie', cookieString);
  return response;
}

// 获取Cookie的辅助函数
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  return cookie ? cookie.split('=')[1] : null;
}

// 验证会话的辅助函数
export function validateSession(request: Request): any | null {
  try {
    const sessionCookie = getCookie(request, 'ml_session');
    if (!sessionCookie) return null;

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie, 'base64').toString('utf8')
    );
    
    return sessionData;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}
