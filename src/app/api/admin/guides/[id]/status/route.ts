import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

type GuideCertificationStatus = "verified" | "rejected" | "pending";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionServer();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { certificationStatus } = await req.json();

    const allowedStatuses: GuideCertificationStatus[] = ["verified", "rejected", "pending"];

    if (!allowedStatuses.includes(certificationStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 检查地陪是否存在
    const { data: guide, error: fetchError } = await supabase
      .from('guides')
      .select('id, verification_status')
      .eq('id', id)
      .single();

    if (fetchError || !guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // 更新地陪认证状态
    const updateData: any = {
      verification_status: certificationStatus,
      updated_at: new Date().toISOString()
    };

    // 如果状态变为verified，记录认证时间
    if (certificationStatus === "verified") {
      updateData.verified_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('guides')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: "更新状态失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: id,
      certificationStatus: certificationStatus,
      message: "状态更新成功"
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
