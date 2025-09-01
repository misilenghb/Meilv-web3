import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

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

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, name, role, intended_role')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否有地陪申请权限
    if (user.role !== "guide" && user.intended_role !== "guide") {
      return NextResponse.json(
        { error: "只有地陪用户可以查看申请" },
        { status: 403 }
      );
    }

    // 查找用户最新的申请记录
    const { data: application, error: appError } = await supabase
      .from('guide_applications')
      .select('*')
      .eq('phone', user.phone)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "未找到申请记录" },
        { status: 404 }
      );
    }

    // 转换数据格式以匹配前端表单
    const formData = {
      displayName: application.display_name,
      realName: application.real_name,
      idNumber: application.id_number,
      email: application.email,
      gender: application.gender,
      age: application.age,
      city: application.city,
      address: application.address,
      bio: application.bio,
      skills: application.skills,
      hourlyRate: application.hourly_rate,
      availableServices: application.available_services || [],
      languages: application.languages || ['中文'],
      idCardFront: application.id_card_front,
      idCardBack: application.id_card_back,
      healthCertificate: application.health_certificate,
      backgroundCheck: application.background_check,
      photos: application.photos || [],
      experience: application.experience,
      motivation: application.motivation,
      emergencyContact: application.emergency_contact
    };

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        submittedAt: application.submitted_at,
        reviewedAt: application.reviewed_at,
        reviewNotes: application.review_notes,
        canEdit: ["rejected", "need_more_info"].includes(application.status),
        formData
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
