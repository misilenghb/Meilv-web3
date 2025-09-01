"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const testUsers = [
    {
      id: '259e7f8e-f50e-4e26-b770-f3f52530e54a',
      name: '测试用户',
      phone: '13800000000',
      role: 'user'
    },
    {
      id: '709dd56f-0a15-4c7d-a8d2-9c39ce976af2',
      name: '地陪A',
      phone: '13900000001',
      role: 'guide'
    },
    {
      id: '3ba015bf-02ff-42de-9acc-a4340717e08e',
      name: '地陪B',
      phone: '13700000000',
      role: 'guide'
    },
    {
      id: 'dd7e6264-2992-41f8-a00e-627ebf8c6c4f',
      name: '地陪C',
      phone: '13600000000',
      role: 'guide'
    }
  ];

  const handleLogin = async (user: any) => {
    setLoading(true);
    try {
      // 创建会话数据
      const sessionData = {
        userId: user.id,
        phone: user.phone,
        role: user.role
      };

      // 设置会话 cookie
      const sessionString = Buffer.from(JSON.stringify(sessionData)).toString('base64');
      document.cookie = `ml_session=${sessionString}; path=/; max-age=86400`; // 24小时

      // 通知其他组件状态已更新
      localStorage.setItem('ml_session_changed', Date.now().toString());
      localStorage.removeItem('ml_session_changed');

      alert(`已登录为: ${user.name} (${user.role})`);

      // 根据角色跳转
      if (user.role === 'guide') {
        router.push('/guide-dashboard');
      } else {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'ml_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    alert('已退出登录');
    router.refresh();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card-pink p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">测试登录</h1>
          <p className="text-gray-600 mb-6 text-center">选择一个测试用户登录</p>
          
          <div className="space-y-4">
            {testUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                disabled={loading}
                className="w-full p-4 bg-white/70 rounded-lg border border-pink-200 hover:bg-white/90 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      user.role === 'guide' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'guide' ? '地陪' : '用户'}
                    </span>
                  </div>
                  <div className="text-pink-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-pink-200">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              退出登录
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              这是测试页面，用于快速切换不同用户身份测试功能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
