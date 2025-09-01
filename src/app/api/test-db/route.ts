import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // 测试基本连接
    const { data: testData, error: testError } = await supabaseAdmin
      .from('guides')
      .select('id')
      .limit(1);

    if (testError) {
      console.error("Database connection test failed:", testError);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: testError
      }, { status: 500 });
    }

    // 获取所有地陪数据
    const { data: allGuides, error: guidesError } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        display_name,
        verification_status,
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (guidesError) {
      console.error("Failed to fetch guides:", guidesError);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch guides",
        details: guidesError
      }, { status: 500 });
    }

    // 获取已认证且活跃的地陪
    const { data: verifiedGuides, error: verifiedError } = await supabaseAdmin
      .from('guides')
      .select(`
        id,
        display_name,
        verification_status,
        is_active
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified');

    if (verifiedError) {
      console.error("Failed to fetch verified guides:", verifiedError);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch verified guides",
        details: verifiedError
      }, { status: 500 });
    }

    const stats = {
      total: allGuides?.length || 0,
      verified: allGuides?.filter(g => g.verification_status === 'verified').length || 0,
      active: allGuides?.filter(g => g.is_active).length || 0,
      verifiedAndActive: verifiedGuides?.length || 0,
      pending: allGuides?.filter(g => g.verification_status === 'pending').length || 0,
      rejected: allGuides?.filter(g => g.verification_status === 'rejected').length || 0
    };

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      stats,
      allGuides: allGuides?.map(g => ({
        id: g.id,
        displayName: g.display_name,
        verificationStatus: g.verification_status,
        isActive: g.is_active,
        createdAt: g.created_at
      })),
      verifiedGuides: verifiedGuides?.map(g => ({
        id: g.id,
        displayName: g.display_name,
        verificationStatus: g.verification_status,
        isActive: g.is_active
      }))
    });

  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
