import Link from "next/link";
import ServerAdminGuard from "./server-guard";

export default function AdminPage() {
  return (
    <ServerAdminGuard>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">管理后台</h1>
            <p className="text-gray-600">平台运营管理中心</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card-pink p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">156</div>
              <div className="text-gray-600">注册用户</div>
            </div>
            <div className="card-pink p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">23</div>
              <div className="text-gray-600">认证地陪</div>
            </div>
            <div className="card-pink p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">89</div>
              <div className="text-gray-600">完成订单</div>
            </div>
            <div className="card-pink p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">¥12.5K</div>
              <div className="text-gray-600">平台收入</div>
            </div>
          </div>

          {/* Management Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/applications"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📝
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">地陪申请审核</h3>
                  <div className="text-sm text-green-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">审核新提交的地陪申请，处理申请材料</p>
            </Link>

            <Link
              href="/admin/guides"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">地陪认证管理</h3>
                  <div className="text-sm text-green-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">管理已注册地陪的认证状态和档案信息</p>
            </Link>

            <div className="card-pink p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">用户管理</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">用户信息、行为监控、权限管理</p>
            </div>

            <Link
              href="/admin/orders"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📋
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">订单管理</h3>
                  <div className="text-sm text-green-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">订单监控、状态管理、异常处理</p>
            </Link>

            <Link
              href="/admin/payments"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">收款管理</h3>
                  <div className="text-sm text-emerald-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">保证金收取，见面时收取尾款，收款记录管理</p>
            </Link>

            <Link
              href="/admin/refunds"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                  💸
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">退款管理</h3>
                  <div className="text-sm text-orange-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">处理用户退款申请，审核退款原因，执行退款操作</p>
            </Link>

            <div className="card-pink p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  🛡️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">投诉处理</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">投诉分类、处理流程、纠纷调解</p>
            </div>

            <Link
              href="/admin/guide-finances"
              className="card-pink p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">地陪财务</h3>
                  <div className="text-sm text-purple-600 font-medium">已开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">地陪收入统计、应收应付管理、佣金结算</p>
            </Link>

            <div className="card-pink p-6 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white text-xl">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">系统设置</h3>
                  <div className="text-sm text-orange-600 font-medium">待开发</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">平台配置、参数管理、权限设置</p>
            </div>
          </div>
        </div>
      </div>
    </ServerAdminGuard>
  );
}

