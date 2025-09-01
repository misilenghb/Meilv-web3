import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("=== 测试Supabase连接 ===");
    
    // 简单的连接测试
    const { data, error } = await supabaseAdmin
      .from('guides')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('连接测试失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log("连接测试成功，地陪总数:", data);

    return NextResponse.json({
      success: true,
      message: "Supabase连接正常",
      count: data
    });

  } catch (error) {
    console.error('连接测试异常:', error);
    return NextResponse.json({
      success: false,
      error: "连接异常",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
