import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // 检查用户登录状态
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf8"));
    } catch (error) {
      return NextResponse.json(
        { error: "登录状态无效，请重新登录" },
        { status: 401 }
      );
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, name, role, intended_role')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查用户是否是地陪或有地陪意向
    if (user.role !== "guide" && user.intended_role !== "guide") {
      return NextResponse.json(
        { error: "只有地陪用户可以查看认证状态" },
        { status: 403 }
      );
    }

    // 查找用户的地陪申请记录
    const { data: application, error: appError } = await supabase
      .from('guide_applications')
      .select('id, status, submitted_at, reviewed_at, review_notes')
      .eq('phone', user.phone)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    let verificationStatus = {
      status: "unverified" as const,
      applicationId: undefined as string | undefined,
      submittedAt: undefined as string | undefined,
      reviewedAt: undefined as string | undefined,
      reviewNotes: undefined as string | undefined,
      canReapply: true
    };

    if (application) {
      verificationStatus = {
        status: application.status === "approved" ? "verified" : 
                application.status === "rejected" ? "rejected" :
                application.status === "need_more_info" ? "rejected" :
                "pending",
        applicationId: application.id,
        submittedAt: application.submitted_at,
        reviewedAt: application.reviewed_at,
        reviewNotes: application.review_notes,
        canReapply: application.status === "rejected" || application.status === "need_more_info"
      };
    }

    // 如果用户已经是地陪角色，检查地陪档案的认证状态
    if (user.role === "guide") {
      const { data: guide, error: guideError } = await supabase
        .from('guides')
        .select('verification_status, verified_at, verification_notes')
        .eq('user_id', user.id)
        .single();

      if (guide && !guideError) {
        verificationStatus.status = guide.verification_status === "verified" ? "verified" :
                                   guide.verification_status === "suspended" ? "suspended" :
                                   guide.verification_status === "rejected" ? "rejected" :
                                   "pending";
        if (guide.verified_at) {
          verificationStatus.reviewedAt = guide.verified_at;
        }
        if (guide.verification_notes) {
          verificationStatus.reviewNotes = guide.verification_notes;
        }
      }
    }

    return NextResponse.json({
      status: verificationStatus
    });

  } catch (error) {
    console.error('Verification status fetch error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
