import { NextResponse } from "next/server";
import { supabaseAdmin, checkSupabaseConfig } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("=== 测试Supabase连接 ===");

    // 首先检查环境变量配置
    try {
      checkSupabaseConfig();
      console.log("✅ 环境变量配置正确");
    } catch (configError) {
      console.error("❌ 环境变量配置错误:", configError);
      return NextResponse.json({
        success: false,
        error: "环境变量配置错误",
        details: configError instanceof Error ? configError.message : String(configError),
        envCheck: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌",
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌",
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌"
        }
      }, { status: 500 });
    }

    // 测试基本连接
    console.log("🔗 测试数据库连接...");
    const { data, error, count } = await supabaseAdmin
      .from('guides')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ 连接测试失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }, { status: 500 });
    }

    console.log("✅ 连接测试成功，地陪总数:", count);

    // 额外测试：检查表结构
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('guides')
      .select('id, display_name')
      .limit(3);

    return NextResponse.json({
      success: true,
      message: "Supabase连接正常",
      totalCount: count,
      sampleData: data,
      tableAccessible: !tableError,
      sampleGuides: tableInfo,
      timestamp: new Date().toISOString(),
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

  } catch (error) {
    console.error('❌ 连接测试异常:', error);
    return NextResponse.json({
      success: false,
      error: "连接异常",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
