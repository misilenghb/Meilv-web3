"use client";

import Link from "next/link";

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="card-pink p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">地陪工作台功能测试</h1>
          <p className="text-gray-600 mb-8">
            测试完善后的订单管理和收入统计功能
          </p>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/70 rounded-2xl p-6 border border-pink-100">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                📋
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">订单管理</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 高级筛选和搜索</li>
                <li>• 批量操作</li>
                <li>• 订单详情页面</li>
                <li>• 客户信息管理</li>
                <li>• 订单备注功能</li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-2xl p-6 border border-pink-100">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                💰
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">收入统计</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 多维度收入分析</li>
                <li>• 收入趋势图表</li>
                <li>• 服务类型统计</li>
                <li>• 业务洞察报告</li>
                <li>• 数据导出功能</li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-2xl p-6 border border-pink-100">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">数据导出</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Excel格式导出</li>
                <li>• PDF报告生成</li>
                <li>• 自定义时间范围</li>
                <li>• 详细统计报告</li>
                <li>• 一键下载</li>
              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link 
              href="/guide-dashboard" 
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">地陪工作台</h3>
                  <p className="text-pink-100">查看完整的工作台界面</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/guide-dashboard/orders" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  📋
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">订单管理</h3>
                  <p className="text-blue-100">管理和处理所有订单</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/guide-dashboard/earnings" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">收入统计</h3>
                  <p className="text-green-100">查看详细的收入分析</p>
                </div>
              </div>
            </Link>

            <Link 
              href="/guide-dashboard/profile" 
              className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-6 rounded-2xl hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">个人资料</h3>
                  <p className="text-purple-100">编辑地陪资料信息</p>
                </div>
              </div>
            </Link>
          </div>

          {/* New Features Highlight */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎉 新功能亮点</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">📈 高级订单管理</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 支持按状态、日期、客户搜索</li>
                  <li>• 批量更新订单状态</li>
                  <li>• 详细的订单信息展示</li>
                  <li>• 客户联系方式管理</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">💹 智能收入分析</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 多时间维度收入统计</li>
                  <li>• 服务类型收入对比</li>
                  <li>• 业务增长趋势分析</li>
                  <li>• 一键导出详细报告</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 新增API端点</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">收入统计API</h4>
                <ul className="text-xs text-gray-600 space-y-1 font-mono">
                  <li>• GET /api/guide/earnings/stats</li>
                  <li>• GET /api/guide/earnings/chart</li>
                  <li>• GET /api/guide/earnings/services</li>
                  <li>• GET /api/guide/earnings/export</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">订单管理API</h4>
                <ul className="text-xs text-gray-600 space-y-1 font-mono">
                  <li>• GET /api/guide/orders</li>
                  <li>• GET /api/guide/orders/export</li>
                  <li>• PATCH /api/orders/[id]/notes</li>
                  <li>• PATCH /api/orders/[id]</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              返回首页
            </Link>
            <Link
              href="/guides"
              className="border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-6 py-3 rounded-xl transition-colors"
            >
              查看地陪列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
