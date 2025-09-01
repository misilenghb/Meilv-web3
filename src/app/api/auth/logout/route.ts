import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: "退出登录成功"
    });

    // 清除登录cookie
    response.cookies.set("ml_session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // 设置过期时间为过去的时间来删除cookie
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: "退出登录失败" },
      { status: 500 }
    );
  }
}

// 也支持GET请求，方便直接访问链接退出
export async function GET(request: NextRequest) {
  try {
    // 创建重定向响应到首页
    const response = NextResponse.redirect(new URL('/', request.url));

    // 清除登录cookie
    response.cookies.set("ml_session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

