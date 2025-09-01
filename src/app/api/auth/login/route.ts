import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Body = Record<string, string>;

const parseBody = async (req: NextRequest): Promise<Body> => {
  try {
    return await req.json();
  } catch {
    const fd = await req.formData();
    return Object.fromEntries(fd.entries()) as Body;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "").trim();
    const role = (body.role as string) || "user";

    // 验证必填字段
    if (!phone) {
      return NextResponse.json({ error: "请输入手机号" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }

    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
    }

    // 验证密码
    let isPasswordValid = false;

    if (user.password_hash) {
      // 如果用户有密码哈希，使用正常验证
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // 临时解决方案：对于没有密码的老用户，使用默认密码
      const defaultPassword = "123456";
      isPasswordValid = password === defaultPassword;
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
    }

    // 创建会话
    const sessionData = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name
    };

    const session = Buffer.from(JSON.stringify(sessionData), "utf8").toString("base64");

    const res = NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

    res.cookies.set("ml_session", session, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    // 添加一个标记头，前端可以用来触发状态更新
    res.headers.set("X-Session-Updated", "true");

    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

