"use client";

import { useState, useEffect } from "react";

interface ReviewFormProps {
  guideId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ guideId, onReviewSubmitted }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [permissionMessage, setPermissionMessage] = useState("");

  useEffect(() => {
    checkReviewPermission();
  }, [guideId]);

  const checkReviewPermission = async () => {
    try {
      const response = await fetch(`/api/reviews/check-permission?guideId=${guideId}`);
      const data = await response.json();

      setCanReview(data.canReview);
      setPermissionMessage(data.message || "");
    } catch (error) {
      console.error("Failed to check review permission:", error);
      setCanReview(false);
      setPermissionMessage("无法检查评价权限");
    } finally {
      setCheckingPermission(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId,
          rating,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        setRating(5);
        setContent("");
        onReviewSubmitted();
      } else {
        const error = await response.json();
        alert(`评价失败: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("评价失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className={`text-2xl transition-colors ${
          i < rating ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-yellow-300"
        }`}
      >
        ★
      </button>
    ));
  };

  if (checkingPermission) {
    return (
      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full">
        检查权限中...
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full cursor-not-allowed" title={permissionMessage}>
        ⭐ 写评价
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full transition-colors"
      >
        ⭐ 写评价
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">写评价</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评分
            </label>
            <div className="flex gap-1">
              {renderStars()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 1 && "很差"}
              {rating === 2 && "较差"}
              {rating === 3 && "一般"}
              {rating === 4 && "很好"}
              {rating === 5 && "非常好"}
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评价内容（可选）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的服务体验..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/500
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium transition-colors hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "提交评价"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
