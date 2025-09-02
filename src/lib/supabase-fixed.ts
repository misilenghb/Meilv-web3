import { createClient } from "@supabase/supabase-js";

// 获取环境变量的辅助函数
function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

// Supabase 配置
const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

// 修复的客户端配置
const clientConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'User-Agent': 'meilv-web-client',
    },
  },
  // 添加fetch配置来解决网络问题
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// 修复的服务端配置
const adminConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'User-Agent': 'meilv-web-server',
    },
  },
  // 添加fetch配置
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// 创建客户端实例
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, clientConfig);

// 创建管理员实例
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  adminConfig
);

// 直接使用fetch的备用方案
export class SupabaseFetch {
  private baseUrl: string;
  private apiKey: string;
  private serviceKey?: string;

  constructor() {
    this.baseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', '');
    this.apiKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    this.serviceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  }

  private getHeaders(useServiceKey = false) {
    const key = useServiceKey && this.serviceKey ? this.serviceKey : this.apiKey;
    return {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'User-Agent': 'meilv-web-fetch',
    };
  }

  async select(table: string, columns = '*', options: any = {}) {
    try {
      let url = `${this.baseUrl}/rest/v1/${table}?select=${columns}`;
      
      if (options.limit) url += `&limit=${options.limit}`;
      if (options.offset) url += `&offset=${options.offset}`;
      if (options.order) url += `&order=${options.order}`;
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          url += `&${key}=eq.${value}`;
        });
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(options.useServiceKey),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase fetch error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('SupabaseFetch select error:', error);
      return { data: null, error };
    }
  }

  async insert(table: string, data: any, options: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(options.useServiceKey),
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase insert error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('SupabaseFetch insert error:', error);
      return { data: null, error };
    }
  }

  async update(table: string, data: any, conditions: any, options: any = {}) {
    try {
      let url = `${this.baseUrl}/rest/v1/${table}?`;
      Object.entries(conditions).forEach(([key, value], index) => {
        if (index > 0) url += '&';
        url += `${key}=eq.${value}`;
      });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(options.useServiceKey),
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase update error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('SupabaseFetch update error:', error);
      return { data: null, error };
    }
  }

  async delete(table: string, conditions: any, options: any = {}) {
    try {
      let url = `${this.baseUrl}/rest/v1/${table}?`;
      Object.entries(conditions).forEach(([key, value], index) => {
        if (index > 0) url += '&';
        url += `${key}=eq.${value}`;
      });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(options.useServiceKey),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase delete error: ${response.status} ${errorText}`);
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('SupabaseFetch delete error:', error);
      return { data: null, error };
    }
  }
}

// 导出备用实例
export const supabaseFetch = new SupabaseFetch();

// 检查配置函数
export function checkSupabaseConfig() {
  const realUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const realAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const realServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  if (!realUrl || realUrl === 'https://placeholder.supabase.co') {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  if (!realAnonKey || realAnonKey === 'placeholder-key') {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }
  if (!realServiceKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Using anon key for server operations.");
  }
  return true;
}
