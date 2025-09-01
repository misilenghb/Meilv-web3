"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassField, GlassTextarea, useToast } from "@/components/ui";

interface ReviewFormProps {
  orderId: string;
  userId: string;
  guideId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ orderId, userId, guideId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function submit() {
    if (!rating) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, userId, guideId, rating, content }),
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("评价提交成功！", "success");
        onSuccess?.();
      } else {
        showToast(data.error || "提交失败", "error");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      showToast("提交失败", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard>
      <div className="space-y-4">
        <div className="font-medium">评价服务</div>

        <GlassField label="评分" required>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`text-2xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-400"} hover:text-yellow-300`}
                onClick={() => setRating(star)}
                aria-label={`${star}星评分`}
              >
                ★
              </button>
            ))}
          </div>
        </GlassField>

        <GlassField label="评价内容（可选）">
          <GlassTextarea
            placeholder="分享您的服务体验..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </GlassField>

        <GlassButton
          variant="primary"
          onClick={submit}
          disabled={!rating}
          loading={submitting}
        >
          提交评价
        </GlassButton>
      </div>
    </GlassCard>
  );
}
