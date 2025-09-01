/**
 * Cloudflare Workers 边缘运行时专用的 Supabase 配置
 * 优化了在 Workers 环境中的性能和兼容性
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 环境变量类型
interface EdgeEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// 全局 Supabase 客户端缓存
let cachedSupabaseClient: SupabaseClient | null = null;
let cachedSupabaseAdmin: SupabaseClient | null = null;

/**
 * 获取环境变量（边缘运行时兼容）
 */
function getEdgeEnvVar(key: keyof EdgeEnv, defaultValue?: string): string {
  // 在 Cloudflare Workers 中，环境变量通过 env 对象传递
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

/**
 * 创建客户端 Supabase 实例（用于前端）
 */
export function createSupabaseClient(): SupabaseClient {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const supabaseUrl = getEdgeEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEdgeEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration for client');
  }

  cachedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Workers 中不持久化会话
      autoRefreshToken: false, // 禁用自动刷新
    },
    global: {
      headers: {
        'User-Agent': 'meilv-web-cloudflare-workers',
      },
    },
  });

  return cachedSupabaseClient;
}

/**
 * 创建管理员 Supabase 实例（用于API路由）
 */
export function createSupabaseAdmin(): SupabaseClient {
  if (cachedSupabaseAdmin) {
    return cachedSupabaseAdmin;
  }

  const supabaseUrl = getEdgeEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceKey = getEdgeEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for admin');
  }

  cachedSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false, // Workers 中不持久化会话
      autoRefreshToken: false, // 禁用自动刷新
    },
    global: {
      headers: {
        'User-Agent': 'meilv-web-cloudflare-workers-admin',
      },
    },
  });

  return cachedSupabaseAdmin;
}

/**
 * 验证 Supabase 配置
 */
export function validateSupabaseConfig(): boolean {
  try {
    const supabaseUrl = getEdgeEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getEdgeEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabaseServiceKey = getEdgeEnvVar('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.error('Invalid NEXT_PUBLIC_SUPABASE_URL');
      return false;
    }

    if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
      console.error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return false;
    }

    if (!supabaseServiceKey) {
      console.warn('Missing SUPABASE_SERVICE_ROLE_KEY');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating Supabase config:', error);
    return false;
  }
}

/**
 * 数据库表名常量
 */
export const EDGE_TABLES = {
  USERS: 'users',
  GUIDES: 'guides',
  GUIDE_APPLICATIONS: 'guide_applications',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  COMPLAINTS: 'complaints',
  USER_FAVORITES: 'user_favorites',
} as const;

/**
 * 边缘运行时优化的数据库操作辅助类
 */
export class EdgeSupabaseHelper {
  private static getClient() {
    return createSupabaseAdmin();
  }

  /**
   * 通用查询方法
   */
  static async query<T = any>(
    table: string,
    options: {
      select?: string;
      eq?: [string, any];
      in?: [string, any[]];
      order?: [string, { ascending: boolean }];
      limit?: number;
      single?: boolean;
    } = {}
  ): Promise<{ data: T | T[] | null; error: any }> {
    try {
      const client = this.getClient();
      let query = client.from(table);

      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }

      if (options.eq) {
        query = query.eq(options.eq[0], options.eq[1]);
      }

      if (options.in) {
        query = query.in(options.in[0], options.in[1]);
      }

      if (options.order) {
        query = query.order(options.order[0], options.order[1]);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.single) {
        return await query.single();
      }

      return await query;
    } catch (error) {
      console.error(`Error querying ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * 通用插入方法
   */
  static async insert<T = any>(
    table: string,
    data: any | any[],
    options: { select?: string; single?: boolean } = {}
  ): Promise<{ data: T | T[] | null; error: any }> {
    try {
      const client = this.getClient();
      let query = client.from(table).insert(data);

      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }

      if (options.single) {
        return await query.single();
      }

      return await query;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * 通用更新方法
   */
  static async update<T = any>(
    table: string,
    updates: any,
    condition: [string, any],
    options: { select?: string; single?: boolean } = {}
  ): Promise<{ data: T | T[] | null; error: any }> {
    try {
      const client = this.getClient();
      let query = client
        .from(table)
        .update(updates)
        .eq(condition[0], condition[1]);

      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }

      if (options.single) {
        return await query.single();
      }

      return await query;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * 通用删除方法
   */
  static async delete(
    table: string,
    condition: [string, any]
  ): Promise<{ data: any; error: any }> {
    try {
      const client = this.getClient();
      return await client
        .from(table)
        .delete()
        .eq(condition[0], condition[1]);
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { data: null, error };
    }
  }
}

// 导出默认实例
export const supabaseEdgeClient = createSupabaseClient;
export const supabaseEdgeAdmin = createSupabaseAdmin;
