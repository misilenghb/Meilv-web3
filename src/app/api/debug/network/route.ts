import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== 网络连接诊断 ===");
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        runtime: typeof process !== 'undefined' ? 'Node.js' : 'Edge',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
      },
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')
      },
      networkTests: {}
    };

    // 测试1: 基本DNS解析
    try {
      const dnsTest = await fetch('https://www.google.com', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      diagnostics.networkTests.dns = {
        success: dnsTest.ok,
        status: dnsTest.status
      };
    } catch (error) {
      diagnostics.networkTests.dns = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // 测试2: Supabase域名连接
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
        const supabaseTest = await fetch(`${supabaseUrl.origin}/rest/v1/`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000),
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'User-Agent': 'meilv-web-diagnostic'
          }
        });
        
        diagnostics.networkTests.supabase = {
          success: supabaseTest.ok,
          status: supabaseTest.status,
          headers: Object.fromEntries(supabaseTest.headers.entries())
        };
      } catch (error) {
        diagnostics.networkTests.supabase = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // 测试3: 简单的Supabase API调用
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const apiTest = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/guides?select=count&limit=1`, {
          method: 'GET',
          signal: AbortSignal.timeout(15000),
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'meilv-web-diagnostic'
          }
        });

        const responseText = await apiTest.text();
        
        diagnostics.networkTests.supabaseApi = {
          success: apiTest.ok,
          status: apiTest.status,
          response: responseText.substring(0, 200), // 限制响应长度
          headers: Object.fromEntries(apiTest.headers.entries())
        };
      } catch (error) {
        diagnostics.networkTests.supabaseApi = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error('网络诊断失败:', error);
    return NextResponse.json({
      success: false,
      error: "网络诊断失败",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
