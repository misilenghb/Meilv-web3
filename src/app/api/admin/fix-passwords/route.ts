import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 为现有用户设置默认密码
    const defaultPassword = "123456"; // 默认密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 获取所有没有密码的用户
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or('password_hash.is.null,password_hash.eq.""');

    if (fetchError) {
      console.error('Fetch users error:', fetchError);
      return NextResponse.json(
        { error: "获取用户失败" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "没有需要更新密码的用户",
        updated: 0
      });
    }

    // 为每个用户设置默认密码
    const updatePromises = users.map(user => 
      supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', user.id)
    );

    const results = await Promise.all(updatePromises);
    
    // 检查是否有错误
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Update errors:', errors);
      return NextResponse.json(
        { error: "部分用户密码更新失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功为 ${users.length} 个用户设置默认密码`,
      updated: users.length,
      defaultPassword: defaultPassword,
      users: users.map(u => ({ phone: u.phone, name: u.name, role: u.role }))
    });

  } catch (error) {
    console.error('Fix passwords error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
