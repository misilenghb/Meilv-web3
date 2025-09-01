import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 尝试刷新Supabase schema缓存
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase configuration"
      }, { status: 500 });
    }

    // 发送NOTIFY pgrst, 'reload schema' 来刷新PostgREST缓存
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/notify_pgrst_reload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey
      }
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Schema cache refresh requested"
      });
    } else {
      // 如果上面的方法不行，尝试直接查询新表来触发缓存更新
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=id&limit=1`, {
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceKey
        }
      });

      return NextResponse.json({
        success: true,
        message: "Schema cache refresh attempted via table query",
        testResponse: testResponse.status
      });
    }

  } catch (error) {
    console.error("Schema refresh error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to refresh schema",
      details: error
    }, { status: 500 });
  }
}
