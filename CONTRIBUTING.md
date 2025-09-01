# 🤝 贡献指南

感谢您对美旅地陪网站项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能

## 📋 开始之前

### 行为准则
请阅读并遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

### 技能要求
- 熟悉 JavaScript/TypeScript
- 了解 React 和 Next.js
- 基本的 Git 操作知识
- 了解 Cloudflare Workers（可选）

## 🚀 开发环境设置

### 1. Fork 和克隆项目
```bash
# Fork 项目到您的 GitHub 账户
# 然后克隆您的 fork
git clone https://github.com/YOUR_USERNAME/Meilv-web3.git
cd Meilv-web3

# 添加上游仓库
git remote add upstream https://github.com/misilenghb/Meilv-web3.git
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入您的配置
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 🔄 开发流程

### 1. 创建分支
```bash
# 确保您在最新的 main 分支
git checkout main
git pull upstream main

# 创建新的功能分支
git checkout -b feature/your-feature-name
# 或者修复分支
git checkout -b fix/your-fix-name
```

### 2. 分支命名规范
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 构建/工具相关

### 3. 提交规范
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例:**
```bash
git commit -m "feat(auth): add phone number verification"
git commit -m "fix(orders): resolve duplicate order creation issue"
git commit -m "docs: update deployment guide for Cloudflare Workers"
```

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testNamePattern="your-test-name"

# 运行测试覆盖率
npm run test:coverage
```

### 测试要求
- 新功能必须包含测试
- Bug 修复应该包含回归测试
- 测试覆盖率应该保持在 80% 以上

## 📝 代码规范

### ESLint 和 Prettier
```bash
# 检查代码风格
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 代码风格指南
- 使用 TypeScript 进行类型安全
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式
- 保持组件小而专注
- 添加适当的注释和文档

## 🔍 Pull Request 流程

### 1. 提交 PR 前检查
- [ ] 代码通过所有测试
- [ ] 代码符合风格指南
- [ ] 添加了必要的文档
- [ ] 更新了相关的 README 或文档
- [ ] 测试了 Cloudflare Workers 兼容性

### 2. 创建 Pull Request
1. 推送您的分支到 GitHub
2. 创建 Pull Request
3. 填写 PR 模板
4. 请求代码审查

### 3. 代码审查
- 所有 PR 需要至少一个审查者批准
- 解决所有审查意见
- 确保 CI/CD 检查通过

### 4. 合并
- 使用 "Squash and merge" 合并
- 删除功能分支

## 🐛 报告 Bug

### Bug 报告应包含
1. 清晰的标题和描述
2. 重现步骤
3. 期望行为 vs 实际行为
4. 环境信息（浏览器、操作系统等）
5. 截图或错误日志（如果适用）

### 使用 Bug 报告模板
创建 Issue 时选择 "Bug Report" 模板。

## 💡 功能请求

### 功能请求应包含
1. 功能的清晰描述
2. 使用场景和动机
3. 可能的实现方案
4. 替代方案考虑

### 使用功能请求模板
创建 Issue 时选择 "Feature Request" 模板。

## 📚 文档贡献

### 文档类型
- API 文档
- 用户指南
- 开发者文档
- 部署指南

### 文档标准
- 使用清晰、简洁的语言
- 包含代码示例
- 添加截图或图表（如果有帮助）
- 保持文档更新

## 🏷️ 标签系统

### Issue 标签
- `bug` - Bug 报告
- `enhancement` - 功能增强
- `documentation` - 文档相关
- `good first issue` - 适合新贡献者
- `help wanted` - 需要帮助
- `priority: high/medium/low` - 优先级

### PR 标签
- `ready for review` - 准备审查
- `work in progress` - 进行中
- `needs changes` - 需要修改

## 🎯 贡献者认可

### 贡献者列表
所有贡献者都会被添加到项目的贡献者列表中。

### 贡献类型
我们认可以下类型的贡献：
- 💻 代码
- 📖 文档
- 🐛 Bug 报告
- 💡 想法和建议
- 🎨 设计
- 📹 视频教程
- 📢 推广

## 📞 获取帮助

如果您在贡献过程中遇到问题：

1. 查看现有的 Issues 和 Discussions
2. 创建新的 Issue 或 Discussion
3. 联系维护者

## 🙏 感谢

感谢您考虑为美旅地陪网站项目做出贡献！每一个贡献都很重要，无论大小。

---

**记住**: 贡献不仅仅是代码。文档、测试、Bug 报告、功能建议和社区支持都是宝贵的贡献！
