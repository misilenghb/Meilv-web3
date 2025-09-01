"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ServiceSelector from "./ServiceSelector";
import ReviewsList from "./ReviewsList";
import FavoriteButton from "./FavoriteButton";
import SimilarGuides from "./SimilarGuides";
import ShareButton from "@/components/ui/ShareButton";
import ChatButton from "@/components/ui/ChatButton";
import Link from "next/link";
import { ModernIcons } from "@/components/icons/ModernIcons";
import StarRating from "@/components/ui/StarRating";
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  HeartIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface Guide {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  services: Array<{ title: string; pricePerHour?: number }>;
  photos: string[];
  city: string;
  location: string;
  ratingAvg: number;
  ratingCount: number;
  certificationStatus: string;
  createdAt: string;
  user: {
    name: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export default function GuideDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/guides/${id}`);
      if (response.ok) {
        const data = await response.json();
        setGuide(data);
      } else {
        setGuide(null);
      }
    } catch (error) {
      console.error('Failed to fetch guide:', error);
      setGuide(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white/80 rounded-3xl p-8 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-3xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-pink-100 shadow-lg">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">地陪不存在</h1>
            <p className="text-gray-600 mb-6">抱歉，您查找的地陪信息不存在或已下线</p>
            <Link
              href="/guides"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              返回地陪列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Photo Gallery */}
            <div className="lg:w-1/2">
              <div className="relative">
                {/* Main Photo */}
                <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                  {guide.photos && guide.photos.length > 0 ? (
                    <img
                      src={guide.photos[activePhotoIndex]}
                      alt={guide.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{guide.displayName.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Photo Thumbnails */}
                {guide.photos && guide.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {guide.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePhotoIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === activePhotoIndex ? 'border-pink-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={photo} alt={`${guide.displayName} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-1/2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">{guide.displayName}</h1>
                    <CheckBadgeIcon className="w-8 h-8 text-green-500" title="已认证" />
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{guide.city}{guide.location && ` · ${guide.location}`}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 bg-white border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-6 h-6 text-pink-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                  <ShareButton
                    title={guide.displayName}
                    description={guide.bio}
                    imageUrl={guide.photos?.[0]}
                  />
                  <ChatButton
                    guideId={guide.id}
                    guideName={guide.displayName}
                    guideAvatar={guide.photos?.[0]}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {renderStars(guide.ratingAvg)}
                </div>
                <span className="text-lg font-semibold text-gray-800">{guide.ratingAvg}</span>
                <span className="text-gray-600">({guide.ratingCount}条评价)</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CurrencyDollarIcon className="w-5 h-5 text-pink-600" />
                      <span className="text-sm text-gray-600">服务价格</span>
                    </div>
                    <div className="text-3xl font-bold text-pink-600">¥{guide.hourlyRate}</div>
                    <div className="text-sm text-gray-600">每小时起</div>
                  </div>
                  <Link
                    href={`/booking?guideId=${guide.id}`}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    立即预订
                  </Link>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">个人介绍</h3>
                <p className="text-gray-600 leading-relaxed">{guide.bio}</p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">专业技能</h3>
                <div className="flex flex-wrap gap-2">
                  {(guide.skills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
            {/* Services */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">服务项目</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.services && guide.services.length > 0 ? (
                  guide.services.map((service, index) => (
                    <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                      <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                      {service.pricePerHour && (
                        <div className="text-pink-600 font-bold">¥{service.pricePerHour}/小时</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    暂无服务项目信息
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">服务区域</h2>
              <div className="h-64 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center text-gray-600">
                <div className="text-center">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2 text-pink-500" />
                  <p>服务区域：{guide.city}</p>
                  <p className="text-sm mt-1">地图功能开发中...</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100">
              <ReviewsList guideId={guide.id} />
            </div>
        </div>

        {/* Similar Guides */}
        <SimilarGuides guideId={guide.id} />
      </div>
    </div>
  );
}

