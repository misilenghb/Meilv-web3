// 地陪查看可接订单API
import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    // 查找当前用户的地陪档案
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('guides')
      .select('id, city, verification_status, is_active')
      .eq('user_id', session.userId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ 
        error: "未找到地陪档案，请先申请成为地陪" 
      }, { status: 404 });
    }

    // 检查地陪状态
    if (!guide.is_active || guide.verification_status !== 'verified') {
      return NextResponse.json({ 
        error: "地陪账户未激活或未通过认证" 
      }, { status: 403 });
    }

    // 获取URL参数
    const url = new URL(req.url);
    const city = url.searchParams.get('city') || guide.city;
    const serviceType = url.searchParams.get('serviceType');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // 构建查询条件
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        service_type,
        service_title,
        start_time,
        duration_hours,
        location,
        requirement,
        created_at,
        users!orders_user_id_fkey(name)
      `)
      .eq('status', 'pending') // 只显示待分配的订单
      .is('guide_id', null) // 还没有分配地陪的订单
      .order('created_at', { ascending: false })
      .limit(limit);

    // 如果指定了城市，按城市筛选
    if (city) {
      query = query.ilike('location', `%${city}%`);
    }

    // 如果指定了服务类型，按服务类型筛选
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error("Get available orders error:", ordersError);
      return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
    }

    // 过滤掉已过期的订单（开始时间已过）
    const now = new Date();
    const availableOrders = orders.filter(order => {
      const startTime = new Date(order.start_time);
      return startTime > now;
    });

    return NextResponse.json({
      orders: availableOrders,
      total: availableOrders.length,
      guide: {
        id: guide.id,
        city: guide.city
      }
    });

  } catch (error) {
    console.error("Get available orders error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
