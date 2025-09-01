"use client";

import { useState } from "react";

export default function AdminInfoPage() {
  const [migrationResult, setMigrationResult] = useState(null);
  const [setupResult, setSetupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/migrate-db", {
        method: "POST",
      });
      const data = await response.json();
      setMigrationResult(data);
    } catch (error) {
      setMigrationResult({ error: "迁移失败", details: error.message });
    } finally {
      setLoading(false);
    }
  };

  const setupDatabase = async () => {
    setSetupLoading(true);
    try {
      const response = await fetch("/api/admin/setup-database", {
        method: "POST",
      });
      const data = await response.json();
      setSetupResult(data);
    } catch (error) {
      setSetupResult({ error: "数据库设置失败", details: error.message });
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">管理员信息</h1>
          
          <div className="space-y-6">
            {/* 默认管理员账号信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">默认管理员账号</h2>
              <div className="space-y-2 text-sm">
                <p><strong>手机号:</strong> 13900000000</p>
                <p><strong>默认密码:</strong> 123456</p>
                <p><strong>角色:</strong> 管理员</p>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                注意：首次登录后请及时修改密码
              </div>
            </div>

            {/* 数据库设置 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-3">数据库设置</h2>
              <p className="text-sm text-green-700 mb-4">
                首次使用或遇到数据库问题时，运行此设置来创建必要的表结构和管理员账号。
              </p>

              <button
                onClick={setupDatabase}
                disabled={setupLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-3"
              >
                {setupLoading ? "设置中..." : "设置数据库"}
              </button>
            </div>

            {/* 数据库迁移 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-3">数据库迁移</h2>
              <p className="text-sm text-yellow-700 mb-4">
                如果管理员账号无法登录，可能需要运行数据库迁移来为现有用户添加密码字段。
              </p>

              <button
                onClick={runMigration}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "迁移中..." : "运行数据库迁移"}
              </button>
            </div>

            {/* 设置结果 */}
            {setupResult && (
              <div className={`border rounded-lg p-4 ${
                setupResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  setupResult.success ? "text-green-800" : "text-red-800"
                }`}>
                  数据库设置结果
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(setupResult, null, 2)}
                </pre>
              </div>
            )}

            {/* 迁移结果 */}
            {migrationResult && (
              <div className={`border rounded-lg p-4 ${
                migrationResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  migrationResult.success ? "text-green-800" : "text-red-800"
                }`}>
                  迁移结果
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(migrationResult, null, 2)}
                </pre>
              </div>
            )}

            {/* 手动数据库设置说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">手动数据库设置</h2>
              <div className="space-y-2 text-sm text-blue-700">
                <p>如果自动设置失败，请按以下步骤手动设置：</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>登录到Supabase控制台</li>
                  <li>进入SQL编辑器</li>
                  <li>复制并执行项目根目录下的 <code className="bg-blue-100 px-1 rounded">database-setup.sql</code> 文件内容</li>
                  <li>确认所有表和数据创建成功</li>
                  <li>返回此页面重新尝试登录</li>
                </ol>
                <p className="mt-3 font-medium">必需的数据库列：</p>
                <code className="block bg-blue-100 p-2 rounded text-xs">
                  users表需要包含: id, phone, name, password_hash, role, intended_role, created_at, updated_at
                </code>
              </div>
            </div>

            {/* 登录说明 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">登录说明</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. 访问登录页面: <a href="/login" className="text-blue-600 hover:underline">/login</a></p>
                <p>2. 输入手机号: 13900000000</p>
                <p>3. 输入密码: 123456</p>
                <p>4. 选择角色: 管理员</p>
                <p>5. 点击登录</p>
              </div>
            </div>

            {/* 其他用户信息 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">其他用户</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>所有现有用户的默认密码都是: <strong>123456</strong></p>
                <p>建议用户首次登录后立即修改密码</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
