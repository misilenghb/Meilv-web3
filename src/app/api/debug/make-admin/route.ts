import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionServer();
    
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 更新用户角色为管理员
    const { data, error } = await SupabaseHelper.updateUser(session.userId, {
      role: 'admin'
    });

    if (error) {
      console.error("Update user role error:", error);
      return NextResponse.json({ error: "更新用户角色失败" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "用户已设置为管理员",
      userId: session.userId,
      newRole: 'admin'
    });

  } catch (error) {
    console.error("Make admin error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
