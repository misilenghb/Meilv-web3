import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

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
        { error: "只有地陪用户可以申请" },
        { status: 403 }
      );
    }

    // 查找用户最新的申请记录
    const { data: existingApplication, error: appError } = await supabase
      .from('guide_applications')
      .select('*')
      .eq('phone', user.phone)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (appError || !existingApplication) {
      return NextResponse.json(
        { error: "未找到申请记录" },
        { status: 404 }
      );
    }

    // 检查申请状态是否允许重新提交
    if (!["rejected", "need_more_info"].includes(existingApplication.status)) {
      return NextResponse.json(
        { error: "当前申请状态不允许重新提交" },
        { status: 400 }
      );
    }

    const formData = await request.json();

    // 验证必填字段
    const requiredFields = [
      'displayName', 'realName', 'idNumber', 'gender', 'age', 'city', 'address',
      'bio', 'skills', 'hourlyRate', 'idCardFront', 'idCardBack', 'photos',
      'experience', 'motivation', 'emergencyContact'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证数据格式
    if (!/^\d{15}(\d{2}[0-9X])?$/.test(formData.idNumber)) {
      return NextResponse.json(
        { error: "身份证号格式不正确" },
        { status: 400 }
      );
    }

    if (!/^1[3-9]\d{9}$/.test(user.phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }

    if (formData.age < 18 || formData.age > 60) {
      return NextResponse.json(
        { error: "年龄必须在18-60岁之间" },
        { status: 400 }
      );
    }

    if (formData.hourlyRate < 50 || formData.hourlyRate > 1000) {
      return NextResponse.json(
        { error: "时薪必须在50-1000元之间" },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData = {
      display_name: formData.displayName,
      real_name: formData.realName,
      id_number: formData.idNumber,
      email: formData.email || null,
      gender: formData.gender,
      age: parseInt(formData.age),
      city: formData.city,
      address: formData.address,
      bio: formData.bio,
      skills: formData.skills,
      hourly_rate: parseFloat(formData.hourlyRate),
      available_services: formData.availableServices || [],
      languages: formData.languages || ['中文'],
      id_card_front: formData.idCardFront,
      id_card_back: formData.idCardBack,
      health_certificate: formData.healthCertificate || null,
      background_check: formData.backgroundCheck || null,
      photos: formData.photos,
      experience: formData.experience,
      motivation: formData.motivation,
      emergency_contact: formData.emergencyContact,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      review_notes: null,
      reviewed_at: null,
      reviewed_by: null
    };

    // 更新申请记录
    const { data: updatedApplication, error: updateError } = await supabase
      .from('guide_applications')
      .update(updateData)
      .eq('id', existingApplication.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: "申请更新失败，请重试" },
        { status: 500 }
      );
    }

    // 发送通知邮件给管理员（可选）
    try {
      await sendAdminNotification(updatedApplication);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // 不影响申请提交的成功
    }

    return NextResponse.json({
      success: true,
      message: "申请重新提交成功！我们将在3-5个工作日内完成审核",
      applicationId: updatedApplication.id
    });

  } catch (error) {
    console.error('Reapply error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}

// 发送管理员通知邮件的函数（占位符）
async function sendAdminNotification(application: any) {
  // 这里可以实现发送邮件通知管理员的逻辑
  console.log('Admin notification sent for reapplication:', application.id);
}
