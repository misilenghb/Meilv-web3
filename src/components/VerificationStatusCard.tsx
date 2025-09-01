"use client";

import { ModernIcons } from "@/components/icons/ModernIcons";
import Link from "next/link";

interface VerificationStatus {
  status: "unverified" | "pending" | "verified" | "rejected" | "suspended";
  applicationId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  canReapply?: boolean;
}

interface VerificationStatusCardProps {
  status: VerificationStatus;
  showActions?: boolean;
  compact?: boolean;
}

export default function VerificationStatusCard({ 
  status, 
  showActions = true, 
  compact = false 
}: VerificationStatusCardProps) {
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case "unverified":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "need_more_info":
        return "bg-orange-100 text-orange-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (statusValue: string) => {
    switch (statusValue) {
      case "unverified":
        return "未认证";
      case "pending":
        return "审核中";
      case "verified":
        return "已认证";
      case "rejected":
        return "已拒绝";
      case "need_more_info":
        return "需补充材料";
      case "suspended":
        return "已暂停";
      default:
        return "未知状态";
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "unverified":
        return <ModernIcons.Warning size={24} className="text-gray-600" />;
      case "pending":
        return <ModernIcons.Loading size={24} className="text-yellow-600" />;
      case "verified":
        return <ModernIcons.Check size={24} className="text-green-600" />;
      case "rejected":
        return <ModernIcons.X size={24} className="text-red-600" />;
      case "need_more_info":
        return <ModernIcons.Info size={24} className="text-orange-600" />;
      case "suspended":
        return <ModernIcons.X size={24} className="text-red-600" />;
      default:
        return <ModernIcons.Info size={24} className="text-gray-600" />;
    }
  };

  const getStatusDescription = (statusValue: string) => {
    switch (statusValue) {
      case "unverified":
        return "您还未提交地陪认证申请，请完成认证以开始提供服务";
      case "pending":
        return "您的认证申请正在审核中，请耐心等待审核结果";
      case "verified":
        return "恭喜！您已通过地陪认证，可以正常提供服务";
      case "rejected":
        return "很抱歉，您的认证申请未通过审核，请查看审核意见并修改资料重新申请";
      case "need_more_info":
        return "您的申请需要补充更多材料，请根据要求修改资料并重新提交";
      case "suspended":
        return "您的地陪认证已被暂停，请联系客服了解详情";
      default:
        return "认证状态未知，请联系客服";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {getStatusIcon(status.status)}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">认证状态</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status.status)}`}>
              {getStatusText(status.status)}
            </span>
          </div>
          {status.submittedAt && (
            <p className="text-sm text-gray-500">
              提交于 {new Date(status.submittedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2">
            {status.status === "unverified" && (
              <Link
                href="/apply-guide"
                className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700 transition-colors"
              >
                开始认证
              </Link>
            )}
            {status.applicationId && (
              <Link
                href={`/guide-dashboard/verification/${status.applicationId}`}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                查看详情
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
          {getStatusIcon(status.status)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">地陪认证</h3>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(status.status)}`}>
              {getStatusText(status.status)}
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            {getStatusDescription(status.status)}
          </p>
          
          {status.submittedAt && (
            <div className="text-sm text-gray-500 mb-4">
              提交时间：{new Date(status.submittedAt).toLocaleDateString('zh-CN')}
              {status.reviewedAt && (
                <span className="ml-4">
                  审核时间：{new Date(status.reviewedAt).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          )}

          {status.reviewNotes && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">审核备注</h4>
              <p className="text-sm text-gray-600">{status.reviewNotes}</p>
            </div>
          )}

          {showActions && (
            <div className="flex gap-3">
              {status.status === "unverified" && (
                <Link
                  href="/apply-guide"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  开始认证
                </Link>
              )}
              {(status.status === "rejected" || status.status === "need_more_info") && status.canReapply && (
                <Link
                  href="/apply-guide?edit=true"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  修改并重新申请
                </Link>
              )}
              {status.applicationId && (
                <Link
                  href={`/guide-dashboard/verification/${status.applicationId}`}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  查看详情
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
