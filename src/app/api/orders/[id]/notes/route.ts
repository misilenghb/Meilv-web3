import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { SupabaseHelper, supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // 获取订单
  const { data: order, error: orderError } = await SupabaseHelper.getOrderById(id);
  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Check if user is the guide for this order
  if (session.role === "guide") {
    const { data: guide, error: guideError } = await SupabaseHelper.getGuideByUserId(session.userId);
    if (guideError || !guide || order.guide_id !== guide.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  } else if (session.role === "user") {
    // Users can only add notes to their own orders
    if (order.user_id !== session.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { notes } = await request.json();

  // Validate notes
  if (typeof notes !== "string") {
    return NextResponse.json({ error: "Notes must be a string" }, { status: 400 });
  }

  if (notes.length > 1000) {
    return NextResponse.json({ error: "Notes too long (max 1000 characters)" }, { status: 400 });
  }

  // Update order with notes
  const updates = {
    notes: notes.trim()
  };

  const { data: updatedOrder, error: updateError } = await SupabaseHelper.updateOrder(id, updates);

  if (updateError) {
    console.error("Update order notes error:", updateError);
    return NextResponse.json({ error: "Failed to update order notes" }, { status: 500 });
  }

  return NextResponse.json(updatedOrder);
}
