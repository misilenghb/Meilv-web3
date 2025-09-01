import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log("开始数据库设置...");

    // 1. 首先检查users表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (tablesError) {
      console.log("检查表存在性时出错，可能表不存在，尝试创建...");
    }

    // 2. 直接尝试操作users表，如果失败说明需要手动创建
    console.log("尝试访问users表...");

    // 3. 创建默认管理员用户
    const defaultPassword = "123456";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 检查管理员是否已存在
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('phone', '13900000000')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 是"没有找到行"的错误，这是正常的
      console.error('检查管理员时出错:', checkError);
      return NextResponse.json(
        {
          error: "数据库访问失败",
          details: checkError.message,
          suggestion: "请确保Supabase数据库中存在users表，并且包含以下列：id, phone, name, password_hash, role, intended_role, created_at, updated_at"
        },
        { status: 500 }
      );
    }

    if (!existingAdmin) {
      // 创建管理员用户
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .insert([{
          phone: '13900000000',
          name: '系统管理员',
          password_hash: passwordHash,
          role: 'admin',
          intended_role: 'admin',
          email: 'admin@meilv.com'
        }])
        .select()
        .single();

      if (adminError) {
        console.error('创建管理员失败:', adminError);
        return NextResponse.json(
          {
            error: "创建管理员失败",
            details: adminError.message,
            suggestion: "请确保users表包含password_hash列。您可能需要在Supabase控制台中手动添加此列。"
          },
          { status: 500 }
        );
      }

      console.log('管理员用户创建成功:', adminUser);
    } else {
      // 更新现有管理员的密码
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('phone', '13900000000');

      if (updateError) {
        console.error('更新管理员密码失败:', updateError);
        return NextResponse.json(
          {
            error: "更新管理员密码失败",
            details: updateError.message,
            suggestion: "请确保users表包含password_hash列。您可能需要在Supabase控制台中手动添加此列。"
          },
          { status: 500 }
        );
      } else {
        console.log('管理员密码更新成功');
      }
    }

    // 5. 为其他现有用户设置默认密码
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .neq('phone', '13900000000'); // 排除管理员

    if (!fetchError && users && users.length > 0) {
      const usersToUpdate = users.filter(user => !user.password_hash);
      
      if (usersToUpdate.length > 0) {
        const updatePromises = usersToUpdate.map(user => 
          supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', user.id)
        );

        await Promise.all(updatePromises);
        console.log(`为 ${usersToUpdate.length} 个用户设置了默认密码`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "数据库设置完成",
      details: {
        adminCreated: !existingAdmin,
        defaultPassword: defaultPassword,
        adminPhone: "13900000000",
        usersUpdated: users ? users.filter(u => !u.password_hash).length : 0
      }
    });

  } catch (error) {
    console.error('数据库设置错误:', error);
    return NextResponse.json(
      { error: "数据库设置失败", details: error.message },
      { status: 500 }
    );
  }
}
