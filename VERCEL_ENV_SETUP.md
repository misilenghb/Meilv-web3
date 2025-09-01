# 🔧 Vercel 环境变量配置指南

## 🚨 **问题解决**

### 错误信息
```
Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist.
```

### 问题原因
在 `vercel.json` 中使用了 `@secret_name` 语法引用不存在的 Vercel Secrets。

## ✅ **解决方案**

### 方案1: 在 Vercel Dashboard 中配置环境变量（推荐）

#### 步骤1: 访问项目设置
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 `meilv-web`
3. 点击 **Settings** 标签
4. 在左侧菜单选择 **Environment Variables**

#### 步骤2: 添加环境变量
添加以下6个环境变量：

```
变量名: NEXT_PUBLIC_SUPABASE_URL
值: https://fauzguzoamyahhcqhvoc.supabase.co
环境: Production, Preview, Development

变量名: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjEyMjgsImV4cCI6MjA3MTkzNzIyOH0.HJ4By-4wXr8l_6G3sCpTaDTX63KLxm0DXkCOaO3vXv4
环境: Production, Preview, Development

变量名: SUPABASE_SERVICE_ROLE_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MTIyOCwiZXhwIjoyMDcxOTM3MjI4fQ.EVv6O37QEeY6ZshOVVHxOVK3NlNwFb1nQBNgroPxuKU
环境: Production, Preview, Development

变量名: NEXT_PUBLIC_SUPABASE_STORAGE_URL
值: https://fauzguzoamyahhcqhvoc.storage.supabase.co/storage/v1/s3
环境: Production, Preview, Development

变量名: SUPABASE_STORAGE_KEY_ID
值: 544474680de66be82cc3e308e0d95542
环境: Production, Preview, Development

变量名: SUPABASE_STORAGE_ACCESS_KEY
值: e307cb9f13b0df250f56838bc872b99c8b4a6773c2ccee94ad4d06c8471bc47a
环境: Production, Preview, Development
```

#### 步骤3: 保存并重新部署
1. 点击 **Save** 保存所有环境变量
2. 触发重新部署：
   - 方法1: 在 **Deployments** 标签中点击 **Redeploy**
   - 方法2: 推送新的代码到 GitHub

### 方案2: 使用 Vercel CLI 配置

#### 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 登录并链接项目
```bash
vercel login
vercel link
```

#### 添加环境变量
```bash
# 添加 Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 输入值: https://fauzguzoamyahhcqhvoc.supabase.co

# 添加 Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 输入值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjEyMjgsImV4cCI6MjA3MTkzNzIyOH0.HJ4By-4wXr8l_6G3sCpTaDTX63KLxm0DXkCOaO3vXv4

# 添加 Service Role Key
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 输入值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MTIyOCwiZXhwIjoyMDcxOTM3MjI4fQ.EVv6O37QEeY6ZshOVVHxOVK3NlNwFb1nQBNgroPxuKU

# 添加 Storage URL
vercel env add NEXT_PUBLIC_SUPABASE_STORAGE_URL production
# 输入值: https://fauzguzoamyahhcqhvoc.storage.supabase.co/storage/v1/s3

# 添加 Storage Key ID
vercel env add SUPABASE_STORAGE_KEY_ID production
# 输入值: 544474680de66be82cc3e308e0d95542

# 添加 Storage Access Key
vercel env add SUPABASE_STORAGE_ACCESS_KEY production
# 输入值: e307cb9f13b0df250f56838bc872b99c8b4a6773c2ccee94ad4d06c8471bc47a
```

#### 重新部署
```bash
vercel --prod
```

## 📋 **环境变量说明**

### 🔑 **必需的环境变量**

| 变量名 | 用途 | 环境 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 客户端 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | 客户端 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | 服务端 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_URL` | Supabase 存储 URL | 客户端 |
| `SUPABASE_STORAGE_KEY_ID` | 存储访问密钥 ID | 服务端 |
| `SUPABASE_STORAGE_ACCESS_KEY` | 存储访问密钥 | 服务端 |

### 🔒 **安全注意事项**

#### 客户端变量 (NEXT_PUBLIC_*)
- ✅ 可以在浏览器中访问
- ⚠️ 不要包含敏感信息
- 📝 用于客户端 Supabase 连接

#### 服务端变量
- 🔒 只在服务端可访问
- ✅ 可以包含敏感信息
- 📝 用于 API 路由和服务端操作

## 🔍 **验证配置**

### 检查环境变量是否生效
在您的 Next.js 应用中添加测试页面：

```typescript
// pages/api/test-env.ts 或 app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已配置' : '❌ 未配置',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置',
    storageUrl: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ? '✅ 已配置' : '❌ 未配置',
    storageKeyId: process.env.SUPABASE_STORAGE_KEY_ID ? '✅ 已配置' : '❌ 未配置',
    storageAccessKey: process.env.SUPABASE_STORAGE_ACCESS_KEY ? '✅ 已配置' : '❌ 未配置'
  });
}
```

访问 `https://your-domain.vercel.app/api/test-env` 检查配置状态。

## 🚀 **部署流程**

### 完整部署步骤
1. **配置环境变量**（按照上述方法）
2. **推送代码到 GitHub**
3. **Vercel 自动部署**
4. **验证部署结果**

### 常见问题解决

#### 问题1: 环境变量不生效
**解决方案**:
- 确保变量名拼写正确
- 检查是否选择了正确的环境（Production/Preview/Development）
- 重新部署项目

#### 问题2: Supabase 连接失败
**解决方案**:
- 验证 Supabase URL 和密钥是否正确
- 检查 Supabase 项目是否正常运行
- 确认密钥没有过期

#### 问题3: 存储功能不工作
**解决方案**:
- 验证存储 URL 和密钥配置
- 检查 Supabase 存储服务是否启用
- 确认存储权限配置正确

## 📊 **配置检查清单**

### ✅ **部署前检查**
- [ ] 所有6个环境变量已配置
- [ ] 变量值正确无误
- [ ] 选择了正确的部署环境
- [ ] vercel.json 配置正确
- [ ] 代码已推送到 GitHub

### ✅ **部署后验证**
- [ ] 应用可以正常访问
- [ ] Supabase 连接正常
- [ ] API 接口工作正常
- [ ] 用户认证功能正常
- [ ] 文件上传功能正常

## 🎯 **总结**

### 修复要点
1. **移除 vercel.json 中的环境变量引用**
2. **在 Vercel Dashboard 中手动配置环境变量**
3. **确保所有必需变量都已配置**
4. **重新部署验证配置**

### 最佳实践
- 使用 Vercel Dashboard 配置环境变量（最简单）
- 为不同环境配置相应的变量值
- 定期检查和更新密钥
- 保持环境变量的安全性

---

**🎉 按照此指南配置后，您的项目将能够成功部署到 Vercel！**
