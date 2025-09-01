-- 添加退款渠道相关字段到orders表
-- 执行时间：2024年

-- 1. 添加退款渠道相关字段
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refund_method VARCHAR(20) CHECK (refund_method IN ('alipay', 'wechat', 'bank_transfer')),
ADD COLUMN IF NOT EXISTS refund_account_info JSONB,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;

-- 2. 添加字段注释
COMMENT ON COLUMN orders.refund_method IS '退款方式：alipay-支付宝, wechat-微信, bank_transfer-银行转账';
COMMENT ON COLUMN orders.refund_account_info IS '退款账户信息JSON：{account: 账号, name: 姓名, bank?: 银行名称}';
COMMENT ON COLUMN orders.refund_requested_at IS '退款申请时间';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_refund_method ON orders(refund_method);
CREATE INDEX IF NOT EXISTS idx_orders_refund_requested_at ON orders(refund_requested_at);

-- 4. 示例数据结构说明
/*
refund_account_info 字段的JSON结构：

支付宝：
{
  "account": "13800138000",  // 支付宝账号（手机号或邮箱）
  "name": "张三"             // 真实姓名
}

微信：
{
  "account": "wxid_abc123",  // 微信号
  "name": "张三"             // 真实姓名
}

银行转账：
{
  "account": "6222021234567890123",  // 银行卡号
  "name": "张三",                    // 户名
  "bank": "中国工商银行"             // 开户行
}
*/
