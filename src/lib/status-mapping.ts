/**
 * 地陪审核状态映射工具
 * 统一管理申请状态和地陪认证状态之间的映射关系
 */

// 申请状态枚举
export type ApplicationStatus = 
  | "pending"           // 待审核
  | "under_review"      // 审核中
  | "approved"          // 已通过
  | "rejected"          // 已拒绝
  | "need_more_info";   // 需要补充材料

// 地陪认证状态枚举
export type GuideVerificationStatus = 
  | "verified"          // 已认证
  | "pending"           // 待认证
  | "rejected";         // 认证被拒

/**
 * 将申请状态映射为地陪认证状态
 */
export function mapApplicationStatusToVerificationStatus(
  applicationStatus: ApplicationStatus
): GuideVerificationStatus {
  switch (applicationStatus) {
    case "approved":
      return "verified";
    case "rejected":
      return "rejected";
    case "pending":
    case "under_review":
    case "need_more_info":
    default:
      return "pending";
  }
}

/**
 * 获取状态的中文显示文本
 */
export function getApplicationStatusText(status: ApplicationStatus): string {
  switch (status) {
    case "pending":
      return "待审核";
    case "under_review":
      return "审核中";
    case "approved":
      return "已通过";
    case "rejected":
      return "已拒绝";
    case "need_more_info":
      return "需补充材料";
    default:
      return "未知状态";
  }
}

export function getVerificationStatusText(status: GuideVerificationStatus): string {
  switch (status) {
    case "verified":
      return "已认证";
    case "pending":
      return "待认证";
    case "rejected":
      return "认证被拒";
    default:
      return "未知状态";
  }
}

/**
 * 获取状态的颜色样式类
 */
export function getApplicationStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "under_review":
      return "bg-blue-100 text-blue-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "need_more_info":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getVerificationStatusColor(status: GuideVerificationStatus): string {
  switch (status) {
    case "verified":
      return "text-green-400";
    case "pending":
      return "text-yellow-400";
    case "rejected":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

/**
 * 检查状态是否允许进行审核操作
 */
export function canReviewApplication(status: ApplicationStatus): boolean {
  return ["pending", "under_review", "need_more_info"].includes(status);
}

/**
 * 检查状态是否允许修改认证状态
 */
export function canUpdateVerificationStatus(status: GuideVerificationStatus): boolean {
  return ["pending", "rejected"].includes(status);
}
