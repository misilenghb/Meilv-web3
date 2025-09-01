/**
 * 订单数据适配器 - 处理Supabase和前端之间的数据格式转换
 */

import type { Order, OrderRequirement, OrderStatus, RefundMethod, RefundAccountInfo } from "@/types/domain";

// Supabase订单数据结构
export interface SupabaseOrder {
  id: string;
  user_id: string;
  guide_id?: string;
  requirement: OrderRequirement;
  deposit_amount?: number;
  total_amount?: number;
  final_amount?: number;
  status: OrderStatus;
  payment_method?: "cash" | "wechat" | "alipay" | "bank_transfer";
  payment_notes?: string;
  collected_by?: string;
  notes?: string;
  // 退款相关字段
  refund_method?: RefundMethod;
  refund_account_info?: RefundAccountInfo;
  refund_requested_at?: string;
  created_at: string;
  updated_at: string;
  deposit_paid_at?: string;
  guide_selected_at?: string;
  confirmed_at?: string;
  payment_collected_at?: string;
  started_at?: string;
  completed_at?: string;
}

// 前端订单数据结构（保持向后兼容）
export interface FrontendOrder extends Order {}

/**
 * 将Supabase订单数据转换为前端格式
 */
export function supabaseToFrontend(supabaseOrder: SupabaseOrder): FrontendOrder {
  return {
    id: supabaseOrder.id,
    userId: supabaseOrder.user_id,
    guideId: supabaseOrder.guide_id,
    requirement: supabaseOrder.requirement,
    depositAmount: supabaseOrder.deposit_amount || 0,
    totalAmount: supabaseOrder.total_amount,
    finalAmount: supabaseOrder.final_amount,
    status: supabaseOrder.status,
    depositPaymentMethod: supabaseOrder.payment_method,
    depositPaymentNotes: supabaseOrder.payment_notes,
    collectedBy: supabaseOrder.collected_by,
    notes: supabaseOrder.notes,
    // 退款相关字段
    refundMethod: supabaseOrder.refund_method,
    refundAccountInfo: supabaseOrder.refund_account_info,
    refundRequestedAt: supabaseOrder.refund_requested_at,
    createdAt: supabaseOrder.created_at,
    updatedAt: supabaseOrder.updated_at,
    depositPaidAt: supabaseOrder.deposit_paid_at,
    guideSelectedAt: supabaseOrder.guide_selected_at,
    confirmedAt: supabaseOrder.confirmed_at,
    finalPaymentPaidAt: supabaseOrder.payment_collected_at,
    startedAt: supabaseOrder.started_at,
    completedAt: supabaseOrder.completed_at,
  };
}

/**
 * 将前端订单数据转换为Supabase格式
 */
export function frontendToSupabase(frontendOrder: Partial<FrontendOrder>): Partial<SupabaseOrder> {
  const supabaseOrder: Partial<SupabaseOrder> = {};

  if (frontendOrder.id) supabaseOrder.id = frontendOrder.id;
  if (frontendOrder.userId) supabaseOrder.user_id = frontendOrder.userId;
  if (frontendOrder.guideId) supabaseOrder.guide_id = frontendOrder.guideId;
  if (frontendOrder.requirement) supabaseOrder.requirement = frontendOrder.requirement;
  if (frontendOrder.depositAmount !== undefined) supabaseOrder.deposit_amount = frontendOrder.depositAmount;
  if (frontendOrder.totalAmount !== undefined) supabaseOrder.total_amount = frontendOrder.totalAmount;
  if (frontendOrder.finalAmount !== undefined) supabaseOrder.final_amount = frontendOrder.finalAmount;
  if (frontendOrder.status) supabaseOrder.status = frontendOrder.status;
  if (frontendOrder.depositPaymentMethod) supabaseOrder.payment_method = frontendOrder.depositPaymentMethod;
  if (frontendOrder.depositPaymentNotes) supabaseOrder.payment_notes = frontendOrder.depositPaymentNotes;
  if (frontendOrder.collectedBy) supabaseOrder.collected_by = frontendOrder.collectedBy;
  if (frontendOrder.notes) supabaseOrder.notes = frontendOrder.notes;
  // 退款相关字段
  if (frontendOrder.refundMethod) supabaseOrder.refund_method = frontendOrder.refundMethod;
  if (frontendOrder.refundAccountInfo) supabaseOrder.refund_account_info = frontendOrder.refundAccountInfo;
  if (frontendOrder.refundRequestedAt) supabaseOrder.refund_requested_at = frontendOrder.refundRequestedAt;
  if (frontendOrder.createdAt) supabaseOrder.created_at = frontendOrder.createdAt;
  if (frontendOrder.updatedAt) supabaseOrder.updated_at = frontendOrder.updatedAt;
  if (frontendOrder.depositPaidAt) supabaseOrder.deposit_paid_at = frontendOrder.depositPaidAt;
  if (frontendOrder.guideSelectedAt) supabaseOrder.guide_selected_at = frontendOrder.guideSelectedAt;
  if (frontendOrder.confirmedAt) supabaseOrder.confirmed_at = frontendOrder.confirmedAt;
  if (frontendOrder.finalPaymentPaidAt) supabaseOrder.payment_collected_at = frontendOrder.finalPaymentPaidAt;
  if (frontendOrder.startedAt) supabaseOrder.started_at = frontendOrder.startedAt;
  if (frontendOrder.completedAt) supabaseOrder.completed_at = frontendOrder.completedAt;

  return supabaseOrder;
}

/**
 * 批量转换Supabase订单数组为前端格式
 */
export function supabaseArrayToFrontend(supabaseOrders: SupabaseOrder[]): FrontendOrder[] {
  return supabaseOrders.map(supabaseToFrontend);
}

/**
 * 订单状态显示文本映射
 */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  DRAFT: "草稿",
  GUIDE_SELECTED: "已选地陪",
  DEPOSIT_PENDING: "等待收取保证金",
  DEPOSIT_PAID: "等待见面收取尾款",
  PAID: "已收取全款",
  IN_PROGRESS: "服务进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REFUNDED: "已退款",
};

/**
 * 订单状态颜色映射
 */
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  DRAFT: "gray",
  GUIDE_SELECTED: "purple",
  DEPOSIT_PENDING: "yellow",
  DEPOSIT_PAID: "blue",
  PAID: "green",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  REFUNDED: "orange",
};

/**
 * 获取订单状态的下一个可能状态
 */
export function getNextOrderStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ["GUIDE_SELECTED", "CANCELLED"],
    GUIDE_SELECTED: ["DEPOSIT_PENDING", "CANCELLED"],
    DEPOSIT_PENDING: ["DEPOSIT_PAID", "CANCELLED"],
    DEPOSIT_PAID: ["PAID", "CANCELLED"], // 直接从已收保证金到已收全款
    PAID: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: ["REFUNDED"],
    REFUNDED: [],
  };

  return statusFlow[currentStatus] || [];
}

/**
 * 检查订单是否可以执行特定操作
 */
export function canPerformAction(order: FrontendOrder, action: string): boolean {
  switch (action) {
    case "select_guide":
      return order.status === "DRAFT";
    case "collect_deposit":
      return order.status === "DEPOSIT_PENDING";
    case "collect_final_payment":
      return order.status === "DEPOSIT_PAID"; // 见面时收取尾款
    case "start_service":
      return order.status === "PAID";
    case "complete_service":
      return order.status === "IN_PROGRESS";
    case "cancel":
      return ["DRAFT", "GUIDE_SELECTED", "DEPOSIT_PENDING", "DEPOSIT_PAID"].includes(order.status);
    case "add_notes":
      return !["CANCELLED", "REFUNDED"].includes(order.status);
    default:
      return false;
  }
}

/**
 * 格式化订单时间显示
 */
export function formatOrderTime(timestamp?: string): string {
  if (!timestamp) return "未设置";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString("zh-CN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else if (diffDays === 1) {
    return "昨天 " + date.toLocaleTimeString("zh-CN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
}

/**
 * 计算订单总时长（小时）
 */
export function calculateOrderDuration(order: FrontendOrder): number {
  return order.requirement.duration;
}

/**
 * 计算订单总金额
 */
export function calculateOrderAmount(order: FrontendOrder, hourlyRate: number): number {
  const duration = calculateOrderDuration(order);
  return duration * hourlyRate;
}
