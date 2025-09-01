# 🔑 GitHub 部署密钥配置清单

## 📋 必需密钥列表

### 🗄️ Supabase 数据库配置 (必需)

```
密钥名称: NEXT_PUBLIC_SUPABASE_URL
密钥值: https://fauzguzoamyahhcqhvoc.supabase.co
说明: Supabase 项目 URL

密钥名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
密钥值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjEyMjgsImV4cCI6MjA3MTkzNzIyOH0.HJ4By-4wXr8l_6G3sCpTaDTX63KLxm0DXkCOaO3vXv4
说明: Supabase 匿名访问密钥

密钥名称: SUPABASE_SERVICE_ROLE_KEY
密钥值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MTIyOCwiZXhwIjoyMDcxOTM3MjI4fQ.EVv6O37QEeY6ZshOVVHxOVK3NlNwFb1nQBNgroPxuKU
说明: Supabase 服务端密钥（管理员权限）

密钥名称: NEXT_PUBLIC_SUPABASE_STORAGE_URL
密钥值: https://fauzguzoamyahhcqhvoc.storage.supabase.co/storage/v1/s3
说明: Supabase 存储服务 URL

密钥名称: SUPABASE_STORAGE_KEY_ID
密钥值: 544474680de66be82cc3e308e0d95542
说明: Supabase 存储访问密钥 ID

密钥名称: SUPABASE_STORAGE_ACCESS_KEY
密钥值: e307cb9f13b0df250f56838bc872b99c8b4a6773c2ccee94ad4d06c8471bc47a
说明: Supabase 存储访问密钥
```

### 🚀 Vercel 部署配置 (可选)

如果选择 Vercel 自动部署，需要添加：

```
密钥名称: VERCEL_TOKEN
密钥值: [从 Vercel Dashboard > Settings > Tokens 获取]
说明: Vercel API 访问令牌

密钥名称: VERCEL_ORG_ID
密钥值: [从 Vercel 项目设置获取]
说明: Vercel 组织 ID

密钥名称: VERCEL_PROJECT_ID
密钥值: [从 Vercel 项目设置获取]
说明: Vercel 项目 ID
```

### 🌐 Netlify 部署配置 (可选)

如果选择 Netlify 自动部署，需要添加：

```
密钥名称: NETLIFY_AUTH_TOKEN
密钥值: [从 Netlify User Settings > Applications 获取]
说明: Netlify API 访问令牌

密钥名称: NETLIFY_SITE_ID
密钥值: [从 Netlify 站点设置获取]
说明: Netlify 站点 ID
```

### 🖥️ 自定义服务器部署配置 (可选)

如果选择自定义服务器部署，需要添加：

```
密钥名称: SERVER_HOST
密钥值: [您的服务器 IP 地址]
说明: 服务器主机地址

密钥名称: SERVER_USER
密钥值: [SSH 用户名]
说明: 服务器登录用户名

密钥名称: SERVER_SSH_KEY
密钥值: [SSH 私钥内容]
说明: SSH 私钥（用于免密登录）

密钥名称: SERVER_PORT
密钥值: 22
说明: SSH 端口号（默认 22）
```

## 🛠️ 配置步骤

### 步骤 1: 访问 GitHub 仓库设置

1. 打开您的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中选择 **Secrets and variables** > **Actions**

### 步骤 2: 添加密钥

1. 点击 **New repository secret** 按钮
2. 输入密钥名称（如：`NEXT_PUBLIC_SUPABASE_URL`）
3. 输入密钥值
4. 点击 **Add secret** 保存
5. 重复以上步骤添加所有必需密钥

### 步骤 3: 验证配置

添加完所有密钥后，您的 Secrets 列表应该包含：

**必需密钥 (6个):**
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_STORAGE_URL
- ✅ SUPABASE_STORAGE_KEY_ID
- ✅ SUPABASE_STORAGE_ACCESS_KEY

**可选密钥 (根据部署平台选择):**
- 🔧 VERCEL_TOKEN (Vercel 部署)
- 🔧 VERCEL_ORG_ID (Vercel 部署)
- 🔧 VERCEL_PROJECT_ID (Vercel 部署)
- 🔧 NETLIFY_AUTH_TOKEN (Netlify 部署)
- 🔧 NETLIFY_SITE_ID (Netlify 部署)
- 🔧 SERVER_HOST (自定义服务器)
- 🔧 SERVER_USER (自定义服务器)
- 🔧 SERVER_SSH_KEY (自定义服务器)
- 🔧 SERVER_PORT (自定义服务器)

## 🚀 部署流程

配置完密钥后，部署流程如下：

1. **推送代码到 main 分支**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **GitHub Actions 自动触发**
   - 检出代码
   - 安装依赖
   - 创建环境变量文件
   - 构建项目
   - 部署到指定平台

3. **查看部署状态**
   - 访问 GitHub 仓库的 **Actions** 标签
   - 查看工作流运行状态
   - 检查部署日志

## 🔍 故障排除

### 常见问题

1. **密钥配置错误**
   ```
   错误: Environment variable not found
   解决: 检查密钥名称是否正确，值是否完整
   ```

2. **Supabase 连接失败**
   ```
   错误: Invalid API key
   解决: 验证 Supabase 密钥是否正确且未过期
   ```

3. **部署平台认证失败**
   ```
   错误: Authentication failed
   解决: 检查部署平台的 API 令牌是否有效
   ```

### 调试命令

```bash
# 检查 GitHub Actions 日志
# 在 GitHub 仓库的 Actions 标签页查看

# 本地测试环境变量
npm run build

# 验证 Supabase 连接
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://fauzguzoamyahhcqhvoc.supabase.co/rest/v1/users?select=*&limit=1"
```

## 🔒 安全建议

1. **定期轮换密钥**
   - 每 3-6 个月更新 API 密钥
   - 监控密钥使用情况

2. **最小权限原则**
   - 只授予必要的权限
   - 使用专用的部署账户

3. **监控和审计**
   - 启用 GitHub 审计日志
   - 监控异常部署活动

## 📞 获取帮助

如果遇到配置问题：

1. 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 详细指南
2. 检查 GitHub Actions 工作流日志
3. 参考各平台官方文档
4. 在项目仓库创建 Issue

---

**🎉 配置完成后，您的项目将支持自动化部署！**
