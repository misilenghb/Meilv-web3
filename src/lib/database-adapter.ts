// 数据库适配器 - 处理数据结构不匹配问题
// 这是一个临时解决方案，直到数据库结构修复完成

import type { OrderRequirement } from "@/types/domain";

// 当前数据库结构（实际存在的字段）
export interface CurrentDatabaseOrder {
  id: string;
  user_id: string;
  guide_id?: string;
  service_type: string;
  service_title: string;
  service_description?: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: string;
  payment_status: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  refund_method?: string;
  refund_account_info?: any;
  refund_requested_at?: string;
}

// 期望的数据库结构（包含requirement字段）
export interface ExpectedDatabaseOrder extends CurrentDatabaseOrder {
  requirement: OrderRequirement;
  deposit_amount?: number;
  final_amount?: number;
  payment_method?: string;
  payment_notes?: string;
  collected_by?: string;
  deposit_paid_at?: string;
  guide_selected_at?: string;
  confirmed_at?: string;
  payment_collected_at?: string;
  started_at?: string;
  completed_at?: string;
}

/**
 * 将OrderRequirement转换为当前数据库字段
 */
export function requirementToDbFields(requirement: OrderRequirement) {
  return {
    service_type: requirement.serviceType,
    service_title: getServiceTitle(requirement.serviceType),
    service_description: requirement.specialRequests || '',
    start_time: requirement.startTime,
    end_time: new Date(
      new Date(requirement.startTime).getTime() + 
      requirement.duration * 60 * 60 * 1000
    ).toISOString(),
    duration_hours: requirement.duration,
    location: `${requirement.area} ${requirement.address}`,
  };
}

/**
 * 从当前数据库字段重构OrderRequirement
 */
export function dbFieldsToRequirement(order: CurrentDatabaseOrder): OrderRequirement {
  // 从location字段分离area和address
  const locationParts = order.location?.split(' ') || ['', ''];
  const area = locationParts[0] || '';
  const address = locationParts.slice(1).join(' ') || locationParts[0] || '';

  return {
    serviceType: order.service_type as any,
    startTime: order.start_time,
    duration: order.duration_hours,
    area,
    address,
    specialRequests: order.service_description || '',
  };
}

/**
 * 获取服务类型的中文标题
 */
export function getServiceTitle(serviceType: string): string {
  const titleMap: Record<string, string> = {
    'daily': '日常陪伴',
    'mild_entertainment': '微醺娱乐',
    'tourism': '同城旅游',
  };
  return titleMap[serviceType] || serviceType;
}

/**
 * 创建订单时的数据转换
 */
export function createOrderData(
  userId: string,
  requirement: OrderRequirement,
  depositAmount: number = 0
) {
  const baseFields = requirementToDbFields(requirement);
  
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    guide_id: null,
    ...baseFields,
    hourly_rate: 0, // 创建时不设置时薪
    total_amount: 0, // 创建时不设置总金额
    status: 'pending',
    payment_status: 'pending',
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * 更新订单时的数据转换
 */
export function updateOrderData(updates: Partial<ExpectedDatabaseOrder>) {
  const result: any = {
    updated_at: new Date().toISOString(),
  };

  // 如果有requirement更新，转换为对应的数据库字段
  if (updates.requirement) {
    Object.assign(result, requirementToDbFields(updates.requirement));
  }

  // 复制其他字段（排除requirement）
  Object.keys(updates).forEach(key => {
    if (key !== 'requirement' && updates[key as keyof ExpectedDatabaseOrder] !== undefined) {
      result[key] = updates[key as keyof ExpectedDatabaseOrder];
    }
  });

  return result;
}

/**
 * 将数据库订单转换为前端期望的格式
 */
export function adaptOrderForFrontend(order: CurrentDatabaseOrder): ExpectedDatabaseOrder {
  return {
    ...order,
    requirement: dbFieldsToRequirement(order),
    deposit_amount: 0, // 默认值
    final_amount: order.total_amount,
    payment_method: undefined,
    payment_notes: undefined,
    collected_by: undefined,
    deposit_paid_at: undefined,
    guide_selected_at: undefined,
    confirmed_at: undefined,
    payment_collected_at: undefined,
    started_at: undefined,
    completed_at: undefined,
  };
}

/**
 * 批量转换订单数组
 */
export function adaptOrdersForFrontend(orders: CurrentDatabaseOrder[]): ExpectedDatabaseOrder[] {
  return orders.map(adaptOrderForFrontend);
}

/**
 * 验证订单数据完整性
 */
export function validateOrderData(order: CurrentDatabaseOrder): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!order.id) errors.push('缺少订单ID');
  if (!order.user_id) errors.push('缺少用户ID');
  if (!order.service_type) errors.push('缺少服务类型');
  if (!order.start_time) errors.push('缺少开始时间');
  if (!order.duration_hours || order.duration_hours <= 0) errors.push('无效的服务时长');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 状态标准化函数
 */
export function normalizeOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': 'pending',
    'GUIDE_SELECTED': 'confirmed',
    'DEPOSIT_PENDING': 'confirmed',
    'DEPOSIT_PAID': 'deposit_paid',
    'PAID': 'deposit_paid',
    'IN_PROGRESS': 'in_progress',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
    'REFUNDED': 'refunded',
  };

  return statusMap[status.toUpperCase()] || status.toLowerCase();
}

/**
 * 检查订单是否可以删除
 */
export function canDeleteOrder(status: string): boolean {
  const deletableStatuses = [
    'pending', 'confirmed',
    'DRAFT', 'GUIDE_SELECTED', 'DEPOSIT_PENDING'
  ];
  return deletableStatuses.includes(status);
}

/**
 * 检查订单是否为未完成状态
 */
export function isIncompleteOrder(status: string): boolean {
  const incompleteStatuses = [
    // 小写状态
    'pending', 'confirmed', 'in_progress', 'deposit_paid',
    // 大写状态
    'DRAFT', 'GUIDE_SELECTED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 
    'PAID', 'IN_PROGRESS'
  ];
  return incompleteStatuses.includes(status);
}
