import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { phone, name, password, role, intendedRole } = await request.json();

    // 验证必填字段
    if (!phone || !name || !password || !role) {
      return NextResponse.json(
        { error: "请填写完整信息" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6位" },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }

    // 验证角色
    if (!["user", "guide"].includes(role)) {
      return NextResponse.json(
        { error: "无效的用户角色" },
        { status: 400 }
      );
    }

    // 检查手机号是否已注册
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "该手机号已注册，请直接登录" },
        { status: 400 }
      );
    }

    // 哈希密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        phone,
        name,
        password_hash: passwordHash,
        role: role === "guide" ? "user" : role, // 地陪注册时先创建为普通用户，审核通过后再升级
        intended_role: intendedRole || role, // 记录用户的意向角色
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    // 自动登录
    const session = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      phone, 
      role: user.role,
      intendedRole: user.intended_role 
    }), "utf8").toString("base64");
    
    const response = NextResponse.json({
      success: true,
      message: "注册成功",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        intendedRole: user.intended_role
      }
    });

    response.cookies.set("ml_session", session, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 // 30天
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
