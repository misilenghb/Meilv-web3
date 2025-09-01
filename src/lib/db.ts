import { nowIso, type GuideProfile, type ID, type Message, type Order, type Payment, type Review, type User } from "@/types/domain";

// In-memory mock database for MVP scaffolding
const genId = () => Math.random().toString(36).slice(2, 10);

export const db = {
  users: new Map<ID, User>(),
  guides: new Map<ID, GuideProfile>(),
  orders: new Map<ID, Order>(),
  payments: new Map<ID, Payment>(),
  reviews: new Map<ID, Review>(),
  messages: new Map<ID, Message>(),
  userFavorites: new Map<ID, any>(),
  userSettings: new Map<ID, any>(),
};

// Seed a few entries with fixed IDs
const userId = "user001";
db.users.set(userId, {
  id: userId,
  phone: "13800000000",
  name: "测试用户",
  role: "user",
  createdAt: nowIso(),
});

const adminUserId = "admin001";
db.users.set(adminUserId, {
  id: adminUserId,
  phone: "13900000000",
  name: "管理员",
  role: "admin",
  createdAt: nowIso(),
});

const guideUserId = "guide001";
db.users.set(guideUserId, {
  id: guideUserId,
  phone: "13900000001",
  name: "地陪A",
  role: "guide",
  createdAt: nowIso(),
});

const guideId = "guide001";
db.guides.set(guideId, {
  id: guideId,
  userId: guideUserId,
  displayName: "杭州地陪小美",
  bio: "熟悉西湖、灵隐、宋城，亲和力强",
  skills: ["杭州景点讲解", "餐饮推荐", "拍照指导"],
  hourlyRate: 198,
  services: [
    { code: "daily", title: "日常陪伴", pricePerHour: 198 },
    { code: "mild_entertainment", title: "微醺娱乐", pricePerHour: 298 },
    { code: "local_tour", title: "同城旅游", packagePrice: 2900 },
  ],
  photos: [],
  city: "杭州",
  ratingAvg: 4.9,
  ratingCount: 128,
  certificationStatus: "verified",
  createdAt: nowIso(),
});

// Add more test guides with different statuses
const pendingGuideUserId = "guide002";
db.users.set(pendingGuideUserId, {
  id: pendingGuideUserId,
  phone: "13700000000",
  name: "地陪B",
  role: "guide",
  createdAt: nowIso(),
});

const pendingGuideId = "guide002";
db.guides.set(pendingGuideId, {
  id: pendingGuideId,
  userId: pendingGuideUserId,
  displayName: "上海地陪小李",
  bio: "熟悉外滩、南京路、迪士尼",
  skills: ["上海景点", "购物指导", "美食推荐"],
  hourlyRate: 228,
  services: [
    { code: "daily", title: "日常陪伴", pricePerHour: 228 },
    { code: "mild_entertainment", title: "微醺娱乐", pricePerHour: 328 },
    { code: "local_tour", title: "同城旅游", packagePrice: 3200 },
  ],
  photos: [],
  city: "上海",
  ratingAvg: 0,
  ratingCount: 0,
  certificationStatus: "pending",
  createdAt: nowIso(),
});

const rejectedGuideUserId = "guide003";
db.users.set(rejectedGuideUserId, {
  id: rejectedGuideUserId,
  phone: "13600000000",
  name: "地陪C",
  role: "guide",
  createdAt: nowIso(),
});

const rejectedGuideId = "guide003";
db.guides.set(rejectedGuideId, {
  id: rejectedGuideId,
  userId: rejectedGuideUserId,
  displayName: "北京地陪小王",
  bio: "申请材料不完整",
  skills: ["北京景点"],
  hourlyRate: 188,
  services: [
    { code: "daily", title: "日常陪伴", pricePerHour: 188 },
  ],
  photos: [],
  city: "北京",
  ratingAvg: 0,
  ratingCount: 0,
  certificationStatus: "rejected",
  createdAt: nowIso(),
});

// Add some test reviews
const reviewId1 = genId();
db.reviews.set(reviewId1, {
  id: reviewId1,
  orderId: "test-order-1",
  userId: userId,
  guideId: guideId,
  rating: 5,
  content: "服务非常好，地陪很专业，推荐的景点都很棒！",
  createdAt: nowIso(),
});

const reviewId2 = genId();
db.reviews.set(reviewId2, {
  id: reviewId2,
  orderId: "test-order-2",
  userId: userId,
  guideId: guideId,
  rating: 4,
  content: "整体不错，就是时间有点紧张。",
  createdAt: nowIso(),
});

// Add some test messages with new user IDs
const newUserId = "259e7f8e-f50e-4e26-b770-f3f52530e54a"; // 测试用户
const newGuideId = "709dd56f-0a15-4c7d-a8d2-9c39ce976af2"; // 地陪A

// 添加新用户到模拟数据库
db.users.set(newUserId, {
  id: newUserId,
  phone: "13800000000",
  name: "测试用户",
  role: "user",
  createdAt: nowIso(),
});

db.users.set(newGuideId, {
  id: newGuideId,
  phone: "13900000001",
  name: "地陪A",
  role: "guide",
  createdAt: nowIso(),
});

const msgId1 = genId();
db.messages.set(msgId1, {
  id: msgId1,
  fromUserId: newUserId,
  toUserId: newGuideId,
  content: "你好，我想了解一下杭州的旅游路线",
  createdAt: nowIso(),
});

const msgId2 = genId();
db.messages.set(msgId2, {
  id: msgId2,
  fromUserId: newGuideId,
  toUserId: newUserId,
  content: "您好！我可以为您推荐西湖一日游路线，包括断桥残雪、雷峰塔等经典景点",
  createdAt: nowIso(),
});

const msgId3 = genId();
db.messages.set(msgId3, {
  id: msgId3,
  fromUserId: newUserId,
  toUserId: newGuideId,
  content: "听起来不错，大概需要多长时间？",
  createdAt: nowIso(),
});

const msgId4 = genId();
db.messages.set(msgId4, {
  id: msgId4,
  fromUserId: newGuideId,
  toUserId: newUserId,
  content: "一般是6-8小时，可以根据您的时间安排调整",
  createdAt: nowIso(),
});

// 保留原有的消息（兼容性）
const msgId5 = genId();
db.messages.set(msgId5, {
  id: msgId5,
  fromUserId: userId,
  toUserId: guideUserId,
  content: "你好，我想了解一下杭州的旅游路线",
  createdAt: nowIso(),
});

const msgId6 = genId();
db.messages.set(msgId6, {
  id: msgId6,
  fromUserId: guideUserId,
  toUserId: userId,
  content: "您好！我可以为您推荐西湖一日游路线，包括断桥残雪、雷峰塔等经典景点",
  createdAt: nowIso(),
});

const msgId7 = genId();
db.messages.set(msgId7, {
  id: msgId7,
  fromUserId: userId,
  toUserId: guideUserId,
  content: "听起来不错，大概需要多长时间？",
  createdAt: nowIso(),
});

// Add some test orders
const orderId1 = "order001";
db.orders.set(orderId1, {
  id: orderId1,
  userId: userId,
  guideId: guideId,
  requirement: {
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
    duration: 4,
    serviceType: "daily",
    area: "朝阳区",
    address: "三里屯",
    specialRequests: "希望地陪熟悉当地美食"
  },
  depositAmount: 50,
  totalAmount: 792,
  finalAmount: 742,
  status: "COMPLETED",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  depositPaidAt: nowIso(),
  guideSelectedAt: nowIso(),
  confirmedAt: nowIso(),
  startedAt: nowIso(),
  completedAt: nowIso(),
});

const orderId2 = "order002";
db.orders.set(orderId2, {
  id: orderId2,
  userId: userId,
  guideId: guideId,
  requirement: {
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 后天
    duration: 3,
    serviceType: "mild_entertainment",
    area: "海淀区",
    address: "中关村",
  },
  depositAmount: 50,
  totalAmount: 894,
  finalAmount: 844,
  status: "CONFIRMED",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  depositPaidAt: nowIso(),
  guideSelectedAt: nowIso(),
  confirmedAt: nowIso(),
});

// Add user favorites
const favoriteId1 = "fav001";
db.userFavorites.set(favoriteId1, {
  id: favoriteId1,
  userId: userId,
  guideId: guideId,
  createdAt: nowIso(),
});

// Add user settings
db.userSettings.set(userId, {
  userId: userId,
  notifications: {
    orderUpdates: true,
    messageAlerts: true,
    promotions: false,
    systemAnnouncements: true,
  },
  privacy: {
    showProfile: true,
    showOrderHistory: false,
    allowDirectMessages: true,
  },
  preferences: {
    language: "zh-CN",
    currency: "CNY",
    theme: "light",
  },
});

export { genId };

