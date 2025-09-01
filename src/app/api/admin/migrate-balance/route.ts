import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionServer } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getSessionServer();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    const results = [];

    // 1. 添加用户余额字段
    try {
      const { error: balanceError } = await supabaseAdmin.rpc('exec_sql', {
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0;'
      });
      
      if (balanceError) {
        // 如果RPC不可用，尝试直接执行
        const { error: directError } = await supabaseAdmin
          .from('users')
          .select('balance')
          .limit(1);
        
        if (directError && directError.message.includes('column "balance" does not exist')) {
          results.push({ step: "添加余额字段", status: "需要手动执行", error: "请在Supabase SQL编辑器中执行迁移脚本" });
        } else {
          results.push({ step: "添加余额字段", status: "已存在或成功" });
        }
      } else {
        results.push({ step: "添加余额字段", status: "成功" });
      }
    } catch (error) {
      results.push({ step: "添加余额字段", status: "错误", error: error.message });
    }

    // 2. 创建余额变更记录表
    try {
      const { data: tableExists } = await supabaseAdmin
        .from('balance_transactions')
        .select('id')
        .limit(1);
      
      results.push({ step: "余额变更记录表", status: "已存在" });
    } catch (error) {
      if (error.message.includes('relation "balance_transactions" does not exist')) {
        results.push({ step: "余额变更记录表", status: "需要创建", error: "请在Supabase SQL编辑器中执行迁移脚本" });
      } else {
        results.push({ step: "余额变更记录表", status: "错误", error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: "数据库迁移检查完成",
      results,
      sqlScript: `
-- 请在Supabase SQL编辑器中执行以下SQL：

-- 添加用户余额字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0;

-- 添加余额变更记录表
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'payment', 'refund', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_order_id ON balance_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(type);
      `
    });

  } catch (error) {
    console.error("Migration check error:", error);
    return NextResponse.json(
      { error: "迁移检查失败", details: error.message },
      { status: 500 }
    );
  }
}
