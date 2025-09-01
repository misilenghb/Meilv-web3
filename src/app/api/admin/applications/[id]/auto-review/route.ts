import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

interface ReviewCriterion {
  category: string;
  criterion: string;
  isRequired: boolean;
  weight: number;
  passed: boolean;
  reason?: string;
}

interface ReviewResult {
  score: number;
  maxScore: number;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  criteria: ReviewCriterion[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 获取申请详情
    const { data: application, error } = await supabase
      .from('guide_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: "申请不存在" },
        { status: 404 }
      );
    }

    // 获取审核标准
    const { data: criteria, error: criteriaError } = await supabase
      .from('review_criteria')
      .select('*')
      .eq('is_active', true)
      .order('weight', { ascending: false });

    if (criteriaError) {
      console.error('Failed to fetch criteria:', criteriaError);
      return NextResponse.json(
        { error: "获取审核标准失败" },
        { status: 500 }
      );
    }

    // 执行自动审核
    const reviewResult = await performAutoReview(application, criteria || []);

    return NextResponse.json({
      result: reviewResult
    });

  } catch (error) {
    console.error('Auto review error:', error);
    return NextResponse.json(
      { error: "自动审核失败" },
      { status: 500 }
    );
  }
}

async function performAutoReview(application: any, criteria: any[]): Promise<ReviewResult> {
  let score = 0;
  let maxScore = 0;
  const issues: string[] = [];
  const recommendations: string[] = [];
  const reviewCriteria: ReviewCriterion[] = [];

  for (const criterion of criteria) {
    maxScore += criterion.weight;
    
    const checkResult = checkCriterion(application, criterion);
    
    const reviewCriterion: ReviewCriterion = {
      category: criterion.category,
      criterion: criterion.criterion,
      isRequired: criterion.is_required,
      weight: criterion.weight,
      passed: checkResult.passed,
      reason: checkResult.reason
    };

    reviewCriteria.push(reviewCriterion);
    
    if (checkResult.passed) {
      score += criterion.weight;
    } else {
      if (criterion.is_required) {
        issues.push(`${criterion.criterion}: ${checkResult.reason || '不符合要求'}`);
      } else {
        recommendations.push(`${criterion.criterion}: ${checkResult.reason || '建议改进'}`);
      }
    }
  }

  const passed = score >= maxScore * 0.7; // 70%通过率

  return {
    score,
    maxScore,
    passed,
    issues,
    recommendations,
    criteria: reviewCriteria
  };
}

function checkCriterion(application: any, criterion: any): { passed: boolean; reason?: string } {
  switch (criterion.category) {
    case 'personal_info':
      return checkPersonalInfo(application, criterion);
    case 'documents':
      return checkDocuments(application, criterion);
    case 'service_info':
      return checkServiceInfo(application, criterion);
    case 'background':
      return checkBackground(application, criterion);
    case 'safety':
      return checkSafety(application, criterion);
    default:
      return { passed: true };
  }
}

function checkPersonalInfo(application: any, criterion: any): { passed: boolean; reason?: string } {
  if (criterion.criterion.includes('身份信息完整性')) {
    const hasBasicInfo = !!(application.real_name && application.id_number && application.phone && application.city);
    return {
      passed: hasBasicInfo,
      reason: hasBasicInfo ? '基本信息完整' : '缺少必要的身份信息'
    };
  }
  
  if (criterion.criterion.includes('年龄要求')) {
    const ageValid = application.age >= 18 && application.age <= 60;
    return {
      passed: ageValid,
      reason: ageValid ? '年龄符合要求' : `年龄${application.age}岁，不在18-60岁范围内`
    };
  }

  return { passed: true };
}

function checkDocuments(application: any, criterion: any): { passed: boolean; reason?: string } {
  if (criterion.criterion.includes('身份证件清晰度')) {
    const hasIdCards = !!(application.id_card_front && application.id_card_back);
    return {
      passed: hasIdCards,
      reason: hasIdCards ? '身份证件已上传' : '缺少身份证正面或背面照片'
    };
  }
  
  if (criterion.criterion.includes('照片质量')) {
    const hasPhotos = application.photos && application.photos.length > 0;
    return {
      passed: hasPhotos,
      reason: hasPhotos ? `已上传${application.photos.length}张个人照片` : '未上传个人照片'
    };
  }

  return { passed: true };
}

function checkServiceInfo(application: any, criterion: any): { passed: boolean; reason?: string } {
  if (criterion.criterion.includes('服务描述完整性')) {
    const bioLength = application.bio ? application.bio.length : 0;
    const hasSkills = application.skills && application.skills.length > 0;
    const bioValid = bioLength >= 20;
    
    if (!bioValid && !hasSkills) {
      return {
        passed: false,
        reason: '个人简介过短且未填写技能'
      };
    } else if (!bioValid) {
      return {
        passed: false,
        reason: `个人简介仅${bioLength}字，建议至少20字`
      };
    } else if (!hasSkills) {
      return {
        passed: false,
        reason: '未填写专业技能'
      };
    }
    
    return {
      passed: true,
      reason: `个人简介${bioLength}字，技能${application.skills.length}项`
    };
  }
  
  if (criterion.criterion.includes('定价合理性')) {
    const rateValid = application.hourly_rate >= 50 && application.hourly_rate <= 1000;
    return {
      passed: rateValid,
      reason: rateValid ? `费率${application.hourly_rate}元/小时，在合理范围内` : 
              `费率${application.hourly_rate}元/小时，建议在50-1000元范围内`
    };
  }

  return { passed: true };
}

function checkBackground(application: any, criterion: any): { passed: boolean; reason?: string } {
  if (criterion.criterion.includes('相关经验')) {
    const expLength = application.experience ? application.experience.length : 0;
    const expValid = expLength >= 50;
    return {
      passed: expValid,
      reason: expValid ? `经验描述${expLength}字` : `经验描述仅${expLength}字，建议至少50字`
    };
  }
  
  if (criterion.criterion.includes('服务动机')) {
    const motLength = application.motivation ? application.motivation.length : 0;
    const motValid = motLength >= 30;
    return {
      passed: motValid,
      reason: motValid ? `动机描述${motLength}字` : `动机描述仅${motLength}字，建议至少30字`
    };
  }

  return { passed: true };
}

function checkSafety(application: any, criterion: any): { passed: boolean; reason?: string } {
  if (criterion.criterion.includes('紧急联系人')) {
    const hasEmergencyContact = !!(
      application.emergency_contact && 
      application.emergency_contact.name && 
      application.emergency_contact.phone
    );
    return {
      passed: hasEmergencyContact,
      reason: hasEmergencyContact ? '紧急联系人信息完整' : '缺少紧急联系人信息'
    };
  }
  
  if (criterion.criterion.includes('背景核查')) {
    const hasBackgroundCheck = !!application.background_check;
    return {
      passed: hasBackgroundCheck,
      reason: hasBackgroundCheck ? '已提供背景核查证明' : '未提供背景核查证明（可选）'
    };
  }

  return { passed: true };
}
