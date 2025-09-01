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
    // 验证管理员权限
    // const session = await getSession(request);
    // if (!session || session.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = await context.params;

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

    // 格式化数据
    const formattedApplication = {
      id: application.id,
      displayName: application.display_name,
      realName: application.real_name,
      idNumber: application.id_number,
      phone: application.phone,
      email: application.email,
      gender: application.gender,
      age: application.age,
      city: application.city,
      address: application.address,
      bio: application.bio,
      skills: application.skills,
      hourlyRate: application.hourly_rate,
      availableServices: application.available_services,
      languages: application.languages,
      idCardFront: application.id_card_front,
      idCardBack: application.id_card_back,
      healthCertificate: application.health_certificate,
      backgroundCheck: application.background_check,
      photos: application.photos,
      experience: application.experience,
      motivation: application.motivation,
      emergencyContact: application.emergency_contact,
      status: application.status,
      submittedAt: application.submitted_at,
      reviewNotes: application.review_notes,
      reviewedAt: application.reviewed_at,
      reviewerName: null, // TODO: 实现审核人员信息关联
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    // const session = await getSession(request);
    // if (!session || session.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = await context.params;
    const { status, notes } = await request.json();

    if (!["pending", "under_review", "approved", "rejected", "need_more_info"].includes(status)) {
      return NextResponse.json(
        { error: "无效的状态" },
        { status: 400 }
      );
    }

    // 获取当前申请信息
    const { data: currentApplication, error: fetchError } = await supabase
      .from('guide_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "申请不存在" },
        { status: 404 }
      );
    }

    // 更新申请状态
    const updateData: any = {
      status,
      review_notes: notes || null,
      reviewed_at: new Date().toISOString(),
      // reviewed_by: session.userId // 实际实现时使用真实的用户ID
    };

    // 添加审核历史记录
    const newHistoryRecord = {
      id: crypto.randomUUID(),
      reviewerId: "admin", // 实际实现时使用真实的用户ID
      reviewerName: "管理员", // 实际实现时使用真实的用户名
      action: status === "approved" ? "approve" : 
              status === "rejected" ? "reject" : 
              status === "need_more_info" ? "request_info" : "update",
      status,
      notes,
      timestamp: new Date().toISOString()
    };

    const currentHistory = currentApplication.review_history || [];
    updateData.review_history = [...currentHistory, newHistoryRecord];

    const { error: updateError } = await supabase
      .from('guide_applications')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: "更新申请状态失败" },
        { status: 500 }
      );
    }

    // 如果是通过申请，创建地陪档案
    if (status === "approved") {
      try {
        await createGuideFromApplication(id, currentApplication);
      } catch (error) {
        console.error('Failed to create guide profile:', error);
        // 不影响状态更新的成功
      }
    }

    // 发送通知
    try {
      await sendNotification(currentApplication, status, notes);
    } catch (error) {
      console.error('Notification error:', error);
      // 不影响状态更新的成功
    }

    return NextResponse.json({
      success: true,
      message: "申请状态更新成功"
    });

  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

async function createGuideFromApplication(applicationId: string, application: any) {
  // 创建用户账户（如果不存在）
  let userId = null;
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('phone', application.phone)
    .single();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // 创建新用户
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        phone: application.phone,
        name: application.real_name,
        role: 'guide',
        email: application.email
      }])
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    userId = newUser.id;
  }

  // 创建地陪档案
  const { error: guideError } = await supabase
    .from('guides')
    .insert([{
      user_id: userId,
      application_id: applicationId,
      display_name: application.display_name,
      bio: application.bio,
      skills: application.skills,
      hourly_rate: application.hourly_rate,
      services: [
        { code: "daily", title: "日常陪伴", pricePerHour: application.hourly_rate },
        { code: "mild_entertainment", title: "微醺娱乐", pricePerHour: Math.round(application.hourly_rate * 1.5) },
        { code: "local_tour", title: "同城旅游", packagePrice: application.hourly_rate * 15 }
      ],
      photos: application.photos,
      city: application.city,
      location: application.address,
      rating_avg: 0,
      rating_count: 0,
      verification_status: 'verified',
      verified_at: new Date().toISOString()
    }]);

  if (guideError) {
    throw new Error(`Failed to create guide profile: ${guideError.message}`);
  }
}

async function sendNotification(application: any, status: string, notes?: string) {
  console.log(`Sending notification to ${application.display_name} (${application.phone}):`, {
    status,
    notes,
    applicationId: application.id
  });

  // 实际实现时可以调用邮件/短信服务
  // const template = getTemplateByStatus(status);
  // await emailService.send({
  //   to: application.email,
  //   template,
  //   data: {
  //     applicantName: application.display_name,
  //     notes,
  //     applicationId: application.id
  //   }
  // });
}

function getTemplateByStatus(status: string) {
  switch (status) {
    case "approved":
      return "application_approved";
    case "rejected":
      return "application_rejected";
    case "need_more_info":
      return "need_more_info";
    default:
      return "application_update";
  }
}
