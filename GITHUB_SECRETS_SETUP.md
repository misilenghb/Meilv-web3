# 🔐 GitHub Secrets 配置指南

本指南将帮助您在 GitHub 仓库中配置 Cloudflare Workers 自动部署所需的密钥和环境变量。

## 📋 必需的 Secrets

### 1. Cloudflare 相关
- `CLOUDFLARE_API_TOKEN` - Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare 账户 ID

### 2. Supabase 相关
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥

## 🔧 获取 Cloudflare 配置

### 1. 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在右侧边栏找到 "Account ID"
3. 复制 Account ID

### 2. 创建 API Token

1. 进入 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 选择 "Custom token" 模板
4. 配置权限：
   ```
   Account: Cloudflare Workers:Edit
   Zone: Zone:Read (如果使用自定义域名)
   ```
5. 设置 Account Resources: Include - Your Account
6. 设置 Zone Resources: Include - All zones (或特定域名)
7. 点击 "Continue to summary"
8. 点击 "Create Token"
9. 复制生成的 Token（只显示一次）

## 🗄️ 获取 Supabase 配置

### 1. 获取项目信息

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 Settings > API

### 2. 复制必要信息

- **Project URL**: 在 "Project URL" 部分
- **Anon Key**: 在 "Project API keys" 部分的 "anon public"
- **Service Role Key**: 在 "Project API keys" 部分的 "service_role"

⚠️ **注意**: Service Role Key 具有管理员权限，请妥善保管！

## ⚙️ 在 GitHub 中设置 Secrets

### 1. 进入仓库设置

1. 打开您的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中选择 "Secrets and variables" > "Actions"

### 2. 添加 Repository Secrets

点击 "New repository secret" 并添加以下密钥：

#### Cloudflare 配置
```
Name: CLOUDFLARE_API_TOKEN
Value: [您的 Cloudflare API Token]

Name: CLOUDFLARE_ACCOUNT_ID
Value: [您的 Cloudflare Account ID]
```

#### Supabase 配置
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [您的 Supabase Anon Key]

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [您的 Supabase Service Role Key]
```

## 🔍 验证配置

### 1. 检查 Secrets

确保所有必需的 secrets 都已添加：

- ✅ CLOUDFLARE_API_TOKEN
- ✅ CLOUDFLARE_ACCOUNT_ID
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### 2. 测试部署

1. 创建一个测试分支
2. 推送到 GitHub
3. 检查 Actions 标签页
4. 查看工作流是否成功运行

## 🚀 触发自动部署

### 部署到预览环境
- 创建 Pull Request 到 `main` 分支
- GitHub Actions 将自动部署到开发环境

### 部署到生产环境
- 合并 Pull Request 到 `main` 分支
- GitHub Actions 将自动部署到生产环境

## 🔧 高级配置

### 环境特定的 Secrets

如果您需要为不同环境设置不同的值：

1. 进入 "Environments" 设置
2. 创建环境（如 "production", "development"）
3. 为每个环境设置特定的 secrets

### 自定义域名配置

如果您使用自定义域名：

1. 在 Cloudflare Dashboard 中添加域名
2. 配置 DNS 记录
3. 在 `wrangler.toml` 中添加路由配置

## 🛡️ 安全最佳实践

### 1. 权限最小化
- API Token 只授予必要的权限
- 定期轮换 API Token
- 监控 API Token 使用情况

### 2. 密钥管理
- 不要在代码中硬编码密钥
- 使用 GitHub Secrets 存储敏感信息
- 定期审查和更新密钥

### 3. 访问控制
- 限制仓库访问权限
- 使用分支保护规则
- 启用双因素认证

## 🚨 故障排除

### 常见错误

1. **API Token 权限不足**
   ```
   Error: Insufficient permissions
   解决: 检查 API Token 权限配置
   ```

2. **Account ID 错误**
   ```
   Error: Account not found
   解决: 验证 Account ID 是否正确
   ```

3. **Supabase 连接失败**
   ```
   Error: Invalid API key
   解决: 检查 Supabase URL 和密钥
   ```

### 调试步骤

1. 检查 GitHub Actions 日志
2. 验证所有 secrets 是否正确设置
3. 测试 Cloudflare API Token 权限
4. 验证 Supabase 连接

## 📞 获取帮助

如果您在配置过程中遇到问题：

1. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 创建 Issue 寻求帮助

---

**重要提醒**: 请妥善保管您的 API 密钥，不要与他人分享或在公开场所泄露！
