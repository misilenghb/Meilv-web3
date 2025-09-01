const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeData() {
  try {
    console.log('开始初始化 Supabase 测试数据...');

    // 生成正确的 UUID
    function generateUUID() {
      return crypto.randomUUID();
    }

    // 查询现有用户
    const { data: existingUsers, error: userQueryError } = await supabase
      .from('users')
      .select('id, phone, name, role')
      .in('phone', ['13800138001', '13800138002', '13800138003']);

    if (userQueryError) {
      console.error('查询现有用户失败:', userQueryError);
      return;
    }

    console.log('找到现有用户:', existingUsers?.length || 0, '个');

    // 获取或创建地陪用户
    let guideUserId1, guideUserId2;

    const user1 = existingUsers?.find(u => u.phone === '13800138001');
    const user2 = existingUsers?.find(u => u.phone === '13800138002');

    if (user1) {
      guideUserId1 = user1.id;
      console.log(`✓ 使用现有用户 ${user1.name} (${user1.id})`);
    } else {
      // 创建新用户
      guideUserId1 = generateUUID();
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: guideUserId1,
          phone: '13800138001',
          name: '小美',
          role: 'guide',
          intended_role: 'guide',
          email: 'xiaomei@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('创建用户小美失败:', error);
        return;
      } else {
        console.log('✓ 用户小美创建成功');
      }
    }

    if (user2) {
      guideUserId2 = user2.id;
      console.log(`✓ 使用现有用户 ${user2.name} (${user2.id})`);
    } else {
      // 创建新用户
      guideUserId2 = generateUUID();
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: guideUserId2,
          phone: '13800138002',
          name: '小丽',
          role: 'guide',
          intended_role: 'guide',
          email: 'xiaoli@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('创建用户小丽失败:', error);
        return;
      } else {
        console.log('✓ 用户小丽创建成功');
      }
    }

    // 创建地陪档案
    const testGuides = [
      {
        id: generateUUID(),
        user_id: guideUserId1,
        display_name: '小美',
        bio: '我是一个热情开朗的地陪，喜欢带大家探索杭州的美景和美食。有丰富的陪伴经验，能够为您提供专业贴心的服务。',
        skills: ['杭州导游', '美食推荐', '购物陪伴', '摄影'],
        hourly_rate: 198,
        city: '杭州',
        location: '西湖区文三路',
        photos: [],
        services: [
          { code: 'daily', title: '日常陪伴', pricePerHour: 198 },
          { code: 'mild_entertainment', title: '微醺娱乐', pricePerHour: 298 },
          { code: 'local_tour', title: '同城旅游', packagePrice: 2900 }
        ],
        verification_status: 'verified',
        rating_avg: 4.9,
        rating_count: 128,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateUUID(),
        user_id: guideUserId2,
        display_name: '小丽',
        bio: '上海本地人，熟悉上海的各个角落，可以带您体验最地道的上海生活。',
        skills: ['上海导游', '本地文化', '夜生活'],
        hourly_rate: 220,
        city: '上海',
        location: '黄浦区南京路',
        photos: [],
        services: [
          { code: 'daily', title: '日常陪伴', pricePerHour: 220 },
          { code: 'mild_entertainment', title: '微醺娱乐', pricePerHour: 320 },
          { code: 'local_tour', title: '同城旅游', packagePrice: 3200 }
        ],
        verification_status: 'pending',
        rating_avg: 0,
        rating_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // 插入地陪档案数据
    for (const guide of testGuides) {
      const { data, error } = await supabase
        .from('guides')
        .upsert(guide, { onConflict: 'id' });
      
      if (error) {
        console.error(`创建地陪档案 ${guide.display_name} 失败:`, error);
      } else {
        console.log(`✓ 地陪档案 ${guide.display_name} 创建成功`);
      }
    }

    // 创建地陪申请记录（简化版本，只包含必要字段）
    const testApplications = [
      {
        id: generateUUID(),
        phone: '13800138001',
        age: 25,
        city: '杭州',
        experience: '有2年陪伴服务经验',
        motivation: '希望通过地陪服务帮助更多人了解杭州',
        id_card_front: 'https://example.com/id_front.jpg',
        id_card_back: 'https://example.com/id_back.jpg',
        status: 'approved',
        submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天前
        reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
        review_notes: '申请材料完整，通过认证'
      },
      {
        id: generateUUID(),
        phone: '13800138002',
        age: 28,
        city: '上海',
        experience: '新手，但很有热情',
        motivation: '想要认识更多朋友，分享上海的美好',
        id_card_front: 'https://example.com/id_front2.jpg',
        id_card_back: 'https://example.com/id_back2.jpg',
        status: 'pending',
        submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
        reviewed_at: null,
        review_notes: null
      }
    ];

    // 插入申请记录
    for (const application of testApplications) {
      const { data, error } = await supabase
        .from('guide_applications')
        .upsert(application, { onConflict: 'id' });

      if (error) {
        console.error(`创建申请记录 ${application.phone} 失败:`, error);
      } else {
        console.log(`✓ 申请记录 ${application.phone} 创建成功`);
      }
    }

    console.log('✅ Supabase 测试数据初始化完成！');

  } catch (error) {
    console.error('初始化数据时发生错误:', error);
    process.exit(1);
  }
}

// 运行初始化
initializeData();
