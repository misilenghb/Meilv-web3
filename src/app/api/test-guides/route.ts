import { NextResponse } from "next/server";

export async function GET() {
  const testData = {
    items: [
      {
        id: "test-1",
        displayName: "测试地陪小美",
        bio: "这是一个测试地陪，用于验证中文字符编码是否正常。",
        city: "杭州",
        skills: ["景点讲解", "美食推荐"],
        hourlyRate: 200,
        ratingAvg: 4.8,
        ratingCount: 100
      }
    ]
  };

  const response = NextResponse.json(testData);
  response.headers.set('Content-Type', 'application/json; charset=utf-8');
  return response;
}
