import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // 检查 Supabase 配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl === 'https://placeholder.supabase.co' ||
        supabaseAnonKey === 'placeholder-key') {
      return NextResponse.json({
        error: "数据库配置错误，请检查环境变量"
      }, { status: 500 });
    }

    console.log("开始创建guide_applications表...");

    // 首先尝试直接插入一条测试数据来检查表是否存在
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // 临时UUID
      display_name: 'test',
      real_name: 'test',
      id_number: '123456789012345678',
      phone: '12345678901',
      city: 'test',
      address: 'test',
      bio: 'test',
      skills: ['test'],
      hourly_rate: 100,
      id_card_front: 'test',
      id_card_back: 'test',
      photos: ['test'],
      experience: 'test',
      motivation: 'test',
      emergency_contact: { name: 'test', phone: 'test', relationship: 'test' }
    };

    // 尝试插入测试数据
    const { error: insertError } = await supabaseAdmin
      .from('guide_applications')
      .insert([testData]);

    if (insertError) {
      console.log('表不存在或结构不匹配，错误:', insertError);
      
      return NextResponse.json({
        success: false,
        error: "guide_applications表不存在或结构不匹配",
        details: insertError.message,
        solution: "请在Supabase控制台中执行以下SQL创建表",
        sql: `
CREATE TABLE IF NOT EXISTS guide_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    display_name VARCHAR(100) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(18) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(10),
    age INTEGER,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    bio TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    available_services TEXT[],
    languages TEXT[] DEFAULT ARRAY['中文'],
    id_card_front TEXT NOT NULL,
    id_card_back TEXT NOT NULL,
    health_certificate TEXT,
    background_check TEXT,
    photos TEXT[] NOT NULL,
    experience TEXT NOT NULL,
    motivation TEXT NOT NULL,
    emergency_contact JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_guide_applications_user_id ON guide_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_applications_status ON guide_applications(status);
CREATE INDEX IF NOT EXISTS idx_guide_applications_phone ON guide_applications(phone);
CREATE INDEX IF NOT EXISTS idx_guide_applications_id_number ON guide_applications(id_number);
        `
      });
    }

    // 如果插入成功，删除测试数据
    await supabaseAdmin
      .from('guide_applications')
      .delete()
      .eq('display_name', 'test');

    return NextResponse.json({
      success: true,
      message: "guide_applications表已存在且结构正确",
      tableExists: true
    });

  } catch (error) {
    console.error('检查表结构错误:', error);
    return NextResponse.json(
      { 
        error: "检查表结构失败", 
        details: error.message,
        solution: "请检查Supabase连接和权限"
      },
      { status: 500 }
    );
  }
}
