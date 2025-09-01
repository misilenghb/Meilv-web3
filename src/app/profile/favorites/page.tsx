"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HeartIcon, StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";

interface FavoriteGuide {
  id: string;
  guideId: string;
  displayName: string;
  city: string;
  ratingAvg: number;
  ratingCount: number;
  hourlyRate: number;
  photos: string[];
  certificationStatus: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/profile/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.items || []);
      } else {
        console.error("Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (guideId: string) => {
    if (!confirm("确定要取消收藏这个地陪吗？")) {
      return;
    }

    setRemovingId(guideId);
    try {
      const response = await fetch(`/api/profile/favorites?guideId=${guideId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.guideId !== guideId));
      } else {
        const error = await response.json();
        alert(error.error || "取消收藏失败");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("取消收藏失败");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/profile"
              className="text-pink-600 hover:text-pink-700 transition-colors"
            >
              ← 返回个人中心
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">收藏的地陪</h1>
          <p className="text-gray-600">
            您收藏了 {favorites.length} 个地陪
          </p>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="card-pink p-12 text-center">
            <div className="text-6xl mb-6">💝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">还没有收藏的地陪</h2>
            <p className="text-gray-600 mb-6">
              发现优质地陪，收藏您喜欢的服务提供者
            </p>
            <Link
              href="/guides"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-2xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              去发现地陪 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((guide) => (
              <div
                key={guide.id}
                className="card-pink p-6 hover:shadow-lg transition-all duration-200 group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(guide.guideId)}
                  disabled={removingId === guide.guideId}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  title="取消收藏"
                >
                  {removingId === guide.guideId ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>

                <Link href={`/guides/${guide.id}`} className="block">
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      {guide.photos && guide.photos.length > 0 ? (
                        <img
                          src={guide.photos[0]}
                          alt={guide.displayName}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {guide.displayName.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Verification Badge */}
                      {guide.certificationStatus === "verified" && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                        {guide.displayName}
                      </h3>
                      <p className="text-sm text-gray-600">{guide.city}</p>
                    </div>
                  </div>

                  {/* Rating and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {guide.ratingAvg?.toFixed(1) || "暂无评分"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({guide.ratingCount || 0})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-pink-600">
                        ¥{guide.hourlyRate}
                      </div>
                      <div className="text-xs text-gray-500">每小时</div>
                    </div>
                  </div>

                  {/* Favorite Date */}
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-xs text-gray-500">
                      收藏于 {new Date(guide.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
