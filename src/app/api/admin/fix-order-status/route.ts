import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await getSessionServer();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    console.log("开始修复订单状态约束...");

    // 执行数据库迁移 - 修复订单状态约束
    // 由于Supabase不支持exec_sql RPC，我们需要手动执行SQL
    // 这里我们将返回需要在Supabase控制台中手动执行的SQL语句

    const migrationSQL = `
-- 修复订单状态约束，添加缺失的状态
-- 请在Supabase控制台的SQL编辑器中执行以下语句

-- 1. 删除现有的状态约束
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. 添加完整的状态约束，包含所有需要的状态
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN (
  'pending', 'confirmed', 'guide_selected', 'in_progress', 'completed', 'cancelled',
  'DRAFT', 'GUIDE_SELECTED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID',
  'CONFIRMED', 'FINAL_PAYMENT_PENDING', 'PAID', 'IN_PROGRESS',
  'COMPLETED', 'CANCELLED', 'REFUNDED', 'REFUND_REJECTED'
));

-- 3. 确保退款相关字段存在
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refund_method VARCHAR(20) CHECK (refund_method IN ('alipay', 'wechat', 'bank_transfer'));

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refund_account_info JSONB;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_refund_method ON orders(refund_method);
CREATE INDEX IF NOT EXISTS idx_orders_refund_requested_at ON orders(refund_requested_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_refund ON orders(status) WHERE status IN ('CANCELLED', 'REFUNDED', 'REFUND_REJECTED');
`;

    // 尝试使用直接的数据库操作来添加字段
    const results = [];

    try {
      // 尝试添加退款方式字段
      const { error: error1 } = await supabaseAdmin
        .from('orders')
        .select('refund_method')
        .limit(1);

      if (error1 && error1.message.includes('column "refund_method" does not exist')) {
        results.push({
          step: "检查退款方式字段",
          success: false,
          error: "字段不存在，需要手动添加"
        });
      } else {
        results.push({
          step: "检查退款方式字段",
          success: true
        });
      }
    } catch (e) {
      results.push({
        step: "检查退款方式字段",
        success: false,
        error: "检查失败"
      });
    }

    try {
      // 尝试添加退款账户信息字段
      const { error: error2 } = await supabaseAdmin
        .from('orders')
        .select('refund_account_info')
        .limit(1);

      if (error2 && error2.message.includes('column "refund_account_info" does not exist')) {
        results.push({
          step: "检查退款账户信息字段",
          success: false,
          error: "字段不存在，需要手动添加"
        });
      } else {
        results.push({
          step: "检查退款账户信息字段",
          success: true
        });
      }
    } catch (e) {
      results.push({
        step: "检查退款账户信息字段",
        success: false,
        error: "检查失败"
      });
    }

    try {
      // 尝试添加退款申请时间字段
      const { error: error3 } = await supabaseAdmin
        .from('orders')
        .select('refund_requested_at')
        .limit(1);

      if (error3 && error3.message.includes('column "refund_requested_at" does not exist')) {
        results.push({
          step: "检查退款申请时间字段",
          success: false,
          error: "字段不存在，需要手动添加"
        });
      } else {
        results.push({
          step: "检查退款申请时间字段",
          success: true
        });
      }
    } catch (e) {
      results.push({
        step: "检查退款申请时间字段",
        success: false,
        error: "检查失败"
      });
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      message: `字段检查完成: ${successCount}/${totalCount} 字段存在`,
      results: results,
      migrationSQL: migrationSQL,
      instructions: "由于Supabase不支持动态SQL执行，请将上面的migrationSQL复制到Supabase控制台的SQL编辑器中手动执行",
      success: successCount === totalCount
    });

  } catch (error) {
    console.error("Fix order status API error:", error);
    return NextResponse.json({ 
      error: "服务器错误", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
