import { NextRequest, NextResponse } from "next/server";
import { SupabaseHelper } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const { data: orders, error } = await SupabaseHelper.getUserOrders(session.userId, status || undefined);

  if (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 });
  }

  return NextResponse.json({ items: orders || [] });
}

export async function POST(req: NextRequest) {
  const session = await getSessionServer();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { requirement, depositAmount, guideId } = body;

  if (!requirement) {
    return NextResponse.json({ error: "Missing requirement" }, { status: 400 });
  }

  // 创建订单到Supabase
  const { data: order, error } = await SupabaseHelper.createOrder({
    user_id: session.userId,
    requirement,
    deposit_amount: depositAmount || 0,
    guide_id: guideId,
    status: guideId ? "GUIDE_SELECTED" : "DRAFT"
  });

  if (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  return NextResponse.json(order, { status: 201 });
}

