import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 获取投诉列表
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

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role"); // 'complainant' | 'respondent' | 'admin'

    // 获取用户信息以检查是否为管理员
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    let query = supabaseAdmin
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
        order:orders!complaints_order_id_fkey(id, service_type, service_title, status, total_amount)
      `)
      .order('created_at', { ascending: false });

    // 根据用户角色和权限过滤数据
    if (user.role === 'admin') {
      // 管理员可以查看所有投诉
      if (status) {
        query = query.eq('status', status);
      }
    } else {
      // 普通用户只能查看自己相关的投诉
      if (role === 'complainant') {
        query = query.eq('complainant_id', userId);
      } else if (role === 'respondent') {
        query = query.eq('respondent_id', userId);
      } else {
        // 默认查看所有相关投诉
        query = query.or(`complainant_id.eq.${userId},respondent_id.eq.${userId}`);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
    }

    const { data: complaints, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "获取投诉列表失败" }, { status: 500 });
    }

    // 格式化数据
    const formattedComplaints = complaints?.map(complaint => ({
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
      order: complaint.order
    })) || [];

    return NextResponse.json({
      items: formattedComplaints,
      total: formattedComplaints.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 创建投诉
export async function POST(request: NextRequest) {
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

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "用户信息无效" },
        { status: 401 }
      );
    }

    const { orderId, respondentId, category, title, description, evidenceUrls } = await request.json();

    // 验证必填字段
    if (!orderId || !respondentId || !category || !title || !description) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // 验证订单存在且用户有权限投诉
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, guide_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查用户是否参与了这个订单
    if (order.user_id !== userId && order.guide_id !== userId) {
      return NextResponse.json({ error: "您无权对此订单进行投诉" }, { status: 403 });
    }

    // 检查订单状态是否允许投诉（必须已支付保证金或已完成）
    const allowedStatuses = ['DEPOSIT_PAID', 'PAID', 'IN_PROGRESS', 'COMPLETED'];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json({ 
        error: "只能对已支付保证金或已完成的订单进行投诉" 
      }, { status: 400 });
    }

    // 检查是否已经投诉过
    const { data: existingComplaint } = await supabaseAdmin
      .from('complaints')
      .select('id')
      .eq('complainant_id', userId)
      .eq('order_id', orderId)
      .single();

    if (existingComplaint) {
      return NextResponse.json({ error: "您已经对此订单提交过投诉" }, { status: 400 });
    }

    // 验证被投诉人
    if (respondentId !== order.user_id && respondentId !== order.guide_id) {
      return NextResponse.json({ error: "被投诉人必须是订单的参与者" }, { status: 400 });
    }

    if (respondentId === userId) {
      return NextResponse.json({ error: "不能投诉自己" }, { status: 400 });
    }

    // 创建投诉
    const { data: complaint, error: createError } = await supabaseAdmin
      .from('complaints')
      .insert({
        complainant_id: userId,
        respondent_id: respondentId,
        order_id: orderId,
        category,
        title,
        description,
        evidence_urls: evidenceUrls || [],
        status: 'pending',
        priority: 'normal'
      })
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
        created_at
      `)
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return NextResponse.json({ error: "创建投诉失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "投诉提交成功，我们会尽快处理",
      complaint: {
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
        createdAt: complaint.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
