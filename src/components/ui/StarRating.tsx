'use client';

import React from 'react';
import { ModernIcons } from '@/components/icons/ModernIcons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showValue = true,
  reviewCount,
  className = "",
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="flex gap-1" 
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i;
          const isFilled = starIndex < Math.floor(displayRating);
          const isHalfFilled = starIndex === Math.floor(displayRating) && displayRating % 1 >= 0.5;
          
          return (
            <div
              key={i}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
            >
              {isFilled || isHalfFilled ? (
                <ModernIcons.Star 
                  size={size} 
                  color="#fbbf24" 
                  className={interactive ? "hover:drop-shadow-md" : ""}
                />
              ) : (
                <ModernIcons.StarOutline 
                  size={size} 
                  color="#d1d5db" 
                  className={interactive ? "hover:fill-yellow-400" : ""}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-gray-600 text-sm">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-1">({reviewCount}条评价)</span>
          )}
        </span>
      )}
    </div>
  );
}

// 简化版本，只显示星星
export function SimpleStarRating({ 
  rating, 
  size = 14, 
  className = "" 
}: { 
  rating: number; 
  size?: number; 
  className?: string; 
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        i < Math.floor(rating) ? (
          <ModernIcons.Star key={i} size={size} color="#fbbf24" />
        ) : (
          <ModernIcons.StarOutline key={i} size={size} color="#d1d5db" />
        )
      ))}
    </div>
  );
}

// 大尺寸展示版本
export function LargeStarRating({ 
  rating, 
  reviewCount, 
  className = "" 
}: { 
  rating: number; 
  reviewCount?: number; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          i < Math.floor(rating) ? (
            <ModernIcons.Star key={i} size={24} color="#fbbf24" />
          ) : (
            <ModernIcons.StarOutline key={i} size={24} color="#d1d5db" />
          )
        ))}
      </div>
      <div className="text-lg font-semibold text-gray-700">
        {rating.toFixed(1)}
        {reviewCount !== undefined && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({reviewCount}条评价)
          </span>
        )}
      </div>
    </div>
  );
}

// 交互式评分组件
export function InteractiveStarRating({ 
  rating, 
  onRatingChange, 
  size = 20, 
  className = "" 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
  size?: number; 
  className?: string; 
}) {
  return (
    <StarRating
      rating={rating}
      size={size}
      interactive={true}
      onRatingChange={onRatingChange}
      showValue={false}
      className={className}
    />
  );
}
