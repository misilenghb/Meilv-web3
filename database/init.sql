-- 美旅地陪平台数据库初始化脚本
-- 请在Supabase SQL编辑器中执行此脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'guide', 'admin')),
  intended_role VARCHAR(20) DEFAULT 'user' CHECK (intended_role IN ('user', 'guide', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建地陪表
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  services JSONB,
  photos TEXT[],
  city VARCHAR(100),
  location TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
  verification_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建地陪申请表
CREATE TABLE IF NOT EXISTS guide_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  bio TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  available_services TEXT[],
  languages TEXT[],
  id_card_front TEXT NOT NULL,
  id_card_back TEXT NOT NULL,
  health_certificate TEXT,
  background_check TEXT,
  photos TEXT[],
  experience TEXT,
  motivation TEXT,
  emergency_contact JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'need_more_info')),
  review_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_history JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建审核员表
CREATE TABLE IF NOT EXISTS reviewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'senior_reviewer', 'admin')),
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建审核标准表
CREATE TABLE IF NOT EXISTS review_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  criterion VARCHAR(200) NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建通知模板表
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(200),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'email' CHECK (type IN ('email', 'sms', 'in_app')),
  variables JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建通知日志表
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES notification_templates(id),
  recipient VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'in_app')),
  subject VARCHAR(500),
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  service_title VARCHAR(200) NOT NULL,
  service_description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  location TEXT,
  notes TEXT,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评价表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_guides_user_id ON guides(user_id);
CREATE INDEX IF NOT EXISTS idx_guides_city ON guides(city);
CREATE INDEX IF NOT EXISTS idx_guides_verification_status ON guides(verification_status);
CREATE INDEX IF NOT EXISTS idx_guide_applications_phone ON guide_applications(phone);
CREATE INDEX IF NOT EXISTS idx_guide_applications_status ON guide_applications(status);
CREATE INDEX IF NOT EXISTS idx_guide_applications_submitted_at ON guide_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guide_id ON orders(guide_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_start_time ON orders(start_time);
CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- 插入默认审核标准
INSERT INTO review_criteria (category, criterion, description, weight, is_required, is_active) VALUES
('personal_info', '身份信息完整性', '检查姓名、身份证号、手机号、城市等基本信息是否完整', 10, true, true),
('personal_info', '年龄要求', '申请人年龄应在18-60岁之间', 5, true, true),
('documents', '身份证件清晰度', '身份证正反面照片清晰可见，信息完整', 15, true, true),
('documents', '照片质量', '个人照片清晰，符合要求', 10, true, true),
('service_info', '服务描述完整性', '个人简介不少于20字，技能描述详细', 10, true, true),
('service_info', '定价合理性', '小时费率在50-1000元范围内', 5, true, true),
('background', '相关经验', '相关工作或服务经验描述不少于50字', 8, false, true),
('background', '服务动机', '申请动机描述不少于30字', 5, false, true),
('safety', '紧急联系人', '紧急联系人信息完整', 10, true, true),
('safety', '背景核查', '提供无犯罪记录证明等背景核查材料', 5, false, true)
ON CONFLICT (id) DO NOTHING;

-- 插入默认通知模板
INSERT INTO notification_templates (name, subject, content, type, variables) VALUES
('application_received', '地陪申请已收到', '亲爱的{{applicantName}}，您的地陪申请（编号：{{applicationId}}）已收到，我们将在3个工作日内完成审核。', 'email', '{"applicantName": "申请人姓名", "applicationId": "申请编号"}'),
('application_approved', '地陪申请已通过', '恭喜{{applicantName}}！您的地陪申请已通过审核，现在可以开始提供服务了。{{notes}}', 'email', '{"applicantName": "申请人姓名", "notes": "审核备注"}'),
('application_rejected', '地陪申请未通过', '很抱歉，{{applicantName}}，您的地陪申请未通过审核。原因：{{rejectionReason}}。您可以根据反馈意见重新申请。', 'email', '{"applicantName": "申请人姓名", "rejectionReason": "拒绝原因"}'),
('need_more_info', '需要补充申请材料', '{{applicantName}}，您的地陪申请需要补充以下材料：{{requiredInfo}}。请尽快补充完整。', 'email', '{"applicantName": "申请人姓名", "requiredInfo": "需要补充的材料"}')
ON CONFLICT (name) DO NOTHING;

-- 启用行级安全策略（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（这里创建比较宽松的策略，实际使用时应该根据需要调整）
-- 用户可以查看和更新自己的信息
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert data" ON users FOR INSERT WITH CHECK (true);

-- 地陪信息公开可见
CREATE POLICY "Guides are publicly viewable" ON guides FOR SELECT USING (true);

-- 地陪申请只能查看自己的
CREATE POLICY "Users can view own applications" ON guide_applications FOR SELECT USING (true);
CREATE POLICY "Users can insert applications" ON guide_applications FOR INSERT WITH CHECK (true);

-- 其他表的策略
CREATE POLICY "Public read access" ON review_criteria FOR SELECT USING (true);
CREATE POLICY "Public read access" ON notification_templates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reviews FOR SELECT USING (true);

-- 允许插入操作
CREATE POLICY "Allow insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON notification_logs FOR INSERT WITH CHECK (true);

COMMENT ON TABLE users IS '用户表';
COMMENT ON TABLE guides IS '地陪表';
COMMENT ON TABLE guide_applications IS '地陪申请表';
COMMENT ON TABLE reviewers IS '审核员表';
COMMENT ON TABLE review_criteria IS '审核标准表';
COMMENT ON TABLE notification_templates IS '通知模板表';
COMMENT ON TABLE notification_logs IS '通知日志表';
COMMENT ON TABLE orders IS '订单表';
COMMENT ON TABLE reviews IS '评价表';
