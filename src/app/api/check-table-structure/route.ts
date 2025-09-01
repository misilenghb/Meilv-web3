import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Checking table structure...");
    
    // 尝试查询orders表的结构
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Table structure check failed:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to check table structure",
        details: error
      }, { status: 500 });
    }

    // 检查是否有数据
    const hasData = data && data.length > 0;
    
    return NextResponse.json({
      success: true,
      message: "Table structure check completed",
      hasData,
      sampleData: hasData ? data[0] : null,
      tableExists: true
    });

  } catch (error) {
    console.error("Check table structure error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check table structure",
      details: error
    }, { status: 500 });
  }
}
