#!/bin/bash

# Cloudflare Workers 部署脚本
# 用于自动化部署 Next.js 应用到 Cloudflare Workers

set -e  # 遇到错误时退出

echo "🚀 开始部署到 Cloudflare Workers..."

# 检查必要的工具
echo "📋 检查部署环境..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查是否安装了必要的依赖
echo "📦 检查依赖项..."
if ! npm list @opennextjs/cloudflare &> /dev/null; then
    echo "⚠️  @opennextjs/cloudflare 未安装，正在安装..."
    npm install @opennextjs/cloudflare@latest --save-dev
fi

if ! npm list wrangler &> /dev/null; then
    echo "⚠️  wrangler 未安装，正在安装..."
    npm install wrangler@latest --save-dev
fi

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_URL 未设置"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置"
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next
rm -rf .open-next
rm -rf out

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行类型检查
echo "🔍 运行类型检查..."
npm run cf-typegen || echo "⚠️  类型生成失败，继续部署..."

# 构建应用
echo "🏗️  构建应用..."
npm run build

# 使用 OpenNext 构建 Cloudflare Workers 版本
echo "⚡ 构建 Cloudflare Workers 版本..."
npx opennextjs-cloudflare build

# 检查构建结果
if [ ! -f ".open-next/worker.js" ]; then
    echo "❌ 构建失败：worker.js 文件不存在"
    exit 1
fi

echo "✅ 构建完成"

# 部署到 Cloudflare Workers
echo "🚀 部署到 Cloudflare Workers..."

# 检查是否有 wrangler 配置
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml 配置文件不存在"
    exit 1
fi

# 部署
if [ "$1" = "preview" ]; then
    echo "🔍 部署到预览环境..."
    npx wrangler deploy --env development
else
    echo "🌟 部署到生产环境..."
    npx wrangler deploy --env production
fi

echo "✅ 部署完成！"

# 显示部署信息
echo ""
echo "📊 部署信息："
echo "- 应用名称: meilv-web"
echo "- 运行时: Cloudflare Workers"
echo "- 构建工具: OpenNext"
echo ""

if [ "$1" = "preview" ]; then
    echo "🔗 预览链接: https://meilv-web.your-subdomain.workers.dev"
else
    echo "🔗 生产链接: https://meilv-web.your-domain.workers.dev"
fi

echo ""
echo "🎉 部署成功！"
