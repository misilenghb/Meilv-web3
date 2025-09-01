"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestAuthPage() {
  const [testResult, setTestResult] = useState("");

  const testLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: "13900000000", 
          password: "123456", 
          role: "admin" 
        }),
      });

      const data = await response.json();
      setTestResult(`登录测试: ${response.ok ? "成功" : "失败"} - ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`登录测试失败: ${error.message}`);
    }
  };

  const testChangePassword = async () => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: "123456",
          newPassword: "newpass123",
          confirmPassword: "newpass123"
        }),
      });

      const data = await response.json();
      setTestResult(`修改密码测试: ${response.ok ? "成功" : "失败"} - ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`修改密码测试失败: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();
      setTestResult(`退出登录测试: ${response.ok ? "成功" : "失败"} - ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`退出登录测试失败: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">认证功能测试</h1>
          
          <div className="space-y-6">
            {/* 功能链接 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/register" 
                className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600"
              >
                注册页面
              </Link>
              <Link 
                href="/login" 
                className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600"
              >
                登录页面
              </Link>
              <Link 
                href="/profile" 
                className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600"
              >
                个人资料
              </Link>
              <Link 
                href="/change-password" 
                className="bg-orange-500 text-white p-4 rounded-lg text-center hover:bg-orange-600"
              >
                修改密码
              </Link>
            </div>

            {/* 测试按钮 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">API测试</h2>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={testLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  测试登录API
                </button>
                <button
                  onClick={testChangePassword}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  测试修改密码API
                </button>
                <button
                  onClick={testLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  测试退出登录API
                </button>
              </div>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className="bg-gray-100 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">测试结果</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {testResult}
                </pre>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">使用说明</h2>
              <div className="space-y-2 text-sm text-blue-700">
                <h3 className="font-medium">管理员账号:</h3>
                <p>• 手机号: 13900000000</p>
                <p>• 密码: 123456</p>
                <p>• 角色: 管理员</p>
                
                <h3 className="font-medium mt-4">测试流程:</h3>
                <p>1. 点击"登录页面"进行登录</p>
                <p>2. 登录成功后访问"个人资料"</p>
                <p>3. 在个人资料页面点击"修改密码"</p>
                <p>4. 修改密码后重新登录验证</p>
                <p>5. 可以通过导航栏或个人资料页面退出登录</p>
              </div>
            </div>

            {/* 功能特性 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-3">已实现功能</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <h3 className="font-medium">认证功能:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>用户注册（手机号+密码）</li>
                    <li>用户登录（手机号+密码）</li>
                    <li>安全退出登录</li>
                    <li>密码安全哈希存储</li>
                    <li>会话管理</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">密码功能:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>修改密码</li>
                    <li>密码强度验证</li>
                    <li>密码可见性切换</li>
                    <li>老用户兼容性</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
