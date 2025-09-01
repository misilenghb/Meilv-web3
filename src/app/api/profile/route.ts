import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
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

    // 获取用户资料
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const profile = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatarUrl: user.avatar_url,
      bio: user.bio || null,
      location: user.location || null,
      createdAt: user.created_at,
      role: user.role,
      intendedRole: user.intended_role
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const updateData = await request.json();

    // 允许更新的字段
    const allowedFields = ['name', 'email', 'bio', 'location', 'avatar_url'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "没有有效的更新字段" },
        { status: 400 }
      );
    }

    // 添加更新时间
    updates.updated_at = new Date().toISOString();

    // 更新用户资料
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', sessionData.userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: "更新失败" },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const profile = {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatar_url,
      bio: updatedUser.bio,
      location: updatedUser.location,
      createdAt: updatedUser.created_at,
      role: updatedUser.role,
      intendedRole: updatedUser.intended_role
    };

    return NextResponse.json({
      success: true,
      message: "资料更新成功",
      profile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
