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

    // 获取用户的预约统计
    const { data: bookings, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('user_id', sessionData.userId);

    if (error) {
      console.error('Bookings fetch error:', error);
      return NextResponse.json(
        { error: "获取预约统计失败" },
        { status: 500 }
      );
    }

    // 计算统计数据
    const summary = {
      total: bookings?.length || 0,
      completed: bookings?.filter(booking => booking.status === 'completed').length || 0,
      pending: bookings?.filter(booking => 
        ['pending', 'confirmed', 'in_progress'].includes(booking.status)
      ).length || 0,
      totalSpent: bookings?.filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Bookings summary error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
