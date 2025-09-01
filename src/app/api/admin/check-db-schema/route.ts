import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查orders表的列结构
    const { data: columns, error } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'orders')
      .eq('table_schema', 'public');

    if (error) {
      console.error("Check schema error:", error);
      return NextResponse.json({ error: "检查数据库结构失败" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "数据库结构检查完成",
      columns: columns
    });

  } catch (error) {
    console.error("Check DB schema API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
