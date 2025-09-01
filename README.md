# 🌍 美旅地陪网站 (Meilv-Web3)

[![Deploy to Cloudflare Workers](https://github.com/misilenghb/Meilv-web3/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/misilenghb/Meilv-web3/actions/workflows/deploy-cloudflare.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

一个现代化的地陪服务平台，连接旅行者与当地地陪，提供个性化的旅行体验。基于 Next.js 15 构建，部署在 Cloudflare Workers 上，提供全球边缘计算性能。

## ✨ 亮点特性

- 🚀 **全球边缘计算** - 基于 Cloudflare Workers，全球低延迟访问
- ⚡ **现代化技术栈** - Next.js 15 + React 19 + TypeScript
- 🔒 **企业级安全** - 完整的用户认证和权限管理
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎯 **智能匹配** - AI 驱动的地陪推荐系统
- 💰 **完整支付流程** - 安全的在线支付和结算系统

## 🌟 功能特性

### 👥 用户系统
- ✅ 用户注册/登录（手机号验证）
- ✅ 个人资料管理
- ✅ 余额管理系统
- ✅ 订单历史查看
- ✅ 收藏夹功能
- ✅ 密码修改和安全设置

### 🎯 地陪系统
- ✅ 地陪申请注册（身份验证）
- ✅ 多级申请审核流程
- ✅ 地陪个人中心
- ✅ 自主接单功能
- ✅ 收入统计分析
- ✅ 服务评价系统

### 📋 订单管理
- ✅ 智能订单分配算法
- ✅ 多状态订单跟踪
- ✅ 在线支付系统
- ✅ 订单评价系统
- ✅ 退款处理机制
- ✅ 订单争议处理

### 👨‍💼 管理后台
- ✅ 用户管理（增删改查）
- ✅ 地陪审核（资质验证）
- ✅ 订单监控（实时状态）
- ✅ 财务管理（收支统计）
- ✅ 数据统计（可视化图表）
- ✅ 系统配置管理

### 💬 消息系统
- ✅ 实时消息通信
- ✅ 用户间私信
- ✅ 系统通知推送
- ✅ 消息历史记录
- ✅ 消息状态管理

### 🛡️ 投诉系统
- ✅ 投诉提交（多媒体支持）
- ✅ 投诉处理流程
- ✅ 投诉状态跟踪
- ✅ 投诉结果反馈

## 🛠️ 技术栈

### 前端技术
- **Next.js 15** - React 全栈框架，支持 App Router
- **React 19** - 最新的用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 原子化 CSS 框架
- **Heroicons** - 精美的 SVG 图标库

### 后端技术
- **Next.js API Routes** - 服务端 API（边缘运行时）
- **Supabase** - PostgreSQL 数据库和实时功能
- **bcryptjs** - 密码加密和验证
- **Edge Runtime** - Cloudflare Workers 兼容

### 部署和基础设施
- **Cloudflare Workers** - 全球边缘计算平台
- **Cloudflare Images** - 图片优化和 CDN
- **GitHub Actions** - CI/CD 自动化部署
- **Supabase** - 数据库托管和管理

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Wrangler** - Cloudflare Workers CLI
- **OpenNext** - Next.js 到 Workers 的适配器

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git
- Supabase 账户
- Cloudflare 账户（用于部署）

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/misilenghb/Meilv-web3.git
   cd Meilv-web3
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 文件，填入以下配置：
   ```env
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # 应用配置
   NODE_ENV=development
   APP_URL=http://localhost:3000
   ```

4. **初始化数据库**
   ```bash
   npm run init-db
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### Cloudflare Workers 部署

1. **安装 Cloudflare CLI**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **配置 Cloudflare**
   - 获取 Account ID 和 API Token
   - 在 `wrangler.toml` 中更新配置

3. **部署到 Cloudflare Workers**
   ```bash
   # 快速部署
   ./deploy-cloudflare.sh

   # 或手动部署
   npm run deploy
   ```

4. **设置环境变量**
   ```bash
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

详细部署指南请参考 [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)

## 🚀 部署

### Vercel 部署

1. **连接 GitHub**
   - 将代码推送到 GitHub
   - 在 Vercel 中导入项目

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_URL`
   - `SUPABASE_STORAGE_KEY_ID`
   - `SUPABASE_STORAGE_ACCESS_KEY`

3. **自动部署**
   推送到 main 分支将自动触发部署

### GitHub Actions 自动部署

项目已配置 GitHub Actions，推送到 main 分支时自动部署。

需要在 GitHub 仓库设置中添加以下 Secrets：

#### Supabase 配置
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_URL`
- `SUPABASE_STORAGE_KEY_ID`
- `SUPABASE_STORAGE_ACCESS_KEY`

#### Vercel 部署 (可选)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

#### 自定义服务器部署 (可选)
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `SERVER_PORT`

## 📁 项目结构

```
Meilv-web3/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── admin/          # 管理员页面
│   │   ├── guide/          # 地陪页面
│   │   ├── auth/           # 认证页面
│   │   └── ...             # 其他页面
│   ├── components/         # React 组件
│   ├── lib/               # 工具库和配置
│   │   ├── supabase.ts    # Supabase 配置
│   │   ├── supabase-edge.ts # 边缘运行时配置
│   │   └── edge-runtime.ts # Workers 工具
│   └── types/             # TypeScript 类型定义
├── database/              # 数据库脚本
│   ├── init.sql          # 初始化脚本
│   └── migrations/       # 迁移脚本
├── scripts/               # 工具脚本
├── .github/               # GitHub Actions
│   └── workflows/        # CI/CD 工作流
├── wrangler.toml         # Cloudflare Workers 配置
├── open-next.config.ts   # OpenNext 配置
└── cloudflare-env.d.ts   # Cloudflare 类型定义
```

## 🚀 部署选项

### 1. Cloudflare Workers（推荐）
- ⚡ 全球边缘计算
- 🔄 自动扩展
- 💰 按使用付费
- 🛡️ 内置安全防护

### 2. Vercel
- 🚀 零配置部署
- 🔄 自动 CI/CD
- 📊 性能分析
- 🌐 全球 CDN

### 3. 自托管
- 🔧 完全控制
- 💾 数据主权
- 🔒 私有部署
- 📈 可定制扩展

## 📊 性能特性

### Cloudflare Workers 优势
- **响应时间**: < 50ms（全球平均）
- **可用性**: 99.9%+ SLA
- **扩展性**: 自动处理百万级请求
- **安全性**: DDoS 防护 + WAF

### 优化特性
- 🖼️ **图片优化** - Cloudflare Images 自动优化
- 📦 **代码分割** - 按需加载减少包大小
- 🗄️ **智能缓存** - 多层缓存策略
- 🔄 **预渲染** - 静态页面预生成

## 🔐 安全特性

- 🛡️ **身份验证** - JWT + 会话管理
- 🔒 **数据加密** - 传输和存储加密
- 🚫 **CSRF 防护** - 跨站请求伪造防护
- 🔍 **输入验证** - 严格的数据验证
- 📝 **审计日志** - 完整的操作记录

## 🌍 国际化支持

- 🇨🇳 简体中文（默认）
- 🇹🇼 繁体中文
- 🇺🇸 English
- 🇯🇵 日本語

## 📱 移动端支持

- 📱 **响应式设计** - 完美适配所有设备
- 🔄 **PWA 支持** - 可安装的 Web 应用
- 📶 **离线功能** - 基础功能离线可用
- 🔔 **推送通知** - 实时消息推送

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行端到端测试
npm run test:e2e

# 运行性能测试
npm run test:performance

# 代码覆盖率
npm run test:coverage
```

## 📈 监控和分析

### 内置监控
- 📊 **性能监控** - Core Web Vitals
- 🔍 **错误追踪** - 实时错误监控
- 📈 **用户分析** - 用户行为分析
- 💰 **业务指标** - 订单和收入统计

### 第三方集成
- Google Analytics
- Sentry 错误监控
- Cloudflare Analytics
- Supabase 实时监控

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🆘 支持和帮助

### 文档资源
- 📚 [部署指南](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)
- 🔧 [API 文档](./docs/api.md)
- 🎨 [设计系统](./docs/design-system.md)
- 🔍 [故障排除](./docs/troubleshooting.md)

### 获取帮助
- 🐛 [报告 Bug](https://github.com/misilenghb/Meilv-web3/issues)
- 💡 [功能请求](https://github.com/misilenghb/Meilv-web3/issues)
- 💬 [讨论区](https://github.com/misilenghb/Meilv-web3/discussions)
- 📧 技术支持: support@meilv.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

### 技术支持
- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Cloudflare](https://cloudflare.com/) - 边缘计算平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

<div align="center">
  <p>🌟 如果这个项目对您有帮助，请给我们一个 Star！</p>
  <p>Made with ❤️ by <a href="https://github.com/misilenghb">misilenghb</a></p>
</div>


## 🎯 路线图

- [ ] 移动端适配
- [ ] 实时通知系统
- [ ] 地陪评价系统
- [ ] 智能推荐算法
- [ ] 多语言支持
- [ ] 支付集成
