import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log("开始数据库迁移...");

    // 1. 添加 password_hash 列（如果不存在）
    const addColumnQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `;

    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: addColumnQuery
    });

    if (alterError) {
      console.error('添加列失败:', alterError);
      // 如果RPC不可用，我们将使用直接的SQL查询
      // 这可能需要在Supabase控制台中手动执行
    }

    // 2. 为现有用户设置默认密码
    const defaultPassword = "123456";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 获取所有用户
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('获取用户失败:', fetchError);
      return NextResponse.json(
        { error: "获取用户失败", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "没有用户需要迁移",
        updated: 0
      });
    }

    // 为没有密码的用户设置默认密码
    const usersToUpdate = users.filter(user => !user.password_hash);
    
    if (usersToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "所有用户都已有密码",
        updated: 0
      });
    }

    const updatePromises = usersToUpdate.map(user => 
      supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', user.id)
    );

    const results = await Promise.all(updatePromises);
    
    // 检查是否有错误
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('更新密码失败:', errors);
      return NextResponse.json(
        { error: "部分用户密码更新失败", errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `数据库迁移完成，为 ${usersToUpdate.length} 个用户设置了默认密码`,
      updated: usersToUpdate.length,
      defaultPassword: defaultPassword,
      users: usersToUpdate.map(u => ({ 
        phone: u.phone, 
        name: u.name, 
        role: u.role 
      }))
    });

  } catch (error) {
    console.error('数据库迁移错误:', error);
    return NextResponse.json(
      { error: "数据库迁移失败", details: error.message },
      { status: 500 }
    );
  }
}
