import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 获取投诉详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: complaintId } = await params;

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

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    // 获取用户信息以检查权限
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 获取投诉详情
    const { data: complaint, error } = await supabaseAdmin
      .from('complaints')
      .select(`
        id,
        complainant_id,
        respondent_id,
        order_id,
        category,
        title,
        description,
        evidence_urls,
        status,
        priority,
        admin_id,
        admin_notes,
        resolution,
        created_at,
        updated_at,
        resolved_at,
        complainant:users!complaints_complainant_id_fkey(id, name, phone),
        respondent:users!complaints_respondent_id_fkey(id, name, phone),
        admin:users!complaints_admin_id_fkey(id, name),
        order:orders!complaints_order_id_fkey(id, service_type, service_title, status, total_amount, created_at)
      `)
      .eq('id', complaintId)
      .single();

    if (error || !complaint) {
      return NextResponse.json({ error: "投诉不存在" }, { status: 404 });
    }

    // 检查权限：只有投诉相关方和管理员可以查看
    const hasPermission = user.role === 'admin' || 
                         complaint.complainant_id === userId || 
                         complaint.respondent_id === userId;

    if (!hasPermission) {
      return NextResponse.json({ error: "无权查看此投诉" }, { status: 403 });
    }

    // 获取投诉处理记录
    const { data: actions, error: actionsError } = await supabaseAdmin
      .from('complaint_actions')
      .select(`
        id,
        action_type,
        description,
        old_value,
        new_value,
        created_at,
        actor:users!complaint_actions_actor_id_fkey(id, name)
      `)
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    // 格式化数据
    const formattedComplaint = {
      id: complaint.id,
      complainantId: complaint.complainant_id,
      respondentId: complaint.respondent_id,
      orderId: complaint.order_id,
      category: complaint.category,
      title: complaint.title,
      description: complaint.description,
      evidenceUrls: complaint.evidence_urls || [],
      status: complaint.status,
      priority: complaint.priority,
      adminId: complaint.admin_id,
      adminNotes: complaint.admin_notes,
      resolution: complaint.resolution,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at,
      resolvedAt: complaint.resolved_at,
      complainant: complaint.complainant,
      respondent: complaint.respondent,
      admin: complaint.admin,
      order: complaint.order,
      actions: actions?.map(action => ({
        id: action.id,
        actionType: action.action_type,
        description: action.description,
        oldValue: action.old_value,
        newValue: action.new_value,
        createdAt: action.created_at,
        actor: action.actor
      })) || []
    };

    return NextResponse.json(formattedComplaint);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 更新投诉（管理员操作）
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: complaintId } = await params;

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

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    // 检查管理员权限
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { status, priority, adminNotes, resolution } = await request.json();

    // 构建更新数据
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updates.status = status;
      if (status === 'resolved' || status === 'rejected') {
        updates.resolved_at = new Date().toISOString();
      }
    }

    if (priority) {
      updates.priority = priority;
    }

    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes;
    }

    if (resolution !== undefined) {
      updates.resolution = resolution;
    }

    // 分配处理人
    if (!updates.admin_id) {
      updates.admin_id = userId;
    }

    // 更新投诉
    const { data: updatedComplaint, error: updateError } = await supabaseAdmin
      .from('complaints')
      .update(updates)
      .eq('id', complaintId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json({ error: "更新投诉失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "投诉更新成功",
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
