#!/usr/bin/env node

/**
 * GitHub 同步验证脚本
 * 验证项目是否成功同步到 GitHub 仓库
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 验证 GitHub 同步状态...\n');

let hasErrors = false;
let hasWarnings = false;

// 检查 Git 仓库状态
console.log('📋 检查 Git 仓库状态...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim() === '') {
    console.log('✅ 工作目录干净，所有文件已提交');
  } else {
    console.log('⚠️  工作目录有未提交的更改:');
    console.log(gitStatus);
    hasWarnings = true;
  }
} catch (error) {
  console.log('❌ 无法检查 Git 状态:', error.message);
  hasErrors = true;
}

// 检查远程仓库配置
console.log('\n🔗 检查远程仓库配置...');
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  if (remoteUrl === 'https://github.com/misilenghb/Meilv-web3.git') {
    console.log('✅ 远程仓库配置正确:', remoteUrl);
  } else {
    console.log('⚠️  远程仓库 URL 不匹配:', remoteUrl);
    hasWarnings = true;
  }
} catch (error) {
  console.log('❌ 无法获取远程仓库 URL:', error.message);
  hasErrors = true;
}

// 检查分支状态
console.log('\n🌿 检查分支状态...');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log('✅ 当前分支:', currentBranch);
  
  const trackingBranch = execSync('git rev-parse --abbrev-ref @{upstream}', { encoding: 'utf8' }).trim();
  console.log('✅ 跟踪分支:', trackingBranch);
} catch (error) {
  console.log('⚠️  分支跟踪配置可能有问题:', error.message);
  hasWarnings = true;
}

// 检查最新提交
console.log('\n📝 检查最新提交...');
try {
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log('✅ 最新提交:', lastCommit);
  
  if (lastCommit.includes('完成项目清理和Cloudflare Workers适配')) {
    console.log('✅ 提交信息包含预期内容');
  } else {
    console.log('⚠️  提交信息可能不是最新的');
    hasWarnings = true;
  }
} catch (error) {
  console.log('❌ 无法获取提交信息:', error.message);
  hasErrors = true;
}

// 检查关键文件是否存在
console.log('\n📁 检查关键文件...');
const keyFiles = [
  'README.md',
  'package.json',
  'wrangler.toml',
  'open-next.config.ts',
  '.github/workflows/deploy-cloudflare.yml',
  'CLOUDFLARE_DEPLOYMENT_GUIDE.md',
  'GITHUB_SECRETS_SETUP.md',
  'PROJECT_STATUS.md'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    hasErrors = true;
  }
});

// 检查文件统计
console.log('\n📊 检查文件统计...');
try {
  const fileCount = execSync('git ls-files | wc -l', { encoding: 'utf8' }).trim();
  console.log(`✅ Git 跟踪的文件数量: ${fileCount}`);
  
  if (parseInt(fileCount) > 200) {
    console.log('✅ 文件数量符合预期（应该有 240+ 个文件）');
  } else {
    console.log('⚠️  文件数量可能不完整');
    hasWarnings = true;
  }
} catch (error) {
  console.log('⚠️  无法统计文件数量:', error.message);
  hasWarnings = true;
}

// 检查 GitHub Actions 工作流
console.log('\n🔄 检查 GitHub Actions 配置...');
const workflowFile = '.github/workflows/deploy-cloudflare.yml';
if (fs.existsSync(workflowFile)) {
  const workflow = fs.readFileSync(workflowFile, 'utf8');
  
  const requiredSecrets = [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  requiredSecrets.forEach(secret => {
    if (workflow.includes(secret)) {
      console.log(`✅ ${secret} 在工作流中配置`);
    } else {
      console.log(`❌ ${secret} 在工作流中缺失`);
      hasErrors = true;
    }
  });
}

// 生成同步报告
console.log('\n📋 GitHub 同步报告:');
console.log('='.repeat(50));
console.log(`📦 项目名称: 美旅地陪网站 (Meilv-Web3)`);
console.log(`🔗 GitHub 仓库: https://github.com/misilenghb/Meilv-web3.git`);
console.log(`📅 同步时间: ${new Date().toLocaleString('zh-CN')}`);

try {
  const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
  console.log(`📝 提交数量: ${commitCount}`);
} catch (error) {
  console.log(`📝 提交数量: 无法获取`);
}

// 下一步指导
console.log('\n🎯 下一步操作指南:');
console.log('1. 🔐 配置 GitHub Secrets:');
console.log('   - 进入 GitHub 仓库设置');
console.log('   - 添加 Cloudflare 和 Supabase 密钥');
console.log('   - 参考: GITHUB_SECRETS_SETUP.md');
console.log('');
console.log('2. 🚀 测试自动部署:');
console.log('   - 创建测试分支');
console.log('   - 提交小的更改');
console.log('   - 创建 Pull Request');
console.log('   - 验证 GitHub Actions 运行');
console.log('');
console.log('3. 🌐 部署到 Cloudflare Workers:');
console.log('   - 配置 Cloudflare 账户');
console.log('   - 运行部署脚本');
console.log('   - 参考: CLOUDFLARE_DEPLOYMENT_GUIDE.md');

// 快速链接
console.log('\n🔗 快速链接:');
console.log(`📖 GitHub 仓库: https://github.com/misilenghb/Meilv-web3`);
console.log(`⚙️  仓库设置: https://github.com/misilenghb/Meilv-web3/settings`);
console.log(`🔐 Secrets 配置: https://github.com/misilenghb/Meilv-web3/settings/secrets/actions`);
console.log(`🔄 Actions 页面: https://github.com/misilenghb/Meilv-web3/actions`);

// 总结
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ 同步验证失败！请修复上述错误。');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  同步基本成功，但有一些需要注意的地方。');
  console.log('🎉 项目已成功同步到 GitHub！');
  process.exit(0);
} else {
  console.log('✅ 同步验证完全成功！');
  console.log('🎉 项目已完美同步到 GitHub，可以开始配置部署！');
  process.exit(0);
}
