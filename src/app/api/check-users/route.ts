import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Checking users table...");
    
    // 查询users表中的现有用户
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, phone, name, role')
      .limit(10);

    if (error) {
      console.error("Users table query failed:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to query users table",
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Users table check completed",
      users: users || [],
      userCount: users?.length || 0
    });

  } catch (error) {
    console.error("Check users table error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check users table",
      details: error
    }, { status: 500 });
  }
}
