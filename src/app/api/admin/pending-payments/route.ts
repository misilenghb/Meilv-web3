import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getSessionServer();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    // 筛选需要人工收款的订单状态（保证金和尾款）
    // 使用数据库中实际存在的状态值
    const pendingPaymentStatuses = [
      "confirmed", // 已确认订单，等待收取保证金
      "in_progress" // 已收保证金，等待见面收取尾款
    ];

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users!orders_user_id_fkey(id, name, phone),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .in('status', pendingPaymentStatuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "获取待收款订单失败" }, { status: 500 });
    }

    // 转换为前端期望的格式
    const frontendOrders = (orders || []).map(order => ({
      id: order.id,
      userId: order.user_id,
      guideId: order.guide_id,
      requirement: {
        serviceType: order.service_type,
        startTime: order.start_time,
        duration: order.duration_hours,
        area: order.location?.split(' ')[0] || '',
        address: order.location?.split(' ').slice(1).join(' ') || order.location || '',
        specialRequests: order.notes || ''
      },
      depositAmount: 200,
      totalAmount: order.total_amount,
      finalAmount: order.final_amount || (order.total_amount - 200), // 尾款金额
      status: order.status,
      paymentType: order.status === "confirmed" ? "deposit" : "final", // 收款类型：confirmed=保证金，in_progress=尾款
      pendingAmount: order.status === "confirmed" ? 200 : (order.total_amount - 200), // 待收金额
      serviceType: order.service_type,
      serviceTitle: order.service_title,
      location: order.location,
      startTime: order.start_time,
      endTime: order.end_time,
      durationHours: order.duration_hours,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      userName: order.users?.name || '未知用户',
      userPhone: order.users?.phone || '',
      guideName: order.guides?.display_name || ''
    }));

    return NextResponse.json({
      items: frontendOrders,
      total: frontendOrders.length
    });
  } catch (error) {
    console.error("Failed to fetch pending payments:", error);
    return NextResponse.json(
      { error: "获取待收款订单失败" },
      { status: 500 }
    );
  }
}
