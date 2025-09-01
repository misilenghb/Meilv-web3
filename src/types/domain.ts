export type ID = string;

export type Role = "user" | "guide" | "admin";

export interface User {
  id: ID;
  phone: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  email?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  location?: string;
  bio?: string;
  createdAt: string; // ISO
}

export interface UserFavorite {
  id: ID;
  userId: ID;
  guideId: ID;
  createdAt: string;
}

export interface UserSettings {
  userId: ID;
  notifications: {
    orderUpdates: boolean;
    messageAlerts: boolean;
    promotions: boolean;
    systemAnnouncements: boolean;
  };
  privacy: {
    showProfile: boolean;
    showOrderHistory: boolean;
    allowDirectMessages: boolean;
  };
  preferences: {
    language: "zh-CN" | "en-US";
    currency: "CNY" | "USD";
    theme: "light" | "dark" | "auto";
  };
}

export type GuideCertificationStatus = "unverified" | "pending" | "verified" | "rejected" | "suspended";

// 地陪申请状态
export type GuideApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "need_more_info";

// 地陪申请接口
export interface GuideApplication {
  id: ID;
  // 个人基本信息
  displayName: string;
  realName: string;
  idNumber: string;
  phone: string;
  email?: string;
  gender: "male" | "female" | "other";
  age: number;
  city: string;
  address: string;

  // 服务信息
  bio: string;
  skills: string[];
  hourlyRate: number;
  availableServices: string[];
  languages: string[];

  // 认证材料
  idCardFront: string;
  idCardBack: string;
  healthCertificate?: string;
  backgroundCheck?: string;
  photos: string[];

  // 补充信息
  experience: string;
  motivation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  // 审核信息
  status: GuideApplicationStatus;
  submittedAt: string;
  reviewNotes?: string;
  reviewedBy?: ID;
  reviewedAt?: string;
  reviewHistory: ReviewRecord[];
}

// 审核记录
export interface ReviewRecord {
  id: ID;
  reviewerId: ID;
  reviewerName: string;
  action: "submit" | "approve" | "reject" | "request_info" | "update";
  status: GuideApplicationStatus;
  notes?: string;
  timestamp: string;
}

// 审核员接口
export interface Reviewer {
  id: ID;
  userId: ID;
  name: string;
  role: "reviewer" | "senior_reviewer" | "admin";
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

// 审核标准
export interface ReviewCriterion {
  id: ID;
  category: string;
  criterion: string;
  description?: string;
  weight: number;
  isRequired: boolean;
  isActive: boolean;
}

export interface GuideProfile {
  id: ID;
  userId: ID;
  displayName: string;
  bio?: string;
  skills: string[];
  hourlyRate: number; // RMB / hour
  services: Array<{
    code: "daily" | "mild_entertainment" | "local_tour";
    title: string;
    pricePerHour?: number;
    packagePrice?: number; // for 10h packages
  }>;
  photos: string[];
  city: string;
  location?: string;
  ratingAvg: number;
  ratingCount: number;
  certificationStatus: GuideCertificationStatus;
  createdAt: string;
}

export type OrderStatus =
  | "DRAFT" // 草稿状态，收集需求信息
  | "GUIDE_SELECTED" // 已选择地陪
  | "DEPOSIT_PENDING" // 等待收取保证金
  | "DEPOSIT_PAID" // 已收取保证金，等待见面收取尾款
  | "PAID" // 已收取全款（保证金+尾款）
  | "IN_PROGRESS" // 服务进行中
  | "COMPLETED" // 已完成
  | "CANCELLED" // 已取消
  | "REFUNDED"; // 已退款

// 需求信息接口
export interface OrderRequirement {
  startTime: string; // 开始时间
  duration: number; // 游玩时长（小时）
  serviceType: "daily" | "mild_entertainment" | "local_tour"; // 游玩项目
  area: string; // 游玩区域
  address: string; // 大概地址
  specialRequests?: string; // 特殊要求
}

// 退款方式类型
export type RefundMethod = "alipay" | "wechat" | "bank_transfer";

// 退款账户信息接口
export interface RefundAccountInfo {
  account: string; // 账号（支付宝账号、微信号、银行卡号）
  name: string; // 真实姓名
  bank?: string; // 银行名称（仅银行转账需要）
}

export interface Order {
  id: ID;
  userId: ID;
  guideId?: ID; // 可选，在选择地陪前为空
  requirement: OrderRequirement; // 需求信息
  depositAmount: number; // 保证金金额（固定200元）
  totalAmount?: number; // 总金额（选择地陪后确定）
  finalAmount?: number; // 尾款金额（总金额 - 保证金）
  status: OrderStatus;
  notes?: string;
  // 人工收款相关
  depositPaymentMethod?: "cash" | "wechat" | "alipay" | "bank_transfer"; // 保证金收款方式
  depositPaymentNotes?: string; // 保证金收款备注
  finalPaymentMethod?: "cash" | "wechat" | "alipay" | "bank_transfer"; // 尾款收款方式
  finalPaymentNotes?: string; // 尾款收款备注
  collectedBy?: ID; // 收款人员ID
  // 退款相关
  refundMethod?: RefundMethod; // 退款方式
  refundAccountInfo?: RefundAccountInfo; // 退款账户信息
  refundRequestedAt?: string; // 退款申请时间
  createdAt: string;
  updatedAt: string;
  // 流程时间戳
  guideSelectedAt?: string;
  depositPaidAt?: string; // 保证金收款时间
  confirmedAt?: string; // 见面确认时间
  finalPaymentPaidAt?: string; // 尾款收款时间
  startedAt?: string;
  completedAt?: string;
}

export type PaymentStatus = "CREATED" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PaymentType = "DEPOSIT" | "FINAL" | "FULL"; // 定金、尾款、全款

export interface Payment {
  id: ID;
  orderId: ID;
  type: PaymentType; // 支付类型
  amount: number; // 支付金额
  provider: "wechat" | "alipay" | "mock";
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: ID;
  orderId: ID;
  userId: ID;
  guideId: ID;
  rating: number; // 1-5
  content?: string;
  createdAt: string;
}

export interface Message {
  id: ID;
  fromUserId: ID;
  toUserId: ID;
  content: string;
  createdAt: string;
}

export const nowIso = () => new Date().toISOString();

