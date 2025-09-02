import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseFetch, checkSupabaseConfig } from "@/lib/supabase-fixed";

export async function GET() {
  try {
    console.log("=== 测试修复版Supabase连接 ===");
    
    // 检查配置
    try {
      checkSupabaseConfig();
      console.log("✅ 环境变量配置正确");
    } catch (configError) {
      return NextResponse.json({
        success: false,
        error: "环境变量配置错误",
        details: configError instanceof Error ? configError.message : String(configError)
      }, { status: 500 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // 测试1: 使用修复版Supabase客户端
    try {
      console.log("🔗 测试修复版Supabase客户端...");
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('guides')
        .select('id, display_name, verification_status')
        .limit(3);

      if (clientError) {
        results.tests.supabaseClient = {
          success: false,
          error: clientError.message,
          details: clientError
        };
      } else {
        results.tests.supabaseClient = {
          success: true,
          data: clientData,
          count: clientData?.length || 0
        };
      }
    } catch (error) {
      results.tests.supabaseClient = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // 测试2: 使用备用fetch方案
    try {
      console.log("🔗 测试备用fetch方案...");
      const { data: fetchData, error: fetchError } = await supabaseFetch.select(
        'guides',
        'id,display_name,verification_status',
        { limit: 3, useServiceKey: true }
      );

      if (fetchError) {
        results.tests.supabaseFetch = {
          success: false,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError)
        };
      } else {
        results.tests.supabaseFetch = {
          success: true,
          data: fetchData,
          count: fetchData?.length || 0
        };
      }
    } catch (error) {
      results.tests.supabaseFetch = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // 测试3: 获取统计信息
    try {
      console.log("📊 获取数据库统计信息...");
      const { data: statsData, error: statsError } = await supabaseFetch.select(
        'guides',
        'verification_status',
        { useServiceKey: true }
      );

      if (!statsError && statsData) {
        const stats = statsData.reduce((acc, guide) => {
          acc[guide.verification_status] = (acc[guide.verification_status] || 0) + 1;
          return acc;
        }, {});

        results.tests.statistics = {
          success: true,
          totalGuides: statsData.length,
          statusBreakdown: stats
        };
      } else {
        results.tests.statistics = {
          success: false,
          error: statsError instanceof Error ? statsError.message : String(statsError)
        };
      }
    } catch (error) {
      results.tests.statistics = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // 判断整体成功状态
    const hasSuccessfulTest = Object.values(results.tests).some((test: any) => test.success);

    return NextResponse.json({
      success: hasSuccessfulTest,
      message: hasSuccessfulTest ? "至少一种连接方式成功" : "所有连接方式都失败",
      results
    });

  } catch (error) {
    console.error('❌ 测试修复版Supabase失败:', error);
    return NextResponse.json({
      success: false,
      error: "测试失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
