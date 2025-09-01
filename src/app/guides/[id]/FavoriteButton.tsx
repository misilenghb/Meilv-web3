"use client";

import { useEffect, useState } from "react";
import { ModernIcons } from "@/components/icons/ModernIcons";

interface FavoriteButtonProps {
  guideId: string;
}

export default function FavoriteButton({ guideId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [guideId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch("/api/profile/favorites");
      if (response.ok) {
        const data = await response.json();
        const favorited = data.items?.some((fav: any) => fav.id === guideId);
        setIsFavorited(favorited || false);
      }
    } catch (err) {
      console.error("Failed to check favorite status:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    setUpdating(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/profile/favorites?guideId=${guideId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsFavorited(false);
        } else {
          const error = await response.json();
          alert(error.error || "取消收藏失败");
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/profile/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId }),
        });

        if (response.ok) {
          setIsFavorited(true);
        } else {
          const error = await response.json();
          if (error.error === "已经收藏过了") {
            setIsFavorited(true);
          } else {
            alert(error.error || "收藏失败");
          }
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Show user-friendly error
      alert(isFavorited ? "取消收藏失败，请重试" : "收藏失败，请重试");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400 cursor-not-allowed"
      >
        ⏳
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={updating}
      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
        isFavorited
          ? "border-pink-500 bg-pink-500 text-white hover:bg-pink-600 hover:border-pink-600"
          : "border-pink-500 text-pink-500 hover:bg-pink-50"
      } ${updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isFavorited ? "取消收藏" : "收藏地陪"}
    >
      {updating ? (
        <ModernIcons.Loading size={20} color="#ec4899" />
      ) : isFavorited ? (
        <ModernIcons.Heart size={20} color="white" />
      ) : (
        <ModernIcons.HeartOutline size={20} color="#ec4899" />
      )}
    </button>
  );
}
