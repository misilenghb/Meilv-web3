import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 检查用户是否可以对指定订单进行投诉
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "订单ID必填" }, { status: 400 });
    }

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

    // 获取订单信息
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        guide_id,
        status,
        created_at,
        users!orders_user_id_fkey(id, name),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({
        canComplain: false,
        reason: "订单不存在"
      });
    }

    // 检查用户是否参与了这个订单
    const isParticipant = order.user_id === userId || order.guide_id === userId;
    if (!isParticipant) {
      return NextResponse.json({
        canComplain: false,
        reason: "您不是此订单的参与者"
      });
    }

    // 检查订单状态是否允许投诉
    const allowedStatuses = ['DEPOSIT_PAID', 'PAID', 'IN_PROGRESS', 'COMPLETED'];
    if (!allowedStatuses.includes(order.status)) {
      const statusMessages = {
        'DRAFT': '订单尚未确认',
        'GUIDE_SELECTED': '订单尚未支付保证金',
        'DEPOSIT_PENDING': '订单尚未支付保证金',
        'CANCELLED': '订单已取消',
        'REFUNDED': '订单已退款'
      };
      
      return NextResponse.json({
        canComplain: false,
        reason: statusMessages[order.status as keyof typeof statusMessages] || "订单状态不允许投诉",
        orderStatus: order.status
      });
    }

    // 检查是否已经投诉过
    const { data: existingComplaint } = await supabaseAdmin
      .from('complaints')
      .select('id, status, created_at')
      .eq('complainant_id', userId)
      .eq('order_id', orderId)
      .single();

    if (existingComplaint) {
      return NextResponse.json({
        canComplain: false,
        reason: "您已经对此订单提交过投诉",
        existingComplaint: {
          id: existingComplaint.id,
          status: existingComplaint.status,
          createdAt: existingComplaint.created_at
        }
      });
    }

    // 确定被投诉人
    let respondentId, respondentName, respondentType;
    if (order.user_id === userId) {
      // 用户投诉地陪
      respondentId = order.guide_id;
      respondentName = order.guides?.display_name;
      respondentType = 'guide';
    } else {
      // 地陪投诉用户
      respondentId = order.user_id;
      respondentName = order.users?.name;
      respondentType = 'user';
    }

    return NextResponse.json({
      canComplain: true,
      reason: "可以投诉",
      orderInfo: {
        id: order.id,
        status: order.status,
        createdAt: order.created_at
      },
      respondent: {
        id: respondentId,
        name: respondentName,
        type: respondentType
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
