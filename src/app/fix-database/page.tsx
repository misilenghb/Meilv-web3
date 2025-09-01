"use client";

export default function FixDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-6">🚨 数据库修复指南</h1>
          
          <div className="space-y-6">
            {/* 问题描述 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 mb-3">当前问题</h2>
              <p className="text-red-700 text-sm">
                数据库中的 <code className="bg-red-100 px-1 rounded">users</code> 表缺少 <code className="bg-red-100 px-1 rounded">password_hash</code> 列，
                导致注册和登录功能无法正常工作。
              </p>
            </div>

            {/* 快速修复 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-3">⚡ 快速修复（推荐）</h2>
              <div className="space-y-3 text-sm text-yellow-700">
                <p className="font-medium">请按以下步骤操作：</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>登录到 <a href="https://supabase.com" target="_blank" className="text-blue-600 underline">Supabase控制台</a></li>
                  <li>选择您的项目</li>
                  <li>进入 <strong>SQL编辑器</strong></li>
                  <li>复制并执行以下SQL命令：</li>
                </ol>
                
                <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <div className="mb-2 text-gray-400">-- 添加密码哈希列</div>
                  <div>ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;</div>
                  <div className="mt-3 mb-2 text-gray-400">-- 为管理员设置默认密码（123456）</div>
                  <div>UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE phone = '13900000000';</div>
                  <div className="mt-3 mb-2 text-gray-400">-- 如果管理员不存在，创建管理员</div>
                  <div>INSERT INTO users (phone, name, password_hash, role, intended_role)</div>
                  <div>SELECT '13900000000', '系统管理员', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'admin'</div>
                  <div>WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '13900000000');</div>
                  <div className="mt-3 mb-2 text-gray-400">-- 创建地陪申请表</div>
                  <div>CREATE TABLE IF NOT EXISTS guide_applications (</div>
                  <div className="ml-4">id UUID DEFAULT gen_random_uuid() PRIMARY KEY,</div>
                  <div className="ml-4">user_id UUID REFERENCES users(id),</div>
                  <div className="ml-4">display_name VARCHAR(100) NOT NULL,</div>
                  <div className="ml-4">real_name VARCHAR(100) NOT NULL,</div>
                  <div className="ml-4">id_number VARCHAR(18) NOT NULL,</div>
                  <div className="ml-4">phone VARCHAR(20) NOT NULL,</div>
                  <div className="ml-4">city VARCHAR(100) NOT NULL,</div>
                  <div className="ml-4">address TEXT NOT NULL,</div>
                  <div className="ml-4">bio TEXT NOT NULL,</div>
                  <div className="ml-4">skills TEXT[] NOT NULL,</div>
                  <div className="ml-4">hourly_rate DECIMAL(10,2) NOT NULL,</div>
                  <div className="ml-4">id_card_front TEXT NOT NULL,</div>
                  <div className="ml-4">id_card_back TEXT NOT NULL,</div>
                  <div className="ml-4">photos TEXT[] NOT NULL,</div>
                  <div className="ml-4">experience TEXT NOT NULL,</div>
                  <div className="ml-4">motivation TEXT NOT NULL,</div>
                  <div className="ml-4">emergency_contact JSONB NOT NULL,</div>
                  <div className="ml-4">status VARCHAR(20) DEFAULT 'pending',</div>
                  <div className="ml-4">submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
                  <div>);</div>
                </div>
                
                <p className="mt-3">
                  <strong>注意：</strong>上面的密码哈希对应密码 <code className="bg-yellow-100 px-1 rounded font-bold">123456</code>
                </p>
              </div>
            </div>

            {/* 完整设置 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">🔧 完整数据库设置</h2>
              <div className="space-y-3 text-sm text-blue-700">
                <p>如果您需要完整的数据库结构，请执行项目根目录下的 <code className="bg-blue-100 px-1 rounded">database-setup.sql</code> 文件。</p>
                <p>该文件包含：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>完整的users表结构</li>
                  <li>地陪申请表</li>
                  <li>订单表</li>
                  <li>收藏表</li>
                  <li>评价表</li>
                  <li>必要的索引和安全策略</li>
                </ul>
              </div>
            </div>

            {/* 验证步骤 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-3">✅ 验证修复</h2>
              <div className="space-y-2 text-sm text-green-700">
                <p>执行SQL后，请验证以下功能：</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>访问 <a href="/login" className="text-blue-600 underline">/login</a> 页面</li>
                  <li>使用管理员账号登录：
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>手机号：13900000000</li>
                      <li>密码：123456</li>
                      <li>角色：管理员</li>
                    </ul>
                  </li>
                  <li>尝试注册新用户：<a href="/register" className="text-blue-600 underline">/register</a></li>
                  <li>测试修改密码功能：<a href="/change-password" className="text-blue-600 underline">/change-password</a></li>
                </ol>
              </div>
            </div>

            {/* 常见问题 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">❓ 常见问题</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Q: 执行SQL时提示权限错误？</p>
                  <p>A: 确保您使用的是项目所有者账号，或者具有数据库管理权限。</p>
                </div>
                <div>
                  <p className="font-medium">Q: 仍然无法登录？</p>
                  <p>A: 检查Supabase项目的API密钥是否正确配置在 <code className="bg-gray-100 px-1 rounded">.env.local</code> 文件中。</p>
                </div>
                <div>
                  <p className="font-medium">Q: 注册时仍然报错？</p>
                  <p>A: 可能需要刷新Supabase的schema缓存，等待几分钟后重试。</p>
                </div>
              </div>
            </div>

            {/* 联系支持 */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-3">🆘 需要帮助？</h2>
              <div className="space-y-2 text-sm text-purple-700">
                <p>如果按照上述步骤仍然无法解决问题，请：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>检查浏览器控制台的错误信息</li>
                  <li>查看Supabase项目的日志</li>
                  <li>确认环境变量配置正确</li>
                  <li>尝试重新启动开发服务器</li>
                </ul>
              </div>
            </div>

            {/* 快速链接 */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="/admin-info" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                管理员信息
              </a>
              <a href="/test-auth" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                测试认证功能
              </a>
              <a href="/login" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                尝试登录
              </a>
              <a href="/register" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                尝试注册
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
