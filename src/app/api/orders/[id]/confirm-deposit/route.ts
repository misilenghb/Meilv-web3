import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force recompilation

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;

    // 查找订单
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    // 检查订单状态 - 支持新旧两套状态系统
    const validStatuses = ["GUIDE_SELECTED", "confirmed"]; // 可以确认支付的状态
    const alreadyPaidStatuses = ["in_progress", "DEPOSIT_PAID", "completed", "COMPLETED"]; // 已经支付的状态

    if (alreadyPaidStatuses.includes(order.status)) {
      // 如果已经支付，直接返回成功
      return NextResponse.json({
        message: "保证金已经支付完成",
        order: order,
        alreadyPaid: true
      });
    }

    if (!validStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          message: `订单状态不正确，无法确认定金支付。当前状态: ${order.status}，期望状态: ${validStatuses.join(' 或 ')}`
        },
        { status: 400 }
      );
    }

    // 根据当前状态系统选择目标状态
    const targetStatus = order.status === "GUIDE_SELECTED" ? "DEPOSIT_PAID" : "in_progress";

    // 更新订单状态为已支付定金
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: targetStatus,
        // deposit_paid_at: new Date().toISOString(), // 暂时移除这个字段，因为数据库中不存在
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error("更新订单失败:", updateError);
      return NextResponse.json(
        { message: "更新订单状态失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "定金支付确认成功",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("确认定金支付失败:", error);
    return NextResponse.json(
      { message: "确认定金支付失败" },
      { status: 500 }
    );
  }
}
