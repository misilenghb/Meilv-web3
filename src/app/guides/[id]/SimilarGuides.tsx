"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StarIcon, MapPinIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface SimilarGuide {
  id: string;
  displayName: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  photos: string[];
  city: string;
  ratingAvg: number;
  ratingCount: number;
  certificationStatus: string;
  similarity: number;
}

interface SimilarGuidesProps {
  guideId: string;
}

export default function SimilarGuides({ guideId }: SimilarGuidesProps) {
  const [guides, setGuides] = useState<SimilarGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSimilarGuides();
  }, [guideId]);

  const fetchSimilarGuides = async () => {
    try {
      const response = await fetch(`/api/guides/${guideId}/similar?limit=4`);
      const data = await response.json();
      setGuides(data.items || []);
    } catch (error) {
      console.error('Failed to fetch similar guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (guideId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(guideId)) {
      newFavorites.delete(guideId);
    } else {
      newFavorites.add(guideId);
    }
    setFavorites(newFavorites);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">相似推荐</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-32 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">相似推荐</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>暂无相似地陪推荐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">相似推荐</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100 group hover:shadow-md transition-all duration-200">
            {/* Photo */}
            <div className="relative mb-3">
              <div className="aspect-video rounded-lg overflow-hidden">
                {guide.photos && guide.photos.length > 0 ? (
                  <img
                    src={guide.photos[0]}
                    alt={guide.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{guide.displayName.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(guide.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
              >
                {favorites.has(guide.id) ? (
                  <HeartSolidIcon className="w-4 h-4 text-pink-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Similarity Badge */}
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                {guide.similarity}% 匹配
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-800 truncate">{guide.displayName}</h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-600">¥{guide.hourlyRate}</div>
                  <div className="text-xs text-gray-500">每小时</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-600">
                <MapPinIcon className="w-3 h-3" />
                <span className="text-sm">{guide.city}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(guide.ratingAvg)}
                </div>
                <span className="text-xs text-gray-600">
                  {guide.ratingAvg} ({guide.ratingCount})
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{guide.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {guide.skills.slice(0, 2).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {guide.skills.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{guide.skills.length - 2}
                  </span>
                )}
              </div>

              {/* Action */}
              <Link
                href={`/guides/${guide.id}`}
                className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-center py-2 rounded-lg transition-all duration-200 text-sm font-medium mt-3"
              >
                查看详情
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      <div className="text-center mt-6">
        <Link
          href="/guides"
          className="text-pink-600 hover:text-pink-700 text-sm font-medium"
        >
          查看更多地陪 →
        </Link>
      </div>
    </div>
  );
}
