# 🚀 GitHub 部署密钥配置指南

## 📋 概览

本指南将帮助您配置 GitHub 仓库的部署密钥，实现自动化部署到 Vercel、Netlify 或自定义服务器。

## 🔑 必需的 GitHub Secrets

### 1. Supabase 配置密钥 (必需)

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：

```
NEXT_PUBLIC_SUPABASE_URL
值: https://fauzguzoamyahhcqhvoc.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjEyMjgsImV4cCI6MjA3MTkzNzIyOH0.HJ4By-4wXr8l_6G3sCpTaDTX63KLxm0DXkCOaO3vXv4

SUPABASE_SERVICE_ROLE_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXpndXpvYW15YWhoY3Fodm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2MTIyOCwiZXhwIjoyMDcxOTM3MjI4fQ.EVv6O37QEeY6ZshOVVHxOVK3NlNwFb1nQBNgroPxuKU

NEXT_PUBLIC_SUPABASE_STORAGE_URL
值: https://fauzguzoamyahhcqhvoc.storage.supabase.co/storage/v1/s3

SUPABASE_STORAGE_KEY_ID
值: 544474680de66be82cc3e308e0d95542

SUPABASE_STORAGE_ACCESS_KEY
值: e307cb9f13b0df250f56838bc872b99c8b4a6773c2ccee94ad4d06c8471bc47a
```

### 2. Vercel 部署密钥 (可选)

如果使用 Vercel 部署，需要添加：

```
VERCEL_TOKEN
值: 从 Vercel Dashboard > Settings > Tokens 获取

VERCEL_ORG_ID
值: 从 Vercel 项目设置中获取

VERCEL_PROJECT_ID
值: 从 Vercel 项目设置中获取
```

### 3. 自定义服务器部署密钥 (可选)

如果部署到自定义服务器，需要添加：

```
SERVER_HOST
值: 您的服务器 IP 地址

SERVER_USER
值: SSH 用户名

SERVER_SSH_KEY
值: SSH 私钥内容

SERVER_PORT
值: SSH 端口 (默认 22)
```

## 🛠️ 配置步骤

### 步骤 1: 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库
2. 将本地代码推送到仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/meilv-web.git
git push -u origin main
```

### 步骤 2: 配置 GitHub Secrets

1. 进入 GitHub 仓库页面
2. 点击 Settings 标签
3. 在左侧菜单中选择 "Secrets and variables" > "Actions"
4. 点击 "New repository secret"
5. 逐一添加上述密钥

### 步骤 3: 验证 GitHub Actions

1. 推送代码到 main 分支
2. 查看 Actions 标签页
3. 确认部署工作流正常运行

## 🔧 部署选项

### 选项 1: Vercel 部署 (推荐)

**优势:**
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 无服务器函数支持

**配置:**
1. 在 Vercel 中导入 GitHub 仓库
2. 配置环境变量
3. 启用自动部署

### 选项 2: Netlify 部署

**优势:**
- 简单易用
- 免费额度充足
- 表单处理功能

**配置:**
1. 在 Netlify 中连接 GitHub 仓库
2. 设置构建命令: `npm run build`
3. 设置发布目录: `.next`

### 选项 3: 自定义服务器部署

**优势:**
- 完全控制
- 可自定义配置
- 适合企业环境

**要求:**
- Linux 服务器
- Node.js 18+
- PM2 或类似进程管理器

## 📁 部署文件说明

### `.github/workflows/deploy.yml`
GitHub Actions 工作流配置文件，定义了自动部署流程。

### `vercel.json`
Vercel 部署配置文件，包含路由和环境变量设置。

### `.env.example`
环境变量示例文件，用于本地开发参考。

### `.gitignore`
Git 忽略文件配置，确保敏感信息不被提交。

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确设置
   - 确认 Node.js 版本兼容性
   - 查看构建日志中的错误信息

2. **API 调用失败**
   - 验证 Supabase 密钥是否正确
   - 检查 Supabase 项目是否正常运行
   - 确认 API 路由配置正确

3. **部署超时**
   - 检查依赖包大小
   - 优化构建过程
   - 考虑使用缓存策略

### 调试命令

```bash
# 本地构建测试
npm run build

# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# 验证 API 连接
curl -X GET "https://your-domain.com/api/test-connection"
```

## 🔒 安全注意事项

1. **密钥管理**
   - 不要在代码中硬编码密钥
   - 定期轮换敏感密钥
   - 使用最小权限原则

2. **环境隔离**
   - 生产和开发环境使用不同密钥
   - 限制 API 密钥的访问权限
   - 监控异常访问

3. **备份策略**
   - 定期备份数据库
   - 保存密钥的安全副本
   - 制定灾难恢复计划

## 📞 支持

如果在部署过程中遇到问题：

1. 查看 GitHub Actions 日志
2. 检查部署平台的错误信息
3. 参考官方文档
4. 创建 Issue 寻求帮助

## 🎯 下一步

部署成功后，您可以：

1. 配置自定义域名
2. 设置监控和日志
3. 优化性能
4. 添加更多功能

---

**🎉 恭喜！您的美旅地陪服务平台现在可以自动部署了！**
