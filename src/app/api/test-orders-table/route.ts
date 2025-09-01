import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Testing orders table...");
    
    // 测试orders表是否存在
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);

    if (ordersError) {
      console.error("Orders table test failed:", ordersError);
      return NextResponse.json({
        success: false,
        error: "Orders table not found or accessible",
        details: ordersError,
        message: "需要执行数据库迁移脚本"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Orders table exists and is accessible",
      ordersCount: ordersData?.length || 0
    });

  } catch (error) {
    console.error("Test orders table error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to test orders table",
      details: error
    }, { status: 500 });
  }
}
