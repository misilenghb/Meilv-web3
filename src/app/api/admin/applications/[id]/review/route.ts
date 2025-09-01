import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
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
    const { action, notes } = await request.json();

    if (!["approve", "reject", "request_info"].includes(action)) {
      return NextResponse.json(
        { error: "无效的操作类型" },
        { status: 400 }
      );
    }

    if ((action === "reject" || action === "request_info") && !notes?.trim()) {
      return NextResponse.json(
        { error: action === "reject" ? "拒绝申请时必须提供原因" : "要求补充材料时必须说明具体要求" },
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

    if (!["pending", "under_review", "need_more_info"].includes(currentApplication.status)) {
      return NextResponse.json(
        { error: "该申请已经处理完成，无法再次审核" },
        { status: 400 }
      );
    }

    // 确定新状态
    const newStatus = action === "approve" ? "approved" : 
                     action === "reject" ? "rejected" : "need_more_info";

    // 准备更新数据
    const updateData: any = {
      status: newStatus,
      review_notes: notes || null,
      reviewed_at: new Date().toISOString(),
      // reviewed_by: session.userId // 实际实现时使用真实的用户ID
    };

    // 添加审核历史记录
    const newHistoryRecord = {
      id: crypto.randomUUID(),
      reviewerId: "admin", // 实际实现时使用真实的用户ID
      reviewerName: "管理员", // 实际实现时使用真实的用户名
      action,
      status: newStatus,
      notes: notes || null,
      timestamp: new Date().toISOString()
    };

    const currentHistory = currentApplication.review_history || [];
    updateData.review_history = [...currentHistory, newHistoryRecord];

    // 更新申请状态
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
    if (action === "approve") {
      try {
        console.log(`Creating guide profile for application ${id}...`);
        await createGuideFromApplication(id, currentApplication);
        console.log(`Successfully created guide profile for application ${id}`);
      } catch (error) {
        console.error('Failed to create guide profile:', error);
        console.error('Application data:', currentApplication);
        // 回滚状态更新
        await supabase
          .from('guide_applications')
          .update({
            status: currentApplication.status,
            review_notes: currentApplication.review_notes,
            reviewed_at: currentApplication.reviewed_at,
            reviewed_by: currentApplication.reviewed_by,
            review_history: currentHistory
          })
          .eq('id', id);

        return NextResponse.json(
          { error: "创建地陪档案失败，请重试" },
          { status: 500 }
        );
      }
    }

    // 发送通知
    try {
      await sendNotification(currentApplication, action, notes);
    } catch (error) {
      console.error('Notification error:', error);
      // 不影响审核操作的成功
    }

    // 返回成功消息
    const actionText = action === "approve" ? "通过" : 
                      action === "reject" ? "拒绝" : "要求补充材料";

    return NextResponse.json({
      success: true,
      message: `申请${actionText}成功`,
      newStatus
    });

  } catch (error) {
    console.error('Review operation error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

async function createGuideFromApplication(applicationId: string, application: any) {
  console.log(`Starting createGuideFromApplication for ${applicationId}`);
  console.log('Application data:', JSON.stringify(application, null, 2));

  // 检查是否已存在用户
  let userId = null;
  console.log(`Checking for existing user with phone: ${application.phone}`);
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('phone', application.phone)
    .single();

  if (existingUser) {
    userId = existingUser.id;
    console.log(`Found existing user: ${userId}`);

    // 更新用户角色为地陪
    console.log('Updating user role to guide...');
    await supabase
      .from('users')
      .update({ role: 'guide' })
      .eq('id', userId);
  } else {
    console.log('Creating new user...');
    // 创建新用户
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        phone: application.phone,
        name: application.real_name,
        role: 'guide',
        email: application.email || null
      }])
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    userId = newUser.id;
    console.log(`Created new user: ${userId}`);
  }

  // 检查是否已存在地陪档案
  const { data: existingGuide } = await supabase
    .from('guides')
    .select('id')
    .eq('application_id', applicationId)
    .single();

  if (existingGuide) {
    // 更新现有档案
    const { error: updateError } = await supabase
      .from('guides')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        is_active: true
      })
      .eq('id', existingGuide.id);

    if (updateError) {
      throw new Error(`Failed to update guide profile: ${updateError.message}`);
    }
  } else {
    // 创建新的地陪档案
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
        photos: application.photos || [],
        city: application.city,
        location: application.address,
        rating_avg: 0,
        rating_count: 0,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        is_active: true
      }]);

    if (guideError) {
      throw new Error(`Failed to create guide profile: ${guideError.message}`);
    }
  }
}

async function sendNotification(application: any, action: string, notes?: string) {
  const actionText = action === "approve" ? "通过" : 
                    action === "reject" ? "拒绝" : "需要补充材料";

  console.log(`Sending notification to ${application.display_name} (${application.phone}):`, {
    action: actionText,
    notes,
    applicationId: application.id
  });

  // 实际实现时可以调用邮件/短信服务
  // const template = getNotificationTemplate(action);
  // 
  // if (application.email) {
  //   await emailService.send({
  //     to: application.email,
  //     subject: `地陪申请${actionText}通知`,
  //     template,
  //     data: {
  //       applicantName: application.display_name,
  //       action: actionText,
  //       notes: notes || '',
  //       applicationId: application.id
  //     }
  //   });
  // }
  //
  // // 发送短信通知
  // await smsService.send({
  //   to: application.phone,
  //   message: `【美旅】您的地陪申请已${actionText}${notes ? `，${notes}` : ''}。详情请登录查看。`
  // });
}

function getNotificationTemplate(action: string) {
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
