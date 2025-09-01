-- 修复订单状态约束，添加缺失的状态
-- 执行时间：2024年

-- 1. 删除现有的状态约束
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. 添加完整的状态约束，包含所有需要的状态
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  -- 旧的小写状态（向后兼容）
  'pending', 'confirmed', 'guide_selected', 'in_progress', 'completed', 'cancelled',
  -- 新的大写状态
  'DRAFT', 'GUIDE_SELECTED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 
  'CONFIRMED', 'FINAL_PAYMENT_PENDING', 'PAID', 'IN_PROGRESS', 
  'COMPLETED', 'CANCELLED', 'REFUNDED', 'REFUND_REJECTED'
));

-- 3. 确保退款相关字段存在
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refund_method VARCHAR(20) CHECK (refund_method IN ('alipay', 'wechat', 'bank_transfer')),
ADD COLUMN IF NOT EXISTS refund_account_info JSONB,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;

-- 4. 添加字段注释
COMMENT ON COLUMN orders.refund_method IS '退款方式：alipay-支付宝, wechat-微信, bank_transfer-银行转账';
COMMENT ON COLUMN orders.refund_account_info IS '退款账户信息JSON：{account: 账号, name: 姓名, bank?: 银行名称}';
COMMENT ON COLUMN orders.refund_requested_at IS '退款申请时间';

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_refund_method ON orders(refund_method);
CREATE INDEX IF NOT EXISTS idx_orders_refund_requested_at ON orders(refund_requested_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_refund ON orders(status) WHERE status IN ('CANCELLED', 'REFUNDED', 'REFUND_REJECTED');
