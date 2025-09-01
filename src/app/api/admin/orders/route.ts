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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 构建查询
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        users!orders_user_id_fkey(id, name, phone),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .order('created_at', { ascending: false });

    // 按状态筛选
    if (status && status !== "all") {
      query = query.eq('status', status);
    }

    // 分页
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
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
      guideName: order.guides?.display_name || ''
    }));

    return NextResponse.json({
      items: frontendOrders,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error("Failed to get orders:", error);
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: 500 }
    );
  }
}
