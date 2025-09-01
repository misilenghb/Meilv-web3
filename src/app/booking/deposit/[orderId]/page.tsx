"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function DepositPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();

  useEffect(() => {
    // 人工收款模式下，直接跳转到选择地陪页面
    router.replace(`/booking/select-guide/${orderId}`);
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到选择地陪页面...</p>
      </div>
    </div>
  );
}
