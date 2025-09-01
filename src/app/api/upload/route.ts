import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateUniqueFileName, validateFileType, validateFileSize } from "@/lib/storage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 允许的文件类型
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

// 最大文件大小 (MB)
const MAX_IMAGE_SIZE = 10;
const MAX_DOCUMENT_SIZE = 20;

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'image' | 'document'
    const category = formData.get('category') as string; // 'id-card' | 'photo' | 'certificate'

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    let allowedTypes: string[];
    let maxSize: number;

    if (fileType === 'image') {
      allowedTypes = ALLOWED_IMAGE_TYPES;
      maxSize = MAX_IMAGE_SIZE;
    } else if (fileType === 'document') {
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
      maxSize = MAX_DOCUMENT_SIZE;
    } else {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { error: `不支持的文件格式，请上传 ${allowedTypes.join(', ')} 格式的文件` },
        { status: 400 }
      );
    }

    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        { error: `文件大小不能超过 ${maxSize}MB` },
        { status: 400 }
      );
    }

    // 生成文件路径
    const fileName = generateUniqueFileName(file.name, `${sessionData.userId}_`);
    const filePath = `${category}/${fileName}`;

    // 上传到Supabase Storage
    const { data, error } = await supabase.storage
      .from('guide-applications')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: "文件上传失败，请重试" },
        { status: 500 }
      );
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from('guide-applications')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 检查用户权限
    const sessionCookie = request.cookies.get("ml_session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: "缺少文件路径" },
        { status: 400 }
      );
    }

    // 删除文件
    const { error } = await supabase.storage
      .from('guide-applications')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return NextResponse.json(
        { error: "文件删除失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "文件删除成功"
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
