#!/bin/bash

# 美旅地陪服务平台 - 快速部署脚本
# 使用方法: ./deploy.sh [platform]
# 平台选项: vercel, netlify, server

set -e

echo "🚀 美旅地陪服务平台 - 部署脚本"
echo "=================================="

# 检查参数
PLATFORM=${1:-"vercel"}
echo "📦 部署平台: $PLATFORM"

# 检查环境
echo "🔍 检查环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在，从示例文件创建..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "📝 请编辑 .env.local 文件，填入正确的环境变量"
        echo "🔑 需要配置的变量:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo "   - NEXT_PUBLIC_SUPABASE_STORAGE_URL"
        echo "   - SUPABASE_STORAGE_KEY_ID"
        echo "   - SUPABASE_STORAGE_ACCESS_KEY"
        read -p "按回车键继续..."
    else
        echo "❌ .env.example 文件不存在，无法创建环境变量文件"
        exit 1
    fi
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 构建项目
echo "🔨 构建项目..."
npm run build

# 根据平台进行部署
case $PLATFORM in
    "vercel")
        echo "🚀 部署到 Vercel..."
        
        # 检查 Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "📥 安装 Vercel CLI..."
            npm install -g vercel
        fi
        
        # 部署
        vercel --prod
        ;;
        
    "netlify")
        echo "🚀 部署到 Netlify..."
        
        # 检查 Netlify CLI
        if ! command -v netlify &> /dev/null; then
            echo "📥 安装 Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # 部署
        netlify deploy --prod --dir=.next
        ;;
        
    "server")
        echo "🚀 部署到自定义服务器..."
        
        # 检查服务器配置
        if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
            echo "❌ 服务器配置不完整，请设置环境变量:"
            echo "   export SERVER_HOST=your_server_ip"
            echo "   export SERVER_USER=your_username"
            echo "   export SERVER_PATH=/path/to/app"
            exit 1
        fi
        
        SERVER_PATH=${SERVER_PATH:-"/var/www/meilv-web"}
        
        echo "📤 上传文件到服务器..."
        rsync -avz --exclude node_modules --exclude .git . $SERVER_USER@$SERVER_HOST:$SERVER_PATH
        
        echo "🔧 在服务器上安装依赖和重启服务..."
        ssh $SERVER_USER@$SERVER_HOST "cd $SERVER_PATH && npm ci && npm run build && pm2 restart meilv-web || pm2 start npm --name meilv-web -- start"
        ;;
        
    *)
        echo "❌ 不支持的部署平台: $PLATFORM"
        echo "支持的平台: vercel, netlify, server"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📊 部署统计:"
echo "   - 平台: $PLATFORM"
echo "   - 时间: $(date)"
echo "   - Node.js: $(node -v)"
echo "   - 构建状态: ✅ 成功"

# 显示后续步骤
echo ""
echo "📋 后续步骤:"
case $PLATFORM in
    "vercel")
        echo "   1. 访问 Vercel Dashboard 查看部署状态"
        echo "   2. 配置自定义域名（可选）"
        echo "   3. 设置环境变量（如果还未设置）"
        ;;
    "netlify")
        echo "   1. 访问 Netlify Dashboard 查看部署状态"
        echo "   2. 配置自定义域名（可选）"
        echo "   3. 设置环境变量（如果还未设置）"
        ;;
    "server")
        echo "   1. 检查服务器上的应用状态: pm2 status"
        echo "   2. 查看日志: pm2 logs meilv-web"
        echo "   3. 配置 Nginx 反向代理（如果需要）"
        ;;
esac

echo ""
echo "🔗 有用的链接:"
echo "   - 项目文档: README.md"
echo "   - 部署指南: DEPLOYMENT_GUIDE.md"
echo "   - GitHub 仓库: https://github.com/yourusername/meilv-web"

echo ""
echo "✨ 感谢使用美旅地陪服务平台！"
