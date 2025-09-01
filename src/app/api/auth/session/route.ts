import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("ml_session");
    
    if (!sessionCookie) {
      return NextResponse.json({ session: null });
    }

    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
      
      // 验证session中的用户是否仍然存在
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.userId)
        .single();

      if (error || !user) {
        // 用户不存在，清除session
        const response = NextResponse.json({ session: null });
        response.cookies.delete("ml_session");
        return response;
      }

      // 返回最新的用户信息
      const session = {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        intendedRole: user.intended_role
      };

      return NextResponse.json({ session });

    } catch (parseError) {
      // session格式错误，清除session
      const response = NextResponse.json({ session: null });
      response.cookies.delete("ml_session");
      return response;
    }

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // 登出功能
  const response = NextResponse.json({ success: true, message: "已登出" });
  response.cookies.delete("ml_session");
  return response;
}

