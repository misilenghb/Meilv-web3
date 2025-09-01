import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    console.log("Creating test user...");
    
    const testUserId = "550e8400-e29b-41d4-a716-446655440000";
    
    // 先检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', testUserId)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Test user already exists",
        userId: testUserId
      });
    }

    // 创建测试用户
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: testUserId,
        phone: "13800000000",
        name: "测试用户",
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("Create test user error:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to create test user",
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: user
    });

  } catch (error) {
    console.error("Create test user error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create test user",
      details: error
    }, { status: 500 });
  }
}
