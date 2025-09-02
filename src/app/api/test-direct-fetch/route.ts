import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== 直接Fetch测试Supabase ===");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "缺少环境变量"
      }, { status: 500 });
    }

    // 直接使用fetch调用Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/guides?select=id,display_name,verification_status&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'meilv-web-direct-fetch'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase API错误:', response.status, errorText);
      return NextResponse.json({
        success: false,
        error: `API调用失败: ${response.status}`,
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ 直接fetch成功，获取到数据:', data);

    return NextResponse.json({
      success: true,
      message: "直接fetch Supabase成功",
      data: data,
      count: data.length
    });

  } catch (error) {
    console.error('❌ 直接fetch失败:', error);
    return NextResponse.json({
      success: false,
      error: "直接fetch失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
