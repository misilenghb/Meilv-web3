import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get("guideId");
    const userId = searchParams.get("userId");

    if (!guideId) {
      const response = NextResponse.json(
        { error: "地陪ID必填" },
        { status: 400 }
      );
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      return response;
    }

    // For now, return mock permission data
    // In a real implementation, you would check if the user has completed a booking with this guide
    const hasPermission = true; // Mock: allow all users to review for now
    
    const response = NextResponse.json({
      hasPermission,
      canReview: hasPermission,
      message: hasPermission ? "可以评价" : "您需要完成预订后才能评价"
    });
    
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;

  } catch (error) {
    console.error('API error:', error);
    const response = NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }
}
