import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json(
        { error: "登录状态无效，请重新登录" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // 验证必填字段
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "请填写完整信息" },
        { status: 400 }
      );
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "新密码长度至少6位" },
        { status: 400 }
      );
    }

    // 验证新密码确认
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "两次输入的新密码不一致" },
        { status: 400 }
      );
    }

    // 获取用户信息
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 验证当前密码
    let isCurrentPasswordValid = false;
    
    if (user.password_hash) {
      // 如果用户有密码哈希，使用正常验证
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    } else {
      // 对于没有密码的老用户，检查是否使用默认密码
      const defaultPassword = "123456";
      isCurrentPasswordValid = currentPassword === defaultPassword;
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "当前密码错误" },
        { status: 400 }
      );
    }

    // 哈希新密码
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionData.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: "密码更新失败，请重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "密码修改成功"
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
