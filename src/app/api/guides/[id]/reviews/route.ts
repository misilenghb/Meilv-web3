import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // For now, return mock review data since we haven't implemented the review system yet
    const mockReviews = [
      {
        id: "review-1",
        userId: "user-1",
        userName: "张三",
        userAvatar: null,
        rating: 5,
        comment: "服务非常好，地陪很专业，推荐的地方都很不错！",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: "local_tour"
      },
      {
        id: "review-2",
        userId: "user-2",
        userName: "李四",
        userAvatar: null,
        rating: 4,
        comment: "整体体验不错，地陪很热情，就是时间安排有点紧。",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: "daily"
      },
      {
        id: "review-3",
        userId: "user-3",
        userName: "王五",
        userAvatar: null,
        rating: 5,
        comment: "超级棒的体验！地陪很有耐心，介绍的很详细。",
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: "mild_entertainment"
      }
    ];

    const response = NextResponse.json({
      items: mockReviews,
      total: mockReviews.length,
      averageRating: 4.7,
      ratingDistribution: {
        5: 2,
        4: 1,
        3: 0,
        2: 0,
        1: 0
      }
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
