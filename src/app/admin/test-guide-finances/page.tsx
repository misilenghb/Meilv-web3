"use client";

import { useState } from "react";
import AdminGuard from "../guard";

export default function TestGuideFinancesPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGuideFinances = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/guide-finances');
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          data: data,
          message: '地陪财务数据获取成功'
        });
      } else {
        setResult({
          success: false,
          error: data.error || '获取失败',
          data: data
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: '网络错误',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestSettlement = async () => {
    setLoading(true);
    
    try {
      // 先获取一个地陪ID
      const guidesResponse = await fetch('/api/admin/guide-finances');
      const guidesData = await guidesResponse.json();
      
      if (guidesData.guides && guidesData.guides.length > 0) {
        const firstGuide = guidesData.guides[0];
        
        const response = await fetch('/api/admin/guide-finances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guideId: firstGuide.guideId,
            amount: 100,
            settlementNotes: '测试结算记录'
          })
        });
        
        const data = await response.json();
        setResult({
          success: response.ok,
          data: data,
          message: response.ok ? '测试结算创建成功' : '测试结算创建失败'
        });
      } else {
        setResult({
          success: false,
          error: '没有找到可用的地陪',
          data: guidesData
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: '创建测试结算失败',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              测试地陪财务功能
            </h1>

            <div className="space-y-4 mb-6">
              <button
                onClick={testGuideFinances}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? '测试中...' : '测试获取地陪财务数据'}
              </button>

              <button
                onClick={createTestSettlement}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors ml-4"
              >
                {loading ? '创建中...' : '创建测试结算记录'}
              </button>
            </div>

            {result && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">测试结果</h2>
                
                {result.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium">{result.message}</h3>
                    
                    {result.data && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">数据详情：</h4>
                        
                        {result.data.stats && (
                          <div className="bg-white rounded p-3 mb-4">
                            <h5 className="font-medium mb-2">总体统计：</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>活跃地陪: {result.data.stats.totalGuides}</div>
                              <div>总订单: {result.data.stats.totalOrders}</div>
                              <div>总收入: ¥{result.data.stats.totalEarnings}</div>
                              <div>平台抽成: ¥{result.data.stats.totalCommission}</div>
                              <div>地陪净收入: ¥{result.data.stats.totalNetEarnings}</div>
                              <div>待结算: ¥{result.data.stats.pendingEarnings}</div>
                            </div>
                          </div>
                        )}
                        
                        {result.data.guides && result.data.guides.length > 0 && (
                          <div className="bg-white rounded p-3">
                            <h5 className="font-medium mb-2">地陪列表 (前3个)：</h5>
                            <div className="space-y-2">
                              {result.data.guides.slice(0, 3).map((guide: any, index: number) => (
                                <div key={index} className="text-sm border-b pb-2">
                                  <div className="font-medium">{guide.guideName}</div>
                                  <div className="text-gray-600">
                                    时薪: ¥{guide.hourlyRate} | 
                                    订单: {guide.totalOrders} | 
                                    收入: ¥{guide.totalEarnings} | 
                                    净收入: ¥{guide.netEarnings}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">测试失败</h3>
                    <p className="text-red-700 mt-1">{result.error}</p>
                    {result.details && (
                      <p className="text-red-600 text-sm mt-2">{result.details}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-red-600 cursor-pointer">查看详细错误信息</summary>
                        <pre className="text-xs mt-2 bg-red-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">功能说明：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>地陪财务数据</strong>：显示每个地陪的订单统计、收入情况、平台抽成等</li>
                <li>• <strong>应收应付管理</strong>：计算地陪的净收入（扣除30%平台抽成）</li>
                <li>• <strong>结算功能</strong>：管理员可以为地陪进行收入结算</li>
                <li>• <strong>财务统计</strong>：总体的收入、抽成、待结算金额统计</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">数据库要求：</h3>
              <p className="text-sm text-blue-700">
                需要先执行 <code>database/create-guide-settlements.sql</code> 创建地陪结算表
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
