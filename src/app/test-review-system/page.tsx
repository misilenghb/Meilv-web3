"use client";

import { useState } from "react";

export default function TestReviewSystemPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testReviewPermission = async () => {
    try {
      // Test 1: Check permission without login
      addResult("测试1: 未登录用户检查评价权限");
      const response1 = await fetch("/api/reviews/check-permission?guideId=guide1");
      const data1 = await response1.json();
      addResult(`结果: ${data1.message} (canReview: ${data1.canReview})`);

      // Test 2: Try to submit review without permission
      addResult("测试2: 尝试提交评价");
      const response2 = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: "guide1",
          rating: 5,
          content: "测试评价"
        })
      });
      const data2 = await response2.json();
      addResult(`结果: ${data2.error || "成功"} (状态: ${response2.status})`);

    } catch (error) {
      addResult(`错误: ${error}`);
    }
  };

  const testOrderFlow = async () => {
    try {
      addResult("测试订单流程...");
      
      // Test order status update
      const response = await fetch("/api/orders/test-order-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      
      if (response.ok) {
        addResult("订单状态更新成功");
      } else {
        const error = await response.json();
        addResult(`订单状态更新失败: ${error.error}`);
      }
    } catch (error) {
      addResult(`错误: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card-pink p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">评价系统测试</h1>
          <p className="text-gray-600 mb-8">
            测试评价权限控制和订单状态管理功能
          </p>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={testReviewPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              测试评价权限
            </button>
            <button
              onClick={testOrderFlow}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              测试订单流程
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              清空结果
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm">
            <h3 className="text-white mb-4">测试结果:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">点击上方按钮开始测试...</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 rounded-2xl p-6 border border-pink-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">✅ 已完善功能</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 地陪个人资料页面支持照片上传</li>
                <li>• 添加了详细位置信息字段</li>
                <li>• 评价权限严格控制（仅限已完成服务用户）</li>
                <li>• 防止重复评价</li>
                <li>• 评价时间限制（30天内有效）</li>
                <li>• 地陪订单管理页面</li>
                <li>• 订单状态更新功能</li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-2xl p-6 border border-pink-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 权限控制逻辑</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 用户必须先登录</li>
                <li>• 必须有该地陪的已完成订单</li>
                <li>• 每个地陪只能评价一次</li>
                <li>• 服务完成后30天内有效</li>
                <li>• 地陪可以管理订单状态</li>
                <li>• 只有"已完成"状态的订单才能被评价</li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-4">
            <a
              href="/guides"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              查看地陪列表
            </a>
            <a
              href="/guide-dashboard"
              className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-6 py-3 rounded-xl transition-colors"
            >
              地陪工作台
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
