# Supabase 数据库配置指南

## ✅ 已完成的配置

1. **环境变量已配置**
   - NEXT_PUBLIC_SUPABASE_URL: https://fauzguzoamyahhcqhvoc.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: 已配置

2. **Supabase连接测试通过**
   - 运行 `node scripts/test-supabase.js` 确认连接正常

## 🔧 需要完成的步骤

### 1. 创建数据库表

请按照以下步骤在Supabase中创建必要的数据库表：

1. **打开Supabase SQL编辑器**
   - 访问：https://fauzguzoamyahhcqhvoc.supabase.co/project/fauzguzoamyahhcqhvoc/sql

2. **执行SQL脚本**
   - 复制 `database/basic-tables.sql` 文件的内容
   - 粘贴到SQL编辑器中
   - 点击"Run"按钮执行

3. **验证表创建**
   - 执行完成后，检查是否创建了以下表：
     - `users` - 用户表
     - `guide_applications` - 地陪申请表
     - `guides` - 地陪表

### 2. 验证配置

创建表后，运行以下命令验证配置：

```bash
node scripts/test-supabase.js
```

如果看到 "✅ Connection successful! Users table exists." 说明配置成功。

### 3. 启动应用

```bash
npm run dev
```

应用将在 http://localhost:3001 启动。

## 📋 功能测试清单

创建表后，您可以测试以下功能：

- [ ] 用户注册 (http://localhost:3001/register)
- [ ] 地陪申请 (http://localhost:3001/apply-guide)
- [ ] 地陪工作台 (http://localhost:3001/guide-dashboard)
- [ ] 管理员审核 (http://localhost:3001/admin/applications)

## 🔑 获取Service Role Key（可选）

如果需要完整的管理员功能，请获取Service Role Key：

1. 在Supabase项目设置中找到API Keys
2. 复制 `service_role` key
3. 添加到 `.env.local` 文件：
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 🛠️ 故障排除

### 问题：API返回404错误
- **原因**：表未创建或RLS策略过于严格
- **解决**：确保执行了 `database/basic-tables.sql` 脚本

### 问题：权限错误
- **原因**：RLS策略阻止了操作
- **解决**：检查SQL脚本中的RLS策略设置

### 问题：连接失败
- **原因**：环境变量配置错误
- **解决**：检查 `.env.local` 文件中的URL和Key

## 📞 支持

如果遇到问题，请检查：
1. Supabase项目是否正常运行
2. 环境变量是否正确配置
3. 数据库表是否成功创建
4. RLS策略是否正确设置
