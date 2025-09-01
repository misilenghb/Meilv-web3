// 地陪主动接单API
import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id: orderId } = await context.params;

  try {
    // 查找当前用户的地陪档案
    const { data: guide, error: guideError } = await supabaseAdmin
      .from('guides')
      .select('id, display_name, hourly_rate, verification_status, is_active')
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

    // 查找订单
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查订单状态
    if (order.status !== 'pending') {
      return NextResponse.json({ 
        error: "订单状态不正确，无法接单" 
      }, { status: 400 });
    }

    // 检查订单是否已有地陪
    if (order.guide_id) {
      return NextResponse.json({ 
        error: "订单已被其他地陪接取" 
      }, { status: 409 });
    }

    // 检查订单是否已过期
    const startTime = new Date(order.start_time);
    const now = new Date();
    if (startTime <= now) {
      return NextResponse.json({ 
        error: "订单已过期，无法接单" 
      }, { status: 400 });
    }

    // 检查地陪是否有时间冲突的订单
    const { data: conflictOrders, error: conflictError } = await supabaseAdmin
      .from('orders')
      .select('id, start_time, duration_hours')
      .eq('guide_id', guide.id)
      .in('status', ['confirmed', 'in_progress']);

    if (conflictError) {
      console.error("Check conflict orders error:", conflictError);
      return NextResponse.json({ error: "检查时间冲突失败" }, { status: 500 });
    }

    // 检查时间冲突
    const orderStartTime = new Date(order.start_time);
    const orderEndTime = new Date(orderStartTime.getTime() + order.duration_hours * 60 * 60 * 1000);

    const hasConflict = conflictOrders.some(existingOrder => {
      const existingStartTime = new Date(existingOrder.start_time);
      const existingEndTime = new Date(existingStartTime.getTime() + existingOrder.duration_hours * 60 * 60 * 1000);
      
      return (orderStartTime < existingEndTime && orderEndTime > existingStartTime);
    });

    if (hasConflict) {
      return NextResponse.json({ 
        error: "时间冲突，您在该时间段已有其他订单" 
      }, { status: 409 });
    }

    // 计算订单总金额
    const totalAmount = guide.hourly_rate * order.duration_hours;

    // 更新订单 - 分配地陪
    const now_iso = new Date().toISOString();
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        guide_id: guide.id,
        hourly_rate: guide.hourly_rate,
        total_amount: totalAmount,
        status: 'confirmed', // 地陪已接单，等待收取保证金
        updated_at: now_iso,
        notes: `${order.notes || ''}\n地陪主动接单: ${guide.display_name} (${guide.id}) - ${now_iso}`
      })
      .eq('id', orderId)
      .eq('status', 'pending') // 确保状态没有被其他人改变
      .is('guide_id', null) // 确保没有被其他地陪接单
      .select()
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: "订单已被其他地陪接取或状态已改变" 
        }, { status: 409 });
      }
      
      return NextResponse.json({ error: "接单失败，请重试" }, { status: 500 });
    }

    if (!updatedOrder) {
      return NextResponse.json({ 
        error: "订单已被其他地陪接取或状态已改变" 
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: "接单成功！",
      order: updatedOrder,
      guide: {
        id: guide.id,
        displayName: guide.display_name,
        hourlyRate: guide.hourly_rate
      },
      totalAmount
    });

  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
