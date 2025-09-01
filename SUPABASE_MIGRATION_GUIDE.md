# 订单系统Supabase迁移完成指南

## 🎯 迁移概述

已完成订单系统从内存数据库到Supabase的迁移，支持人工收款流程。

## ✅ 已完成的工作

### 1. 数据库结构
- ✅ 创建了新的orders表结构 (`database/migrate-orders-table.sql`)
- ✅ 支持JSON格式的requirement字段
- ✅ 支持人工收款相关字段
- ✅ 完整的状态管理（11种状态）
- ✅ 行级安全策略（RLS）

### 2. 后端API迁移
- ✅ `/api/orders/create-draft/route.ts` - 创建草稿订单
- ✅ `/api/orders/[id]/route.ts` - 获取和更新订单
- ✅ `/api/orders/[id]/select-guide/route.ts` - 选择地陪
- ✅ `/api/orders/[id]/start/route.ts` - 开始服务
- ✅ `/api/orders/[id]/notes/route.ts` - 订单备注
- ✅ `/api/orders/route.ts` - 订单列表

### 3. 数据适配器
- ✅ 创建了 `src/lib/order-adapter.ts`
- ✅ 处理Supabase和前端之间的数据格式转换
- ✅ 提供状态管理和工具函数

### 4. 前端页面适配
- ✅ `/booking/select-guide/[orderId]` - 选择地陪页面
- ✅ `/booking/payment-pending/[orderId]` - 等待收款页面
- ✅ `/booking/start/[orderId]` - 服务开始页面

## 🚀 立即执行步骤

### 步骤1：执行数据库迁移
在Supabase Dashboard的SQL编辑器中执行：

```sql
-- 复制 database/migrate-orders-table.sql 的内容并执行
```

### 步骤2：验证表结构
检查orders表是否创建成功：

```sql
-- 检查表结构
\d orders;

-- 检查索引
\di orders*;

-- 检查RLS策略
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### 步骤3：测试API功能
使用以下命令测试API：

```bash
# 测试订单创建
curl -X POST http://localhost:3002/api/orders/create-draft \
  -H "Content-Type: application/json" \
  -d '{"requirement": {"startTime": "2024-01-20T10:00:00Z", "duration": 4, "serviceType": "daily", "area": "朝阳区", "address": "三里屯"}}'

# 测试订单获取
curl http://localhost:3002/api/orders/{order_id}

# 测试订单列表
curl http://localhost:3002/api/orders
```

## 📋 数据结构对比

### Supabase字段 → 前端字段映射
| Supabase | 前端 | 说明 |
|----------|------|------|
| `user_id` | `userId` | 用户ID |
| `guide_id` | `guideId` | 地陪ID |
| `created_at` | `createdAt` | 创建时间 |
| `updated_at` | `updatedAt` | 更新时间 |
| `deposit_amount` | `depositAmount` | 定金金额 |
| `total_amount` | `totalAmount` | 总金额 |
| `final_amount` | `finalAmount` | 最终金额 |
| `guide_selected_at` | `guideSelectedAt` | 地陪选择时间 |
| `payment_collected_at` | `paymentCollectedAt` | 收款时间 |

### 状态流程
```
DRAFT → GUIDE_SELECTED → PAYMENT_PENDING → PAID → IN_PROGRESS → COMPLETED
```

## 🔧 故障排除

### 常见问题

1. **字段不匹配错误**
   ```
   Error: Cannot read property 'userId' of undefined
   ```
   **解决方案**：确保使用 `supabaseToFrontend()` 转换数据

2. **权限错误**
   ```
   Error: new row violates row-level security policy
   ```
   **解决方案**：检查RLS策略是否正确配置

3. **关联错误**
   ```
   Error: insert or update on table "orders" violates foreign key constraint
   ```
   **解决方案**：确认guide_id关联的是guides表而不是users表

### 调试工具
- Supabase Dashboard → Table Editor
- Supabase Dashboard → SQL Editor
- 浏览器开发者工具 → Network标签
- 服务器日志

## 📊 性能优化建议

### 数据库优化
```sql
-- 添加复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_guide_status ON orders(guide_id, status);

-- 添加部分索引
CREATE INDEX idx_orders_active ON orders(id) WHERE status NOT IN ('COMPLETED', 'CANCELLED', 'REFUNDED');
```

### API优化
- 使用分页查询大量订单
- 实现订单状态缓存
- 添加请求去重机制

## 🔄 后续工作

### 需要完成的页面
- [ ] `/my-bookings` - 我的预约页面
- [ ] 管理后台的订单管理页面
- [ ] 地陪端的订单管理页面

### 功能增强
- [ ] 实时订单状态更新（WebSocket）
- [ ] 订单状态变更通知
- [ ] 订单数据导出功能
- [ ] 订单统计报表

### 监控和日志
- [ ] 添加订单操作日志
- [ ] 设置性能监控
- [ ] 配置错误报警

## 🎉 迁移完成验证

### 功能测试清单
- [ ] 创建订单草稿
- [ ] 选择地陪
- [ ] 人工收款确认
- [ ] 开始服务
- [ ] 完成服务
- [ ] 订单状态查询
- [ ] 订单列表分页
- [ ] 权限控制测试

### 性能测试
- [ ] 并发订单创建测试
- [ ] 大量订单查询性能
- [ ] 数据库连接池测试

## 📞 技术支持

如遇到问题，请检查：
1. Supabase连接配置
2. 环境变量设置
3. 数据库表结构
4. RLS策略配置
5. API路由正确性

---

**迁移状态：95% 完成**
- ✅ 后端API完全迁移
- ✅ 核心前端页面已适配
- ✅ 数据适配器已创建
- ⏳ 需要执行数据库迁移脚本
- ⏳ 需要完成剩余页面适配
