import { NextRequest, NextResponse } from "next/server";
import { SupabaseHelper, supabaseAdmin } from "@/lib/supabase";
import { type OrderRequirement } from "@/types/domain";
import { getSessionServer } from "@/lib/session";
import { createOrderData, isIncompleteOrder } from "@/lib/database-adapter";

export async function POST(req: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const { requirement, depositAmount } = body as {
      requirement: OrderRequirement;
      depositAmount: number;
    };

    console.log("Parsed requirement:", JSON.stringify(requirement, null, 2));

    // 验证必填字段
    if (!requirement.startTime || !requirement.serviceType || !requirement.area || !requirement.address) {
      console.log("Missing required fields:", {
        startTime: requirement.startTime,
        serviceType: requirement.serviceType,
        area: requirement.area,
        address: requirement.address
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 验证开始时间不能是过去时间
    const startTime = new Date(requirement.startTime);
    const now = new Date();
    console.log("Time validation:", {
      startTime: startTime.toISOString(),
      now: now.toISOString(),
      isValid: startTime > now
    });

    if (startTime <= now) {
      console.log("Time validation failed: start time is in the past");
      return NextResponse.json({
        error: "开始时间必须是未来时间",
        details: `开始时间: ${startTime.toLocaleString('zh-CN')}, 当前时间: ${now.toLocaleString('zh-CN')}`
      }, { status: 400 });
    }

    // 检查用户是否已有未完成的订单
    console.log("Checking for existing orders for user:", session.userId);

    // 检查用户是否已有未完成的订单
    const { data: existingOrders, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('id, status, service_title, start_time')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    // 过滤未完成的订单
    const incompleteOrders = existingOrders?.filter(order =>
      isIncompleteOrder(order.status)
    ) || [];

    if (checkError) {
      console.error("Error checking existing orders:", checkError);
      return NextResponse.json({
        error: "检查现有订单时出错",
        details: checkError.message
      }, { status: 500 });
    }

    if (incompleteOrders.length > 0) {
      console.log("Found existing incomplete orders:", incompleteOrders);
      const existingOrder = incompleteOrders[0];
      return NextResponse.json({
        error: "您已有未完成的预约订单，请先完成或取消现有订单后再创建新订单",
        details: {
          existingOrderId: existingOrder.id,
          serviceTitle: existingOrder.service_title,
          startTime: existingOrder.start_time,
          status: existingOrder.status
        }
      }, { status: 409 }); // 409 Conflict
    }

    console.log("No existing orders found, proceeding with order creation");

    // 适配现有表结构的临时解决方案
    const orderId = crypto.randomUUID();
    console.log("Generated order ID:", orderId);
    const nowISO = new Date().toISOString();

    // 固定保证金金额
    const fixedDepositAmount = 200;

    try {
      // 使用适配器创建订单数据
      const orderData = createOrderData(session.userId, requirement, depositAmount);
      orderData.id = orderId; // 使用预生成的ID

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error("Create order error:", error);
        return NextResponse.json({
          error: "Failed to create order",
          details: error.message
        }, { status: 500 });
      }

      // 转换为前端期望的格式
      const frontendOrder = {
        id: order.id,
        userId: order.user_id,
        guideId: order.guide_id,
        requirement: requirement,
        depositAmount: fixedDepositAmount,
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
        updatedAt: order.updated_at
      };

      return NextResponse.json(frontendOrder, { status: 201 });

    } catch (createError) {
      console.error("Order creation error:", createError);
      return NextResponse.json({
        error: "Database operation failed",
        details: createError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Create draft order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
