import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // 检查用户登录状态
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const excludeCurrentUser = searchParams.get("excludeCurrentUser") === "true";

    // 获取所有用户（排除当前用户）
    let query = supabaseAdmin
      .from('users')
      .select('id, name, role, phone')
      .order('name', { ascending: true });

    if (excludeCurrentUser) {
      query = query.neq('id', session.userId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Users fetch error:', error);
      return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
    }

    // 格式化用户数据
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      roleLabel: getRoleLabel(user.role)
    }));

    return NextResponse.json({ items: formattedUsers });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'user':
      return '用户';
    case 'guide':
      return '地陪';
    case 'admin':
      return '管理员';
    default:
      return '未知';
  }
}
