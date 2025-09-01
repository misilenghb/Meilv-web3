import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Checking guides table...");
    
    // 简单查询guides表
    const { data: guides, error } = await supabaseAdmin
      .from('guides')
      .select('id')
      .limit(1);

    if (error) {
      console.error("Guides table query failed:", error);
      return NextResponse.json({
        success: false,
        error: "Guides table not found or accessible",
        details: error,
        message: "需要创建guides表"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Guides table exists and is accessible",
      guidesCount: guides?.length || 0
    });

  } catch (error) {
    console.error("Check guides table error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check guides table",
      details: error
    }, { status: 500 });
  }
}
