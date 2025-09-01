import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // 这里应该验证管理员权限
    // const session = await getSession(request);
    // if (!session || session.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from('guide_applications')
      .select(`
        id,
        display_name,
        real_name,
        city,
        hourly_rate,
        status,
        submitted_at,
        reviewed_at,
        reviewed_by
      `)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq('status', status);
    }

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "获取申请列表失败" },
        { status: 500 }
      );
    }

    // 格式化数据
    const formattedApplications = applications?.map(app => ({
      id: app.id,
      displayName: app.display_name,
      realName: app.real_name,
      city: app.city,
      hourlyRate: app.hourly_rate,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewerName: null // TODO: 实现审核人员信息关联
    })) || [];

    return NextResponse.json({
      applications: formattedApplications,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 批量操作申请
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员权限
    // const session = await getSession(request);
    // if (!session || session.role !== 'admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { applicationIds, action, notes } = await request.json();

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: "请选择要操作的申请" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "request_info"].includes(action)) {
      return NextResponse.json(
        { error: "无效的操作类型" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "approved" : 
                     action === "reject" ? "rejected" : "need_more_info";

    // 更新申请状态
    const { error } = await supabase
      .from('guide_applications')
      .update({
        status: newStatus,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        // reviewed_by: session.userId // 实际实现时使用真实的用户ID
      })
      .in('id', applicationIds);

    if (error) {
      console.error('Batch update error:', error);
      return NextResponse.json(
        { error: "批量操作失败" },
        { status: 500 }
      );
    }

    // 如果是通过申请，创建地陪档案
    if (action === "approve") {
      for (const applicationId of applicationIds) {
        try {
          await createGuideFromApplication(applicationId);
        } catch (error) {
          console.error(`Failed to create guide for application ${applicationId}:`, error);
        }
      }
    }

    // 发送通知（可选）
    try {
      await sendBatchNotifications(applicationIds, action, notes);
    } catch (error) {
      console.error('Notification error:', error);
    }

    return NextResponse.json({
      success: true,
      message: `成功${action === "approve" ? "通过" : action === "reject" ? "拒绝" : "要求补充材料"}${applicationIds.length}个申请`
    });

  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

async function createGuideFromApplication(applicationId: string) {
  // 获取申请详情
  const { data: application, error: fetchError } = await supabase
    .from('guide_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchError || !application) {
    throw new Error(`Failed to fetch application ${applicationId}`);
  }

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

async function sendBatchNotifications(applicationIds: string[], action: string, notes?: string) {
  // 获取申请人信息
  const { data: applications } = await supabase
    .from('guide_applications')
    .select('id, display_name, phone, email')
    .in('id', applicationIds);

  if (!applications) return;

  // 发送通知（这里可以集成邮件/短信服务）
  for (const app of applications) {
    console.log(`Sending notification to ${app.display_name} (${app.phone}):`, {
      action,
      notes,
      applicationId: app.id
    });

    // 实际实现时可以调用邮件/短信服务
    // await emailService.send({
    //   to: app.email,
    //   template: getTemplateByAction(action),
    //   data: { applicantName: app.display_name, notes }
    // });
  }
}

function getTemplateByAction(action: string) {
  switch (action) {
    case "approve":
      return "application_approved";
    case "reject":
      return "application_rejected";
    case "request_info":
      return "need_more_info";
    default:
      return "application_update";
  }
}
