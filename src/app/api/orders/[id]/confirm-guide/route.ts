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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await context.params;
  const { action, notes } = await req.json(); // action: 'accept' | 'reject'

  if (!action || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    // 查找订单
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        guides!orders_guide_id_fkey(id, display_name, user_id)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 检查订单状态 - 使用现有的状态值
    if (order.status !== 'confirmed') {
      return NextResponse.json({
        error: "订单状态不正确，无法进行地陪确认操作"
      }, { status: 400 });
    }

    // 检查权限：只有分配的地陪或管理员可以操作
    const isAssignedGuide = order.guides && order.guides.user_id === session.userId;
    const isAdmin = session.role === 'admin';
    
    if (!isAssignedGuide && !isAdmin) {
      return NextResponse.json({ 
        error: "权限不足，只有分配的地陪或管理员可以操作" 
      }, { status: 403 });
    }

    let updates: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'accept') {
      // 地陪接单 - 保持confirmed状态，等待收款
      updates.guide_confirmed_at = new Date().toISOString();
      updates.notes = order.notes ?
        `${order.notes}\n地陪确认接单: ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}` :
        `地陪确认接单: ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}`;
    } else {
      // 地陪拒绝接单，重新分配
      updates.status = 'pending';
      updates.guide_id = null; // 清除地陪分配
      updates.notes = order.notes ?
        `${order.notes}\n地陪拒绝接单: ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}` :
        `地陪拒绝接单: ${new Date().toLocaleString()}${notes ? ` - ${notes}` : ''}`;
    }

    // 更新订单
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Update order error:", updateError);
      return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: action === 'accept' ? '接单成功' : '已拒绝接单，订单将重新分配'
    });

  } catch (error) {
    console.error("Confirm guide error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
