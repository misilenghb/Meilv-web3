import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("开始执行订单表迁移...");

    // 只更新现有的错误数据，不修改表结构
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        total_amount: 0,
        hourly_rate: 0
      })
      .eq('total_amount', 200)
      .is('guide_id', null)
      .select();

    if (updateError) {
      console.error("更新数据失败:", updateError);
      return NextResponse.json(
        { error: "更新数据失败", details: updateError },
        { status: 500 }
      );
    }

    console.log("迁移完成，更新了", updateResult?.length || 0, "条记录");

    return NextResponse.json({
      message: "订单表迁移成功",
      updatedRecords: updateResult?.length || 0,
      updatedOrders: updateResult
    });

  } catch (error) {
    console.error("迁移过程中出现错误:", error);
    return NextResponse.json(
      { error: "迁移失败", details: error },
      { status: 500 }
    );
  }
}
