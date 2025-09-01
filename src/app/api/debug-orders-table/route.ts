import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Debugging orders table structure...");
    
    // 尝试直接查询orders表看看实际的结构
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Orders table query failed:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to query orders table",
        details: error
      }, { status: 500 });
    }

    // 尝试插入一个最小的测试记录来看看需要哪些字段
    const testInsert = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: 'test-user-id',
        requirement: { test: 'data' }
      }])
      .select();

    if (testInsert.error) {
      console.error("Test insert failed:", testInsert.error);
      return NextResponse.json({
        success: false,
        error: "Test insert failed",
        details: testInsert.error,
        existingData: data
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Orders table debug completed",
      existingData: data,
      testInsertResult: testInsert.data
    });

  } catch (error) {
    console.error("Debug orders table error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to debug orders table",
      details: error
    }, { status: 500 });
  }
}
