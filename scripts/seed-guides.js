require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleGuides = [
  {
    display_name: "杭州地陪小美",
    bio: "熟悉西湖、灵隐、宋城，亲和力强，擅长摄影指导和美食推荐。有5年地陪经验，服务过上千位游客。",
    skills: ["杭州景点讲解", "餐饮推荐", "拍照指导", "购物陪同", "文化介绍"],
    hourly_rate: 200,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 200 },
      { code: "local_tour", title: "本地导览", pricePerHour: 250 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 300 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"
    ],
    city: "杭州",
    location: "西湖区",
    rating_avg: 4.8,
    rating_count: 128,
    verification_status: "verified",
    is_active: true
  },
  {
    display_name: "上海地陪小李",
    bio: "上海本地人，熟悉外滩、南京路、迪士尼等热门景点，英语流利，可提供双语服务。",
    skills: ["上海景点", "购物指导", "美食推荐", "英语翻译", "商务陪同"],
    hourly_rate: 250,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 250 },
      { code: "local_tour", title: "本地导览", pricePerHour: 300 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 350 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    ],
    city: "上海",
    location: "黄浦区",
    rating_avg: 4.6,
    rating_count: 89,
    verification_status: "verified",
    is_active: true
  },
  {
    display_name: "北京地陪小王",
    bio: "北京胡同文化专家，熟悉故宫、天坛、长城等历史景点，擅长讲解历史文化。",
    skills: ["北京景点", "历史文化", "胡同导览", "传统美食", "文物介绍"],
    hourly_rate: 180,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 180 },
      { code: "local_tour", title: "本地导览", pricePerHour: 220 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 280 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
    ],
    city: "北京",
    location: "东城区",
    rating_avg: 4.7,
    rating_count: 156,
    verification_status: "verified",
    is_active: true
  },
  {
    display_name: "成都地陪小张",
    bio: "成都美食达人，熟悉各种川菜和小吃，可以带您体验最正宗的成都生活。",
    skills: ["成都美食", "火锅推荐", "茶馆文化", "熊猫基地", "宽窄巷子"],
    hourly_rate: 160,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 160 },
      { code: "local_tour", title: "本地导览", pricePerHour: 200 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 240 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"
    ],
    city: "成都",
    location: "锦江区",
    rating_avg: 4.9,
    rating_count: 203,
    verification_status: "verified",
    is_active: true
  },
  {
    display_name: "深圳地陪小林",
    bio: "深圳科技园区专家，熟悉现代都市生活，可提供商务陪同和购物指导。",
    skills: ["深圳景点", "科技园区", "购物中心", "海滨公园", "商务陪同"],
    hourly_rate: 220,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 220 },
      { code: "local_tour", title: "本地导览", pricePerHour: 260 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 320 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"
    ],
    city: "深圳",
    location: "南山区",
    rating_avg: 4.5,
    rating_count: 67,
    verification_status: "verified",
    is_active: true
  },
  {
    display_name: "西安地陪小刘",
    bio: "西安历史文化专家，熟悉兵马俑、大雁塔等古迹，擅长讲解古代历史。",
    skills: ["西安古迹", "历史讲解", "陕西美食", "文物鉴赏", "古城墙"],
    hourly_rate: 170,
    services: [
      { code: "daily", title: "日常陪伴", pricePerHour: 170 },
      { code: "local_tour", title: "本地导览", pricePerHour: 210 },
      { code: "mild_entertainment", title: "轻度娱乐", pricePerHour: 270 }
    ],
    photos: [
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400"
    ],
    city: "西安",
    location: "雁塔区",
    rating_avg: 4.6,
    rating_count: 94,
    verification_status: "verified",
    is_active: true
  }
];

async function seedGuides() {
  console.log('🌱 开始创建测试地陪数据...');

  try {
    // 首先创建对应的用户账号
    for (let i = 0; i < sampleGuides.length; i++) {
      const guide = sampleGuides[i];
      const phone = `1380013800${i + 1}`;
      
      console.log(`📱 创建用户: ${guide.display_name} (${phone})`);
      
      // 创建用户
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
          phone: phone,
          name: guide.display_name,
          role: 'guide',
          intended_role: 'guide',
          password_hash: '$2b$10$eGySiwUzRgCrh6X9okse7e1dToaCL7TpsK3JNLIeCcHrJgdOMvJRO' // 默认密码: 123456
        }, { 
          onConflict: 'phone',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (userError) {
        console.error(`❌ 创建用户失败:`, userError);
        continue;
      }

      console.log(`👤 用户创建成功: ${user.id}`);

      // 创建地陪档案
      const { data: guideProfile, error: guideError } = await supabase
        .from('guides')
        .insert({
          user_id: user.id,
          ...guide
        })
        .select()
        .single();

      if (guideError) {
        console.error(`❌ 创建地陪档案失败:`, guideError);
        continue;
      }

      console.log(`✅ 地陪档案创建成功: ${guideProfile.display_name}`);
    }

    console.log('🎉 所有测试数据创建完成！');

    // 验证数据
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, display_name, city, verification_status')
      .eq('verification_status', 'verified');

    if (error) {
      console.error('❌ 验证数据失败:', error);
    } else {
      console.log(`📊 当前已验证地陪数量: ${guides.length}`);
      guides.forEach(guide => {
        console.log(`  - ${guide.display_name} (${guide.city})`);
      });
    }

  } catch (error) {
    console.error('❌ 创建数据时发生错误:', error);
  }
}

seedGuides();
