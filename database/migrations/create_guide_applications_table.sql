-- 创建地陪申请表
CREATE TABLE IF NOT EXISTS guide_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 个人基本信息
  display_name VARCHAR(100) NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  id_number VARCHAR(18) NOT NULL UNIQUE,
  phone VARCHAR(11) NOT NULL,
  email VARCHAR(255),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 60),
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  
  -- 服务信息
  bio TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 50 AND hourly_rate <= 1000),
  available_services TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"中文"}',
  
  -- 认证材料
  id_card_front TEXT NOT NULL, -- Base64 encoded image
  id_card_back TEXT NOT NULL,  -- Base64 encoded image
  health_certificate TEXT,     -- Base64 encoded image (optional)
  background_check TEXT,       -- Base64 encoded image (optional)
  photos TEXT[] NOT NULL,      -- Array of Base64 encoded images
  
  -- 补充信息
  experience TEXT NOT NULL,
  motivation TEXT NOT NULL,
  emergency_contact JSONB NOT NULL,
  
  -- 审核信息
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'need_more_info')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- 审核历史
  review_history JSONB DEFAULT '[]',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_guide_applications_status ON guide_applications(status);
CREATE INDEX idx_guide_applications_city ON guide_applications(city);
CREATE INDEX idx_guide_applications_submitted_at ON guide_applications(submitted_at);
CREATE INDEX idx_guide_applications_phone ON guide_applications(phone);
CREATE INDEX idx_guide_applications_id_number ON guide_applications(id_number);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guide_applications_updated_at 
    BEFORE UPDATE ON guide_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 扩展现有的users表，添加intended_role字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS intended_role VARCHAR(20) DEFAULT 'user' CHECK (intended_role IN ('user', 'guide', 'admin'));

-- 扩展现有的guides表，添加审核相关字段
ALTER TABLE guides ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES guide_applications(id);
ALTER TABLE guides ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'suspended'));
ALTER TABLE guides ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE guides ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 创建审核员角色表
CREATE TABLE IF NOT EXISTS reviewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'senior_reviewer', 'admin')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建审核标准配置表
CREATE TABLE IF NOT EXISTS review_criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- 'personal_info', 'documents', 'experience', etc.
  criterion VARCHAR(200) NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 插入默认审核标准
INSERT INTO review_criteria (category, criterion, description, weight, is_required) VALUES
('personal_info', '身份信息完整性', '姓名、身份证号、联系方式等基本信息是否完整准确', 5, true),
('personal_info', '年龄要求', '申请人年龄是否在18-60岁之间', 3, true),
('documents', '身份证件清晰度', '身份证正反面照片是否清晰可辨', 5, true),
('documents', '照片质量', '个人照片是否清晰、真实、符合要求', 4, true),
('service_info', '服务描述完整性', '个人简介、技能描述是否详细完整', 3, true),
('service_info', '定价合理性', '小时费率是否在合理范围内', 2, true),
('background', '相关经验', '是否具有相关服务经验或技能', 3, false),
('background', '服务动机', '申请动机是否真诚、合理', 2, true),
('safety', '紧急联系人', '紧急联系人信息是否完整', 3, true),
('safety', '背景核查', '是否通过基本的背景核查', 4, false);

-- 创建通知模板表
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'in_app')),
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 插入默认通知模板
INSERT INTO notification_templates (name, subject, content, type, variables) VALUES
('application_received', '申请已收到', '亲爱的{{applicant_name}}，您的地陪申请已收到，申请编号：{{application_id}}。我们将在3-5个工作日内完成审核，请耐心等待。', 'email', '{"applicant_name": "申请人姓名", "application_id": "申请编号"}'),
('application_approved', '申请审核通过', '恭喜您！您的地陪申请已通过审核。您现在可以开始提供陪伴服务了。请登录平台完善您的个人资料。', 'email', '{"applicant_name": "申请人姓名"}'),
('application_rejected', '申请审核未通过', '很遗憾，您的地陪申请未能通过审核。原因：{{rejection_reason}}。如有疑问，请联系客服。', 'email', '{"applicant_name": "申请人姓名", "rejection_reason": "拒绝原因"}'),
('need_more_info', '需要补充材料', '您的地陪申请需要补充以下材料：{{required_info}}。请在7个工作日内补充完整。', 'email', '{"applicant_name": "申请人姓名", "required_info": "需要补充的信息"});

-- 创建RLS策略
ALTER TABLE guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- 申请表的RLS策略
CREATE POLICY "申请人可以查看自己的申请" ON guide_applications
  FOR SELECT USING (phone = current_setting('app.current_user_phone', true));

CREATE POLICY "任何人都可以提交申请" ON guide_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "审核员可以查看所有申请" ON guide_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviewers r 
      WHERE r.user_id = auth.uid() AND r.is_active = true
    )
  );

CREATE POLICY "审核员可以更新申请状态" ON guide_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reviewers r 
      WHERE r.user_id = auth.uid() AND r.is_active = true
    )
  );

-- 审核员表的RLS策略
CREATE POLICY "审核员可以查看审核员信息" ON reviewers
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM reviewers r 
      WHERE r.user_id = auth.uid() AND r.role = 'admin' AND r.is_active = true
    )
  );

-- 审核标准表的RLS策略
CREATE POLICY "所有人可以查看审核标准" ON review_criteria
  FOR SELECT USING (is_active = true);

-- 通知模板表的RLS策略
CREATE POLICY "审核员可以查看通知模板" ON notification_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviewers r
      WHERE r.user_id = auth.uid() AND r.is_active = true
    )
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

-- 创建通知日志索引
CREATE INDEX idx_notification_logs_recipient ON notification_logs(recipient);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);

-- 通知日志表的RLS策略
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理员可以查看通知日志" ON notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviewers r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'senior_reviewer') AND r.is_active = true
    )
  );
