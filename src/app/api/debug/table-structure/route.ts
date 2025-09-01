import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 先尝试查询所有表
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    // 尝试查询 orders 表的第一行数据
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);

    // 尝试简单插入测试
    const testData = {
      id: crypto.randomUUID(),
      user_id: '51b99a67-dda7-405e-a411-2e75a7b8c773',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert([testData])
      .select()
      .single();

    return NextResponse.json({
      tables: tables || "Could not fetch tables",
      tablesError: tablesError?.message || null,
      ordersData: ordersData || "No data",
      ordersError: ordersError?.message || null,
      insertTest: insertTest || "Insert failed",
      insertError: insertError?.message || null
    });

  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json({
      error: "Debug failed",
      details: error.message
    }, { status: 500 });
  }
}
