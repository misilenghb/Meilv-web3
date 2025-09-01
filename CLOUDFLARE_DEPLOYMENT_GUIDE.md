# Cloudflare Workers 部署指南

本指南将帮助您将美旅地陪网站部署到 Cloudflare Workers。

## 📋 前置要求

### 1. Cloudflare 账户
- 注册 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
- 获取 Account ID 和 API Token

### 2. 开发环境
- Node.js 18+ 
- npm 或 yarn
- Git

### 3. 数据库
- Supabase 项目（已配置）
- 数据库表已创建

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd meilv-web3
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 填入实际值
   ```

4. **运行部署脚本**
   ```bash
   chmod +x deploy-cloudflare.sh
   ./deploy-cloudflare.sh
   ```

### 方法二：手动部署

1. **安装 Cloudflare 工具**
   ```bash
   npm install -g wrangler
   npm install @opennextjs/cloudflare@latest --save-dev
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建应用**
   ```bash
   npm run build
   npx opennextjs-cloudflare build
   ```

4. **部署**
   ```bash
   wrangler deploy
   ```

## ⚙️ 配置说明

### 1. Wrangler 配置 (wrangler.toml)

```toml
main = ".open-next/worker.js"
name = "meilv-web"
compatibility_date = "2025-03-25"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[env.production.vars]
NODE_ENV = "production"

[env.development.vars]
NODE_ENV = "development"
```

### 2. OpenNext 配置 (open-next.config.ts)

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  cache: {
    static: { maxAge: 31536000 },
    api: { maxAge: 0 },
  },
});
```

### 3. Next.js 配置 (next.config.js)

已配置支持：
- Cloudflare Images 优化
- 边缘运行时兼容
- CORS 头部设置

## 🔐 环境变量设置

### 在 Cloudflare Dashboard 中设置

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 Workers & Pages
3. 选择您的应用
4. 进入 Settings > Environment Variables
5. 添加以下变量：

**必需变量：**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**可选变量：**
- `CLOUDFLARE_IMAGES_ACCOUNT_ID`
- `CLOUDFLARE_IMAGES_API_TOKEN`
- `WEBHOOK_SECRET`

### 使用 Wrangler CLI 设置密钥

```bash
# 设置敏感信息
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put WEBHOOK_SECRET
```

## 🔄 CI/CD 自动部署

### GitHub Actions 配置

已包含 `.github/workflows/deploy-cloudflare.yml` 文件。

**需要设置的 GitHub Secrets：**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 获取 Cloudflare API Token

1. 进入 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 使用 "Custom token" 模板
4. 设置权限：
   - Account: Cloudflare Workers:Edit
   - Zone: Zone:Read (如果使用自定义域名)

## 📊 性能优化

### 1. 缓存策略
- 静态资源：1年缓存
- API 响应：不缓存
- 页面：根据内容设置

### 2. 图片优化
- 使用 Cloudflare Images
- 自动格式转换
- 响应式图片

### 3. 边缘计算
- API 路由在边缘运行
- 减少延迟
- 全球分布

## 🔍 监控和调试

### 1. Cloudflare Analytics
- 访问 Cloudflare Dashboard
- 查看 Workers 分析数据
- 监控性能指标

### 2. 日志查看
```bash
# 实时查看日志
wrangler tail

# 查看特定部署的日志
wrangler tail --env production
```

### 3. 本地调试
```bash
# 本地预览
npm run preview

# 使用 Wrangler 本地开发
wrangler dev
```

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```
   错误: Module not found
   解决: 检查依赖项是否正确安装
   ```

2. **环境变量未找到**
   ```
   错误: Missing environment variable
   解决: 确保在 Cloudflare Dashboard 中设置了所有必需的环境变量
   ```

3. **数据库连接失败**
   ```
   错误: Supabase connection failed
   解决: 验证 Supabase URL 和密钥是否正确
   ```

### 调试命令

```bash
# 检查配置
wrangler whoami
wrangler kv:namespace list

# 测试部署
wrangler deploy --dry-run

# 查看环境变量
wrangler secret list
```

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [OpenNext 文档](https://opennext.js.org/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

## 🆘 获取帮助

如果遇到问题：

1. 查看 [GitHub Issues](https://github.com/your-repo/issues)
2. 参考 Cloudflare 社区论坛
3. 联系技术支持

---

**注意：** 首次部署可能需要几分钟时间来全球分发。后续更新通常在 30 秒内生效。
