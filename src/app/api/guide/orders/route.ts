import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 查找当前用户的地陪档案
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('guides')
      .select('id')
      .eq('user_id', session.userId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ 
        error: "未找到地陪档案，请先申请成为地陪" 
      }, { status: 404 });
    }

    // 获取分配给该地陪的订单
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        service_type,
        service_title,
        start_time,
        duration_hours,
        total_amount,
        location,
        notes,
        created_at,
        updated_at,
        users!orders_user_id_fkey(name, phone)
      `)
      .eq('guide_id', guide.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error("Get guide orders error:", ordersError);
      return NextResponse.json({ error: "获取订单失败" }, { status: 500 });
    }

    return NextResponse.json({ 
      orders: orders || [],
      guideId: guide.id
    });

  } catch (error) {
    console.error("Guide orders API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
