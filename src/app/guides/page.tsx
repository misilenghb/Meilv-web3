"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, MapPinIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface Guide {
  id: string;
  displayName: string;
  bio?: string;
  skills?: string[];
  hourlyRate: number;
  services?: Array<{ title: string; pricePerHour?: number }>;
  photos?: string[];
  city: string;
  location: string;
  ratingAvg?: number;
  ratingCount?: number;
  certificationStatus: string;
  createdAt: string;
  user?: {
    name: string;
    avatarUrl?: string;
  };
}

interface Filters {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  skills: string[];
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [totalGuides, setTotalGuides] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    skills: []
  });

  const cities = ["杭州", "上海", "北京", "成都", "深圳", "西安", "广州", "南京"];
  const popularSkills = ["景点讲解", "美食推荐", "拍照指导", "购物陪同", "文化介绍", "英语翻译"];

  useEffect(() => {
    fetchGuides(1, false);
    fetchPendingOrders();
    fetchFavorites();
  }, [filters]);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=PAID');
      if (response.ok) {
        const orders = await response.json();
        setPendingOrders(orders);
      }
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  };

  const fetchGuides = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');

      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));

      console.log('Fetching guides with params:', params.toString());
      const response = await fetch(`/api/guides?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Guides API response:', data);

      if (append) {
        setGuides(prev => [...prev, ...(data.items || [])]);
      } else {
        setGuides(data.items || []);
      }

      setTotalGuides(data.pagination?.total || 0);
      setCurrentPage(page);
      setHasMore(page < (data.pagination?.totalPages || 1));
    } catch (error) {
      console.error('Failed to fetch guides:', error);
      if (!append) {
        setGuides([]);
        setTotalGuides(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuides(1, false);
  };

  const loadMoreGuides = () => {
    if (!loadingMore && hasMore) {
      fetchGuides(currentPage + 1, true);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/profile/favorites");
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.items?.map((fav: any) => fav.id) || []);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (guideId: string) => {
    // 防止重复点击
    if (favoriteLoading.has(guideId)) return;

    const newFavoriteLoading = new Set(favoriteLoading);
    newFavoriteLoading.add(guideId);
    setFavoriteLoading(newFavoriteLoading);

    try {
      const isFavorited = favorites.has(guideId);

      if (isFavorited) {
        // 取消收藏
        const response = await fetch(`/api/profile/favorites?guideId=${guideId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.delete(guideId);
          setFavorites(newFavorites);
        } else {
          const error = await response.json();
          alert(error.error || "取消收藏失败");
        }
      } else {
        // 添加收藏
        const response = await fetch("/api/profile/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId }),
        });

        if (response.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.add(guideId);
          setFavorites(newFavorites);
        } else {
          const error = await response.json();
          if (error.error === "已经收藏过了") {
            const newFavorites = new Set(favorites);
            newFavorites.add(guideId);
            setFavorites(newFavorites);
          } else {
            alert(error.error || "收藏失败");
          }
        }
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      alert("操作失败，请重试");
    } finally {
      const newFavoriteLoading = new Set(favoriteLoading);
      newFavoriteLoading.delete(guideId);
      setFavoriteLoading(newFavoriteLoading);
    }
  };

  const selectGuide = async (guideId: string, hourlyRate: number) => {
    if (pendingOrders.length === 0) {
      alert('您没有待选择地陪的订单，请先创建订单并支付保证金');
      return;
    }

    if (pendingOrders.length > 1) {
      alert('您有多个待选择地陪的订单，请联系客服处理');
      return;
    }

    const order = pendingOrders[0];

    try {
      const response = await fetch(`/api/orders/${order.id}/select-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideId,
          hourlyRate
        })
      });

      if (response.ok) {
        alert('地陪选择成功！我们会尽快安排服务。');
        // 刷新待选择订单列表
        fetchPendingOrders();
      } else {
        const error = await response.json();
        alert(error.error || '选择地陪失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            精选地陪
          </h1>
          <p className="text-gray-600 text-lg">为您推荐优质的本地陪伴服务</p>

        </div>

        {/* 待选择地陪订单提示 */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    您有 {pendingOrders.length} 个订单待选择地陪
                  </h3>
                  <p className="text-blue-800 mb-4">
                    您已支付保证金，现在可以选择心仪的地陪。点击下方地陪卡片中的"选择此地陪"按钮即可。
                  </p>
                  <div className="space-y-2">
                    {pendingOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {order.requirement.serviceType === 'daily' ? '日常陪伴' :
                               order.requirement.serviceType === 'mild_entertainment' ? '微醺娱乐' : '同城旅游'}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(order.requirement.startTime).toLocaleDateString('zh-CN')}
                              {order.requirement.duration}小时
                            </span>
                          </div>
                          <span className="text-sm text-blue-600 font-medium">
                            已付保证金 ¥{order.depositAmount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="glass-card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索地陪、城市或服务..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/90"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-pink-200 hover:bg-pink-50 transition-colors bg-white/90"
                >
                  <FunnelIcon className="w-5 h-5" />
                  筛选
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  搜索
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-pink-100">
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/90"
                >
                  <option value="">选择城市</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/90"
                >
                  <option value="">最低评分</option>
                  <option value="4.5">4.5分以上</option>
                  <option value="4.0">4.0分以上</option>
                  <option value="3.5">3.5分以上</option>
                </select>

                <input
                  type="number"
                  placeholder="最低价格"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/90"
                />

                <input
                  type="number"
                  placeholder="最高价格"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/90"
                />
              </div>
            )}

            {/* Popular Skills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 py-2">热门技能：</span>
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    const newSkills = filters.skills.includes(skill)
                      ? filters.skills.filter(s => s !== skill)
                      : [...filters.skills, skill];
                    setFilters({ ...filters, skills: newSkills });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.skills.includes(skill)
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guides Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无符合条件的地陪</h3>
                <p className="text-gray-600">试试调整搜索条件或筛选器</p>
              </div>
            ) : (
              guides.map((guide) => (
                <div key={guide.id} className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-0">
                  {/* Photo */}
                  <div className="relative h-48 overflow-hidden">
                    {guide.photos && guide.photos.length > 0 ? (
                      <img
                        src={guide.photos[0]}
                        alt={guide.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">{guide.displayName.charAt(0)}</span>
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(guide.id)}
                      disabled={favoriteLoading.has(guide.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {favoriteLoading.has(guide.id) ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                      ) : favorites.has(guide.id) ? (
                        <HeartSolidIcon className="w-5 h-5 text-pink-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {/* Verification Badge */}
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      ✓ 已认证
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{guide.displayName}</h3>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="text-sm">{guide.city}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600">¥{guide.hourlyRate}</div>
                        <div className="text-xs text-gray-500">每小时</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {renderStars(guide.ratingAvg || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {guide.ratingAvg || '暂无评分'} ({guide.ratingCount || 0}条评价)
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{guide.bio || '暂无介绍'}</p>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(guide.skills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {guide.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{guide.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/guides/${guide.id}`}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-center py-3 px-4 rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        查看详情
                      </Link>
                      {pendingOrders.length > 0 ? (
                        <button
                          onClick={() => selectGuide(guide.id, guide.hourlyRate)}
                          className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl transition-colors font-medium"
                        >
                          选择此地陪
                        </button>
                      ) : (
                        <Link
                          href={`/booking?guideId=${guide.id}`}
                          className="px-4 py-3 border border-pink-300 text-pink-600 hover:bg-pink-50 rounded-2xl transition-colors font-medium"
                        >
                          立即预订
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Load More */}
        {!loading && guides.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={loadMoreGuides}
              disabled={loadingMore}
              className="bg-white/80 backdrop-blur-sm border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-3 rounded-2xl font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  加载中...
                </div>
              ) : (
                "加载更多地陪"
              )}
            </button>
          </div>
        )}

        {/* No More Results */}
        {!loading && guides.length > 0 && !hasMore && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              已显示全部 {totalGuides} 位地陪
            </p>
          </div>
        )}

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>当前页: {currentPage}</div>
              <div>已加载: {guides.length}</div>
              <div>总数: {totalGuides}</div>
              <div>还有更多: {hasMore ? '是' : '否'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

