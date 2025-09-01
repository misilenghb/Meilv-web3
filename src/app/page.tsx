import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 md:py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-white opacity-80"></div>
        <div className="relative max-w-5xl mx-auto text-center">


          <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent animate-fade-in-up animate-delay-100">
              专业陪伴服务
            </span>
            <span className="block text-gray-800 animate-fade-in-up animate-delay-200">
              重新定义健康社交
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animate-delay-300 px-2">
            告别孤单，拥抱温暖。我们为您提供安全、专业、贴心的陪伴体验，
            <br className="hidden md:block" />
            让每一次相遇都成为美好回忆的开始
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 animate-fade-in-up animate-delay-400 px-4">
            <Link
              href="/booking"
              className="btn-primary text-base md:text-lg px-6 md:px-10 py-3 md:py-4 animate-scale-in animate-delay-500 flex items-center justify-center gap-2 md:gap-3 touch-target"
            >
              <ModernIcons.Brand size={20} color="white" className="md:hidden" />
              <ModernIcons.Brand size={24} color="white" className="hidden md:block" />
              立即开始预约 →
            </Link>
            <Link
              href="/guides"
              className="btn-secondary text-base md:text-lg px-6 md:px-10 py-3 md:py-4 animate-scale-in animate-delay-600 flex items-center justify-center gap-2 md:gap-3 touch-target"
            >
              <ModernIcons.Users size={20} className="md:hidden" />
              <ModernIcons.Users size={24} className="hidden md:block" />
              浏览优质地陪
            </Link>
          </div>

          {/* 💎 信任指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 max-w-4xl mx-auto animate-fade-in-up animate-delay-500 px-2">
            <div className="text-center glass-card mobile-card p-3 md:p-6 animate-scale-in animate-delay-600">
              <div className="mobile-stat-number text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-1 md:mb-2">100%</div>
              <div className="flex items-center justify-center gap-1 md:gap-2 mobile-stat-label text-xs md:text-sm text-gray-600 font-medium">
                <ModernIcons.Shield size={14} color="#10b981" className="md:hidden" />
                <ModernIcons.Shield size={18} color="#10b981" className="hidden md:block" />
                实名认证
              </div>
            </div>
            <div className="text-center glass-card mobile-card p-3 md:p-6 animate-scale-in animate-delay-700">
              <div className="mobile-stat-number text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-1 md:mb-2">24/7</div>
              <div className="flex items-center justify-center gap-1 md:gap-2 mobile-stat-label text-xs md:text-sm text-gray-600 font-medium">
                <ModernIcons.Shield size={14} color="#10b981" className="md:hidden" />
                <ModernIcons.Shield size={18} color="#10b981" className="hidden md:block" />
                客服支持
              </div>
            </div>
            <div className="text-center glass-card mobile-card p-3 md:p-6 animate-scale-in animate-delay-800">
              <div className="mobile-stat-number text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-1 md:mb-2">500+</div>
              <div className="flex items-center justify-center gap-1 md:gap-2 mobile-stat-label text-xs md:text-sm text-gray-600 font-medium">
                <ModernIcons.Star size={14} color="#fbbf24" className="md:hidden" />
                <ModernIcons.Star size={18} color="#fbbf24" className="hidden md:block" />
                优质地陪
              </div>
            </div>
            <div className="text-center glass-card mobile-card p-3 md:p-6 animate-scale-in animate-delay-900">
              <div className="mobile-stat-number text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-1 md:mb-2">98%</div>
              <div className="flex items-center justify-center gap-1 md:gap-2 mobile-stat-label text-xs md:text-sm text-gray-600 font-medium">
                <ModernIcons.Heart size={14} color="#ec4899" className="md:hidden" />
                <ModernIcons.Heart size={18} color="#ec4899" className="hidden md:block" />
                满意度
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 服务项目详情 */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20 animate-fade-in-up">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-6 flex items-center justify-center gap-2 md:gap-4">
              <ModernIcons.Brand size={32} className="md:hidden" />
              <ModernIcons.Brand size={48} className="hidden md:block" />
              专业陪伴服务
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              精心设计的陪伴体验，为现代都市人提供安全、专业、温暖的社交陪伴，让每一刻都充满温暖
            </p>
          </div>

          {/* 💝 专业陪伴服务 */}
          <div className="mb-12 md:mb-20 animate-fade-in-up animate-delay-100">
            <div className="glass-card mobile-card overflow-hidden">
              {/* 🌟 服务头部 */}
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-6 md:p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10 gap-4 md:gap-0">
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-float">
                      <ModernIcons.Gift size={32} color="white" className="md:hidden" />
                      <ModernIcons.Gift size={48} color="white" className="hidden md:block" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-3">专业陪伴服务</h3>
                      <p className="text-pink-100 text-base md:text-xl">温暖陪伴，健康社交</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-2xl md:text-3xl font-bold">198元</div>
                    <div className="text-pink-100 text-sm md:text-base">/小时起</div>
                  </div>
                </div>
              </div>

              {/* 服务内容 */}
              <div className="p-4 md:p-8">
                <div className="mb-6 md:mb-8">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">服务理念</h4>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    我们致力于为现代都市人提供专业、安全、温暖的陪伴服务。通过精心设计的社交场景，
                    让每一次相遇都成为美好回忆的开始。告别孤单，拥抱温暖，重新定义健康社交。
                  </p>
                </div>

                {/* 服务类型 */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div className="space-y-3 md:space-y-4">
                    <h5 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-2 md:mr-3"></span>
                      陪伴搭子服务
                    </h5>
                    <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600 ml-4 md:ml-5">
                      <li>• 实名认证资料透明，安全可靠</li>
                      <li>• 支持逛展、citywalk、自习陪伴</li>
                      <li>• 公开场合轻社交，同频互动</li>
                      <li>• 2小时起订，灵活安排</li>
                      <li>• 专业培训，服务标准化</li>
                    </ul>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h5 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-2 md:mr-3"></span>
                      情感陪伴服务
                    </h5>
                    <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600 ml-4 md:ml-5">
                      <li>• 专业情绪倾听，温暖治愈</li>
                      <li>• 友好交流，无过度肢体接触</li>
                      <li>• 主打「情感快充」理念</li>
                      <li>• 为心灵提供正向情绪支持</li>
                      <li>• 遵守道德规范，健康交往</li>
                    </ul>
                  </div>
                </div>

                {/* 适用场景 */}
                <div className="mb-6 md:mb-8 p-4 md:p-6 bg-pink-50 rounded-2xl">
                  <h5 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">适用场景</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">📚 学习陪伴</h6>
                      <p className="text-xs md:text-sm text-gray-600">图书馆、咖啡厅自习，提供专注氛围</p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">🎨 文化体验</h6>
                      <p className="text-xs md:text-sm text-gray-600">博物馆、展览、艺术空间参观</p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">🚶 城市漫步</h6>
                      <p className="text-xs md:text-sm text-gray-600">公园散步、商圈逛街、城市探索</p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">🍽️ 美食分享</h6>
                      <p className="text-xs md:text-sm text-gray-600">餐厅用餐、美食探店、品茶聊天</p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">🎬 娱乐休闲</h6>
                      <p className="text-xs md:text-sm text-gray-600">电影院、KTV、游戏厅等娱乐场所</p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-2xl">
                      <h6 className="text-sm md:text-base font-medium text-gray-800 mb-1 md:mb-2">💬 情感倾诉</h6>
                      <p className="text-xs md:text-sm text-gray-600">安静环境下的深度交流与倾听</p>
                    </div>
                  </div>
                </div>



                <div className="mt-6 md:mt-8 p-3 md:p-4 bg-pink-50 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <span className="text-xs md:text-base text-gray-700 font-medium text-center md:text-left">推荐时长：2-4小时 | 灵活预约，贴心安排</span>
                    <Link
                      href="/booking"
                      className="bg-pink-600 hover:bg-pink-700 text-white px-4 md:px-6 py-2 md:py-2 rounded-full text-sm md:text-base font-medium transition-colors touch-target text-center"
                    >
                      立即预约
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 md:p-12 text-white">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-2">准备好开始您的陪伴之旅了吗？</h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-pink-100 px-2">
              专业地陪，温暖陪伴，让孤独成为过去式
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
              <Link
                href="/booking"
                className="bg-white text-pink-600 hover:bg-gray-50 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 touch-target"
              >
                立即预约陪伴服务 →
              </Link>
              <Link
                href="/guides"
                className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-all duration-300 touch-target"
              >
                浏览优质地陪
              </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 text-pink-100 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>24小时客服支持</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>满意度保障</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>安全可靠</span>
              </div>
            </div>
          </div>


        </div>
      </section>
    </div>
  );
}
