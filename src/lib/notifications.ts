import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "email" | "sms" | "in_app";
  variables: Record<string, string>;
}

export interface NotificationData {
  applicantName: string;
  applicationId: string;
  notes?: string;
  rejectionReason?: string;
  requiredInfo?: string;
}

export class NotificationService {
  // 获取通知模板
  static async getTemplate(templateName: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Failed to fetch template:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        type: data.type,
        variables: data.variables || {}
      };
    } catch (error) {
      console.error('Template fetch error:', error);
      return null;
    }
  }

  // 发送申请收到通知
  static async sendApplicationReceived(
    applicantName: string,
    applicationId: string,
    email?: string,
    phone?: string
  ) {
    const template = await this.getTemplate('application_received');
    if (!template) return;

    const data: NotificationData = {
      applicantName,
      applicationId
    };

    await this.sendNotification(template, data, email, phone);
  }

  // 发送申请通过通知
  static async sendApplicationApproved(
    applicantName: string,
    applicationId: string,
    email?: string,
    phone?: string,
    notes?: string
  ) {
    const template = await this.getTemplate('application_approved');
    if (!template) return;

    const data: NotificationData = {
      applicantName,
      applicationId,
      notes
    };

    await this.sendNotification(template, data, email, phone);
  }

  // 发送申请拒绝通知
  static async sendApplicationRejected(
    applicantName: string,
    applicationId: string,
    rejectionReason: string,
    email?: string,
    phone?: string
  ) {
    const template = await this.getTemplate('application_rejected');
    if (!template) return;

    const data: NotificationData = {
      applicantName,
      applicationId,
      rejectionReason
    };

    await this.sendNotification(template, data, email, phone);
  }

  // 发送需要补充材料通知
  static async sendNeedMoreInfo(
    applicantName: string,
    applicationId: string,
    requiredInfo: string,
    email?: string,
    phone?: string
  ) {
    const template = await this.getTemplate('need_more_info');
    if (!template) return;

    const data: NotificationData = {
      applicantName,
      applicationId,
      requiredInfo
    };

    await this.sendNotification(template, data, email, phone);
  }

  // 发送通知的核心方法
  private static async sendNotification(
    template: NotificationTemplate,
    data: NotificationData,
    email?: string,
    phone?: string
  ) {
    try {
      // 替换模板变量
      const subject = this.replaceVariables(template.subject, data);
      const content = this.replaceVariables(template.content, data);

      // 发送邮件通知
      if (email && template.type === 'email') {
        await this.sendEmail(email, subject, content);
      }

      // 发送短信通知
      if (phone && template.type === 'sms') {
        await this.sendSMS(phone, content);
      }

      // 记录通知日志
      await this.logNotification({
        templateId: template.id,
        recipient: email || phone || 'unknown',
        type: template.type,
        subject,
        content,
        status: 'sent'
      });

    } catch (error) {
      console.error('Notification send error:', error);
      
      // 记录失败日志
      await this.logNotification({
        templateId: template.id,
        recipient: email || phone || 'unknown',
        type: template.type,
        subject: template.subject,
        content: template.content,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 替换模板变量
  private static replaceVariables(text: string, data: NotificationData): string {
    let result = text;
    
    // 替换所有变量
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, String(value));
      }
    });

    return result;
  }

  // 发送邮件（集成邮件服务）
  private static async sendEmail(to: string, subject: string, content: string) {
    // 这里集成实际的邮件服务，如 SendGrid、Resend、阿里云邮件等
    console.log('Sending email:', { to, subject, content });
    
    // 示例：使用 SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to,
    //   from: 'noreply@meilv.com',
    //   subject,
    //   text: content,
    //   html: content.replace(/\n/g, '<br>')
    // };
    // 
    // await sgMail.send(msg);

    // 示例：使用 Resend
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // 
    // await resend.emails.send({
    //   from: 'noreply@meilv.com',
    //   to,
    //   subject,
    //   text: content
    // });
  }

  // 发送短信（集成短信服务）
  private static async sendSMS(to: string, content: string) {
    // 这里集成实际的短信服务，如阿里云短信、腾讯云短信等
    console.log('Sending SMS:', { to, content });
    
    // 示例：使用阿里云短信
    // const Core = require('@alicloud/pop-core');
    // 
    // const client = new Core({
    //   accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    //   accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    //   endpoint: 'https://dysmsapi.aliyuncs.com',
    //   apiVersion: '2017-05-25'
    // });
    // 
    // const params = {
    //   PhoneNumbers: to,
    //   SignName: '美旅',
    //   TemplateCode: 'SMS_TEMPLATE_CODE',
    //   TemplateParam: JSON.stringify({ content })
    // };
    // 
    // await client.request('SendSms', params, { method: 'POST' });
  }

  // 记录通知日志
  private static async logNotification(log: {
    templateId: string;
    recipient: string;
    type: string;
    subject: string;
    content: string;
    status: 'sent' | 'failed';
    error?: string;
  }) {
    try {
      await supabase
        .from('notification_logs')
        .insert([{
          template_id: log.templateId,
          recipient: log.recipient,
          type: log.type,
          subject: log.subject,
          content: log.content,
          status: log.status,
          error_message: log.error || null,
          sent_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  // 批量发送通知
  static async sendBatchNotifications(
    applications: Array<{
      id: string;
      displayName: string;
      email?: string;
      phone: string;
    }>,
    action: 'approve' | 'reject' | 'request_info',
    notes?: string
  ) {
    const promises = applications.map(app => {
      switch (action) {
        case 'approve':
          return this.sendApplicationApproved(app.displayName, app.id, app.email, app.phone, notes);
        case 'reject':
          return this.sendApplicationRejected(app.displayName, app.id, notes || '未通过审核', app.email, app.phone);
        case 'request_info':
          return this.sendNeedMoreInfo(app.displayName, app.id, notes || '需要补充材料', app.email, app.phone);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }
}

// 审核标准检查器
export class ReviewCriteriaChecker {
  private static criteria: Array<{
    category: string;
    criterion: string;
    isRequired: boolean;
    weight: number;
  }> = [];

  // 加载审核标准
  static async loadCriteria() {
    try {
      const { data, error } = await supabase
        .from('review_criteria')
        .select('category, criterion, is_required, weight')
        .eq('is_active', true)
        .order('weight', { ascending: false });

      if (error) {
        console.error('Failed to load criteria:', error);
        return;
      }

      this.criteria = data.map(item => ({
        category: item.category,
        criterion: item.criterion,
        isRequired: item.is_required,
        weight: item.weight
      }));
    } catch (error) {
      console.error('Criteria load error:', error);
    }
  }

  // 检查申请是否符合标准
  static async checkApplication(application: any): Promise<{
    score: number;
    maxScore: number;
    passed: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    if (this.criteria.length === 0) {
      await this.loadCriteria();
    }

    let score = 0;
    let maxScore = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const criterion of this.criteria) {
      maxScore += criterion.weight;
      
      const checkResult = this.checkCriterion(application, criterion);
      
      if (checkResult.passed) {
        score += criterion.weight;
      } else {
        if (criterion.isRequired) {
          issues.push(`必填项不符合要求：${criterion.criterion}`);
        } else {
          recommendations.push(`建议改进：${criterion.criterion}`);
        }
      }
    }

    const passed = score >= maxScore * 0.7; // 70%通过率

    return {
      score,
      maxScore,
      passed,
      issues,
      recommendations
    };
  }

  // 检查单个标准
  private static checkCriterion(application: any, criterion: any): { passed: boolean; reason?: string } {
    switch (criterion.category) {
      case 'personal_info':
        return this.checkPersonalInfo(application, criterion);
      case 'documents':
        return this.checkDocuments(application, criterion);
      case 'service_info':
        return this.checkServiceInfo(application, criterion);
      case 'background':
        return this.checkBackground(application, criterion);
      case 'safety':
        return this.checkSafety(application, criterion);
      default:
        return { passed: true };
    }
  }

  private static checkPersonalInfo(application: any, criterion: any): { passed: boolean; reason?: string } {
    if (criterion.criterion.includes('身份信息完整性')) {
      return {
        passed: !!(application.realName && application.idNumber && application.phone && application.city)
      };
    }
    
    if (criterion.criterion.includes('年龄要求')) {
      return {
        passed: application.age >= 18 && application.age <= 60
      };
    }

    return { passed: true };
  }

  private static checkDocuments(application: any, criterion: any): { passed: boolean; reason?: string } {
    if (criterion.criterion.includes('身份证件清晰度')) {
      return {
        passed: !!(application.idCardFront && application.idCardBack)
      };
    }
    
    if (criterion.criterion.includes('照片质量')) {
      return {
        passed: application.photos && application.photos.length > 0
      };
    }

    return { passed: true };
  }

  private static checkServiceInfo(application: any, criterion: any): { passed: boolean; reason?: string } {
    if (criterion.criterion.includes('服务描述完整性')) {
      return {
        passed: !!(application.bio && application.bio.length >= 20 && application.skills && application.skills.length > 0)
      };
    }
    
    if (criterion.criterion.includes('定价合理性')) {
      return {
        passed: application.hourlyRate >= 50 && application.hourlyRate <= 1000
      };
    }

    return { passed: true };
  }

  private static checkBackground(application: any, criterion: any): { passed: boolean; reason?: string } {
    if (criterion.criterion.includes('相关经验')) {
      return {
        passed: !!(application.experience && application.experience.length >= 50)
      };
    }
    
    if (criterion.criterion.includes('服务动机')) {
      return {
        passed: !!(application.motivation && application.motivation.length >= 30)
      };
    }

    return { passed: true };
  }

  private static checkSafety(application: any, criterion: any): { passed: boolean; reason?: string } {
    if (criterion.criterion.includes('紧急联系人')) {
      return {
        passed: !!(application.emergencyContact && 
                  application.emergencyContact.name && 
                  application.emergencyContact.phone)
      };
    }
    
    if (criterion.criterion.includes('背景核查')) {
      return {
        passed: !!application.backgroundCheck // 可选项
      };
    }

    return { passed: true };
  }
}
