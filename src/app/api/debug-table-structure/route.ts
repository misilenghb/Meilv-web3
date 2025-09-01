import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Checking table structure...");
    
    // 尝试查询表结构
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Table query error:", error);
      return NextResponse.json({ 
        error: "Table query failed", 
        details: error 
      }, { status: 500 });
    }
    
    // 尝试插入一个测试记录来看看哪些字段是必需的
    const testData = {
      id: crypto.randomUUID(),
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      service_type: 'daily',
      service_title: '测试服务',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      duration_hours: 4,
      hourly_rate: 200,
      total_amount: 800,
      status: 'pending',
      payment_status: 'pending',
      location: '测试地点',
      notes: '测试备注',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert([testData])
      .select()
      .single();
    
    if (insertError) {
      console.error("Insert test failed:", insertError);
      return NextResponse.json({ 
        error: "Insert test failed", 
        details: insertError,
        testData 
      }, { status: 500 });
    }
    
    // 删除测试记录
    await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', testData.id);
    
    return NextResponse.json({ 
      message: "Table structure test successful",
      sampleData: data,
      insertTest: insertData
    });
    
  } catch (error) {
    console.error("Debug table structure error:", error);
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error.message 
    }, { status: 500 });
  }
}
