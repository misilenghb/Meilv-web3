import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // 获取申请详情
    const { data: application, error } = await supabase
      .from('guide_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "申请不存在" },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "获取申请详情失败" },
        { status: 500 }
      );
    }

    // 验证用户权限 - 只能查看自己的申请
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    if (application.phone !== user.phone) {
      return NextResponse.json(
        { error: "无权查看此申请" },
        { status: 403 }
      );
    }

    // 格式化数据
    const formattedApplication = {
      id: application.id,
      displayName: application.display_name,
      realName: application.real_name,
      city: application.city,
      hourlyRate: application.hourly_rate,
      bio: application.bio,
      skills: application.skills,
      photos: application.photos,
      status: application.status,
      submittedAt: application.submitted_at,
      reviewedAt: application.reviewed_at,
      reviewNotes: application.review_notes,
      reviewHistory: application.review_history || []
    };

    return NextResponse.json({
      application: formattedApplication
    });

  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
