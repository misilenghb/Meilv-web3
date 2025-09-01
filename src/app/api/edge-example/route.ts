/**
 * 边缘运行时兼容的API路由示例
 * 展示如何在Cloudflare Workers中正确处理API请求
 */

import { createClient } from "@supabase/supabase-js";
import {
  getEnvVar,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
  setCookie,
  validateSession
} from "@/lib/edge-runtime";

// 导出运行时配置
export const runtime = 'edge';

// 创建Supabase客户端
function createSupabaseClient() {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET 请求处理
export async function GET(request: Request) {
  try {
    // 验证会话
    const session = validateSession(request);
    if (!session) {
      return createErrorResponse('Unauthorized', 401);
    }

    const supabase = createSupabaseClient();
    
    // 示例：获取用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error) {
      return createErrorResponse('User not found', 404);
    }

    return createSuccessResponse({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('GET /api/edge-example error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST 请求处理
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await parseRequestBody(request);
    
    // 验证必填字段
    if (!body.name || !body.phone) {
      return createErrorResponse('Missing required fields', 400);
    }

    const supabase = createSupabaseClient();
    
    // 示例：创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name: body.name,
        phone: body.phone,
        role: body.role || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return createErrorResponse('Failed to create user', 500);
    }

    // 创建会话
    const sessionData = {
      userId: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
      name: newUser.name
    };

    const session = Buffer.from(JSON.stringify(sessionData), "utf8").toString("base64");
    
    const response = createSuccessResponse({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role
      }
    });

    // 设置会话Cookie
    return setCookie(response, 'ml_session', session, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

  } catch (error) {
    console.error('POST /api/edge-example error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT 请求处理
export async function PUT(request: Request) {
  try {
    // 验证会话
    const session = validateSession(request);
    if (!session) {
      return createErrorResponse('Unauthorized', 401);
    }

    // 解析请求体
    const body = await parseRequestBody(request);
    
    const supabase = createSupabaseClient();
    
    // 示例：更新用户信息
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: body.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.userId)
      .select()
      .single();

    if (error) {
      return createErrorResponse('Failed to update user', 500);
    }

    return createSuccessResponse({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('PUT /api/edge-example error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE 请求处理
export async function DELETE(request: Request) {
  try {
    // 验证会话
    const session = validateSession(request);
    if (!session) {
      return createErrorResponse('Unauthorized', 401);
    }

    const supabase = createSupabaseClient();
    
    // 示例：删除用户
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', session.userId);

    if (error) {
      return createErrorResponse('Failed to delete user', 500);
    }

    return createSuccessResponse({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/edge-example error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS 请求处理（CORS预检）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
