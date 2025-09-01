import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
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

    // 验证用户是否有地陪申请权限
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

    if (user.intended_role !== "guide") {
      return NextResponse.json(
        { error: "只有注册时选择成为地陪的用户才能申请地陪服务" },
        { status: 403 }
      );
    }

    const formData = await request.json();

    // 验证必填字段
    const requiredFields = [
      'displayName', 'realName', 'idNumber', 'phone', 'city', 'address',
      'bio', 'skills', 'hourlyRate', 'idCardFront', 'idCardBack', 'photos',
      'experience', 'motivation', 'emergencyContact'
    ];

    for (const field of requiredFields) {
      if (field === 'emergencyContact') {
        // 特殊处理紧急联系人对象
        if (!formData[field] || !formData[field].name || !formData[field].phone) {
          return NextResponse.json(
            { error: `缺少必填字段: ${field} (姓名和电话)` },
            { status: 400 }
          );
        }
      } else if (!formData[field]) {
        return NextResponse.json(
          { error: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证身份证号格式
    const idNumberRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idNumberRegex.test(formData.idNumber)) {
      return NextResponse.json(
        { error: "身份证号格式不正确" },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }

    // 检查是否已存在相同身份证号或手机号的申请
    const { data: existingApplication } = await supabase
      .from('guide_applications')
      .select('id, status')
      .or(`id_number.eq.${formData.idNumber},phone.eq.${formData.phone}`)
      .single();

    if (existingApplication) {
      if (existingApplication.status === 'pending' || existingApplication.status === 'under_review') {
        return NextResponse.json(
          { error: "您已有待审核的申请，请耐心等待审核结果" },
          { status: 400 }
        );
      } else if (existingApplication.status === 'approved') {
        return NextResponse.json(
          { error: "您已是认证地陪，无需重复申请" },
          { status: 400 }
        );
      } else if (existingApplication.status === 'rejected' || existingApplication.status === 'need_more_info') {
        return NextResponse.json(
          { error: "您的申请已被拒绝或需要补充材料，请使用重新申请功能修改资料" },
          { status: 400 }
        );
      }
    }

    // 创建申请记录
    const applicationData = {
      display_name: formData.displayName,
      real_name: formData.realName,
      id_number: formData.idNumber,
      phone: formData.phone,
      email: formData.email || null,
      gender: formData.gender || null,
      age: formData.age || null,
      city: formData.city,
      address: formData.address,
      bio: formData.bio,
      skills: formData.skills,
      hourly_rate: formData.hourlyRate,
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
      updated_at: new Date().toISOString()
    };

    const { data: application, error } = await supabase
      .from('guide_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "申请提交失败，请重试" },
        { status: 500 }
      );
    }

    // 发送通知邮件给管理员（可选）
    try {
      await sendAdminNotification(application);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // 不影响申请提交的成功
    }

    return NextResponse.json({
      success: true,
      message: "申请提交成功！我们将在3-5个工作日内完成审核",
      applicationId: application.id
    });

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}

async function sendAdminNotification(application: any) {
  // 这里可以集成邮件服务（如SendGrid、Resend等）
  // 发送新申请通知给管理员
  console.log('New guide application received:', {
    id: application.id,
    name: application.display_name,
    city: application.city,
    submittedAt: application.submitted_at
  });
  
  // 示例：发送邮件通知
  // await emailService.send({
  //   to: 'admin@meilv.com',
  //   subject: '新的地陪申请待审核',
  //   template: 'new-guide-application',
  //   data: {
  //     applicantName: application.display_name,
  //     city: application.city,
  //     applicationId: application.id
  //   }
  // });
}
