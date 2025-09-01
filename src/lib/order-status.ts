/**
 * 订单状态管理工具
 * 
 * 订单状态流转图：
 * 
 * pending (待分配地陪)
 *    ↓ (客户选择地陪 / 管理员分配 / 系统自动分配)
 * confirmed (地陪已分配，等待收款)
 *    ↓ (收取保证金)
 * in_progress (服务进行中)
 *    ↓ (收取尾款，服务完成)
 * completed (订单完成)
 * 
 * 特殊状态：
 * cancelled (订单取消) - 可从任何状态转入
 */

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  nextStatuses: OrderStatus[];
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusInfo> = {
  pending: {
    status: 'pending',
    label: '待分配地陪',
    description: '订单已创建，等待分配地陪',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    nextStatuses: ['confirmed', 'cancelled']
  },
  confirmed: {
    status: 'confirmed',
    label: '等待收款',
    description: '地陪已分配，等待收取保证金',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    nextStatuses: ['in_progress', 'pending', 'cancelled']
  },
  in_progress: {
    status: 'in_progress',
    label: '服务中',
    description: '已收取保证金，服务进行中',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    nextStatuses: ['completed', 'cancelled']
  },
  completed: {
    status: 'completed',
    label: '已完成',
    description: '服务完成，已收取尾款',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    nextStatuses: []
  },
  cancelled: {
    status: 'cancelled',
    label: '已取消',
    description: '订单已取消',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    nextStatuses: []
  }
};

/**
 * 获取订单状态信息
 */
export function getOrderStatusInfo(status: OrderStatus): OrderStatusInfo {
  return ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.pending;
}

/**
 * 检查状态转换是否有效
 */
export function isValidStatusTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  const statusInfo = getOrderStatusInfo(fromStatus);
  return statusInfo.nextStatuses.includes(toStatus);
}

/**
 * 获取订单可以转换到的下一个状态
 */
export function getNextValidStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return getOrderStatusInfo(currentStatus).nextStatuses;
}

/**
 * 获取状态显示样式
 */
export function getStatusDisplayClass(status: OrderStatus): string {
  const info = getOrderStatusInfo(status);
  return `${info.bgColor} ${info.color} border border-gray-200`;
}

/**
 * 订单状态变更日志
 */
export interface StatusChangeLog {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  timestamp: string;
  reason?: string;
  operator?: string;
}

/**
 * 创建状态变更日志
 */
export function createStatusChangeLog(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  reason?: string,
  operator?: string
): StatusChangeLog {
  return {
    fromStatus,
    toStatus,
    timestamp: new Date().toISOString(),
    reason,
    operator
  };
}

/**
 * 格式化状态变更日志为可读文本
 */
export function formatStatusChangeLog(log: StatusChangeLog): string {
  const fromInfo = getOrderStatusInfo(log.fromStatus);
  const toInfo = getOrderStatusInfo(log.toStatus);
  
  let message = `状态从"${fromInfo.label}"变更为"${toInfo.label}"`;
  
  if (log.operator) {
    message += ` (操作人: ${log.operator})`;
  }
  
  if (log.reason) {
    message += ` - ${log.reason}`;
  }
  
  message += ` [${new Date(log.timestamp).toLocaleString()}]`;
  
  return message;
}

/**
 * 地陪分配相关的状态操作
 */
export const GuideAssignmentActions = {
  /**
   * 客户选择地陪
   */
  customerSelectGuide: (orderId: string, guideId: string) => ({
    status: 'confirmed' as OrderStatus,
    reason: `客户选择地陪: ${guideId}`,
    operator: 'customer'
  }),

  /**
   * 管理员分配地陪
   */
  adminAssignGuide: (orderId: string, guideId: string, adminId: string) => ({
    status: 'confirmed' as OrderStatus,
    reason: `管理员分配地陪: ${guideId}`,
    operator: `admin:${adminId}`
  }),

  /**
   * 系统自动分配地陪
   */
  systemAutoAssign: (orderId: string, guideId: string, score: number) => ({
    status: 'confirmed' as OrderStatus,
    reason: `系统自动分配地陪: ${guideId} (评分: ${score.toFixed(1)})`,
    operator: 'system'
  }),

  /**
   * 地陪确认接单
   */
  guideConfirmOrder: (orderId: string, guideId: string) => ({
    status: 'confirmed' as OrderStatus,
    reason: `地陪确认接单: ${guideId}`,
    operator: `guide:${guideId}`
  }),

  /**
   * 地陪拒绝接单
   */
  guideRejectOrder: (orderId: string, guideId: string, reason?: string) => ({
    status: 'pending' as OrderStatus,
    reason: `地陪拒绝接单: ${guideId}${reason ? ` - ${reason}` : ''}`,
    operator: `guide:${guideId}`
  })
};

/**
 * 收款相关的状态操作
 */
export const PaymentActions = {
  /**
   * 收取保证金
   */
  collectDeposit: (orderId: string, amount: number, method: string) => ({
    status: 'in_progress' as OrderStatus,
    reason: `收取保证金: ¥${amount} (${method})`,
    operator: 'admin'
  }),

  /**
   * 收取尾款
   */
  collectFinalPayment: (orderId: string, amount: number, method: string) => ({
    status: 'completed' as OrderStatus,
    reason: `收取尾款: ¥${amount} (${method})`,
    operator: 'admin'
  })
};
