import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "权限不足" }, { status: 403 });
  }

  const { id: orderId } = await context.params;
  const { guideId, totalAmount, notes } = await req.json();

  if (!guideId) {
    return NextResponse.json({ error: "请选择地陪" }, { status: 400 });
  }

  try {
    // 查找订单
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查地陪是否存在且可用
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('guides')
      .select('id, display_name, hourly_rate, is_active, verification_status')
      .eq('id', guideId)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: "地陪不存在" }, { status: 404 });
    }

    if (!guide.is_active || guide.verification_status !== 'verified') {
      return NextResponse.json({ 
        error: "所选地陪不可用（未激活或未认证）" 
      }, { status: 400 });
    }

    // 计算总金额（如果没有提供）
    const finalTotalAmount = totalAmount || (guide.hourly_rate * order.duration_hours);

    // 更新订单
    const updates = {
      guide_id: guideId,
      total_amount: finalTotalAmount,
      status: 'confirmed', // 管理员分配后直接确认，等待收款
      updated_at: new Date().toISOString(),
      notes: order.notes ?
        `${order.notes}\n管理员分配地陪: ${guide.display_name} (${guideId}) - ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}` :
        `管理员分配地陪: ${guide.display_name} (${guideId}) - ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}`
    };

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        users!orders_user_id_fkey(id, name, phone),
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json({ error: "分配地陪失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `已成功分配地陪：${guide.display_name}`
    });

  } catch (error) {
    console.error("Assign guide error:", error);
    return NextResponse.json({ error: "分配地陪失败" }, { status: 500 });
  }
}

// 获取可用地陪列表
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "权限不足" }, { status: 403 });
  }

  try {
    // 获取所有可用地陪
    const { data: guides, error } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        display_name,
        hourly_rate,
        city,
        rating_avg,
        rating_count,
        is_active,
        verification_status
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .order('rating_avg', { ascending: false });

    if (error) {
      console.error("Fetch guides error:", error);
      return NextResponse.json({ error: "获取地陪列表失败" }, { status: 500 });
    }

    return NextResponse.json({ guides });

  } catch (error) {
    console.error("Get available guides error:", error);
    return NextResponse.json({ error: "获取地陪列表失败" }, { status: 500 });
  }
}
