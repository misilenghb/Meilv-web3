import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // 获取用户的订单统计
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('user_id', sessionData.userId);

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { error: "获取订单统计失败" },
        { status: 500 }
      );
    }

    // 计算统计数据
    const summary = {
      total: orders?.length || 0,
      completed: orders?.filter(order => order.status === 'completed').length || 0,
      pending: orders?.filter(order => order.status === 'pending' || order.status === 'confirmed').length || 0,
      totalSpent: orders?.filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Orders summary error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
