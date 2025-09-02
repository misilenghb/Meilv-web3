import { createClient } from "@supabase/supabase-js";

// Cloudflare Workers 兼容的环境变量获取
function getEnvVar(key: string, defaultValue?: string): string {
  // 在 Cloudflare Workers 中，环境变量可能通过不同方式访问
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

// Supabase 配置 - 使用默认值避免构建时错误
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
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// 客户端 Supabase 实例（用于前端）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, clientConfig);

// 服务端 Supabase 实例（用于API路由，具有更高权限）
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
}

// 导出备用实例
export const supabaseFetch = new SupabaseFetch();

// 检查环境变量是否正确配置
export function checkSupabaseConfig() {
  const realUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const realAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const realServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  GUIDES: 'guides',
  GUIDE_APPLICATIONS: 'guide_applications',
  REVIEWERS: 'reviewers',
  REVIEW_CRITERIA: 'review_criteria',
  NOTIFICATION_TEMPLATES: 'notification_templates',
  NOTIFICATION_LOGS: 'notification_logs',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
} as const;

// 常用的数据库操作辅助函数
export class SupabaseHelper {
  static async getUserByPhone(phone: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('phone', phone)
      .single();
    
    return { data, error };
  }

  static async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async createUser(userData: {
    phone: string;
    name: string;
    role: string;
    intended_role?: string;
    email?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return { data, error };
  }

  static async getGuideApplication(id: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDE_APPLICATIONS)
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async getGuideApplicationByPhone(phone: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDE_APPLICATIONS)
      .select('*')
      .eq('phone', phone)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    
    return { data, error };
  }

  static async createGuideApplication(applicationData: any) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDE_APPLICATIONS)
      .insert([{
        ...applicationData,
        id: crypto.randomUUID(),
        submitted_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();
    
    return { data, error };
  }

  static async updateGuideApplication(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDE_APPLICATIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async getGuideByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }

  static async createGuide(guideData: any) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.GUIDES)
      .insert([{
        ...guideData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    return { data, error };
  }

  // 订单相关操作
  static async createOrder(orderData: {
    user_id: string;
    requirement: any;
    deposit_amount?: number;
    guide_id?: string;
    status?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ORDERS)
      .insert([{
        ...orderData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    return { data, error };
  }

  static async getOrderById(id: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ORDERS)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  static async updateOrder(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ORDERS)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  static async getUserOrders(userId: string, status?: string) {
    let query = supabaseAdmin
      .from(TABLES.ORDERS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async getGuideOrders(guideId: string, status?: string) {
    let query = supabaseAdmin
      .from(TABLES.ORDERS)
      .select('*')
      .eq('guide_id', guideId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async deleteOrder(orderId: string) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.ORDERS)
      .delete()
      .eq('id', orderId);

    return { data, error };
  }

  static async getAllOrdersByStatus(statuses: string | string[]) {
    let query = supabaseAdmin
      .from(TABLES.ORDERS)
      .select('*')
      .order('updated_at', { ascending: false });

    if (Array.isArray(statuses)) {
      query = query.in('status', statuses);
    } else {
      query = query.eq('status', statuses);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async updateUser(userId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }
}

// 运行时检查（仅在运行时，不在构建时）
if (typeof window !== 'undefined') {
  // 客户端检查
  try {
    checkSupabaseConfig();
  } catch (error) {
    console.error("Supabase configuration error:", error);
  }
}
