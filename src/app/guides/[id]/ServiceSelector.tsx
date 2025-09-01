"use client";

import Link from "next/link";
import { useState } from "react";
import type { GuideProfile } from "@/types/domain";

export default function ServiceSelector({ guideId, services }: { guideId: string; services: GuideProfile["services"] }) {
  const [serviceCode, setServiceCode] = useState<GuideProfile["services"][number]["code"]>(services[0]?.code ?? "daily");

  return (
    <div className="card-pink p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">选择服务</h3>
      <div className="space-y-3">
        {services.map((s) => (
          <label key={s.code} className="flex items-start gap-3 p-3 border border-pink-200 rounded-xl hover:bg-pink-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="service"
              checked={serviceCode === s.code}
              onChange={() => setServiceCode(s.code)}
              className="mt-1 text-pink-500 focus:ring-pink-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{s.title}</div>
              <div className="text-sm text-gray-600">
                {s.pricePerHour && (
                  <span className="text-pink-600 font-medium">¥{s.pricePerHour}/小时</span>
                )}
                {s.packagePrice && (
                  <span className="text-pink-600 font-medium ml-2">套餐价 ¥{s.packagePrice}/10小时</span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-6">
        <Link
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full text-center font-medium transition-colors block"
          href={`/orders?guideId=${guideId}&serviceCode=${serviceCode}`}
        >
          立即预约
        </Link>
      </div>
    </div>
  );
}

