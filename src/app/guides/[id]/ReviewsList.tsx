"use client";

import { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  content?: string;
  createdAt: string;
  userName: string;
}

export default function ReviewsList({ guideId }: { guideId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [guideId]);

  const loadReviews = () => {
    fetch(`/api/guides/${guideId}/reviews`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setReviews(data.items || []))
      .finally(() => setLoading(false));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="card-pink p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">用户评价 ({reviews.length})</h2>
        <ReviewForm guideId={guideId} onReviewSubmitted={loadReviews} />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-600">暂无评价，成为第一个评价的用户吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/70 rounded-2xl p-4 border border-pink-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{review.userName}</div>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.content && (
                <div className="text-gray-700 leading-relaxed">{review.content}</div>
              )}
            </div>
          ))}

          {/* Show More Button */}
          {reviews.length >= 5 && (
            <div className="text-center pt-4">
              <button className="text-pink-600 hover:text-pink-700 font-medium">
                查看更多评价 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
