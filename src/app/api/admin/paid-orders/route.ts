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

    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const days = parseInt(searchParams.get("days") || "30"); // 默认获取30天内的已收款订单

    // 计算日期范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users!orders_user_id_fkey(id, name, phone),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .in('status', ['in_progress', 'completed']) // 使用数据库中实际存在的状态值
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString())
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "获取已收款订单失败" }, { status: 500 });
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
      status: order.status,
      paymentStatus: order.payment_status,
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
      guideName: order.guides?.display_name || '',
      paidAt: order.updated_at // 收款时间
    }));

    return NextResponse.json({
      items: frontendOrders,
      total: frontendOrders.length
    });
  } catch (error) {
    console.error("Failed to fetch paid orders:", error);
    return NextResponse.json(
      { error: "获取已收款订单失败" },
      { status: 500 }
    );
  }
}
