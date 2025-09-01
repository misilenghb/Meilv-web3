import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionServer();
    
    return NextResponse.json({ 
      session: session,
      hasSession: !!session,
      role: session?.role || 'no role',
      isAdmin: session?.role === 'admin'
    });

  } catch (error) {
    console.error("Debug session error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
