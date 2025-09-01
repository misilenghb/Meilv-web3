const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Creating basic tables in Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBasicTables() {
  try {
    // 创建用户表
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // 测试插入一个用户
    console.log('Testing user insertion...');
    const { data: testUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        phone: '13800138000',
        name: '测试用户',
        role: 'user',
        intended_role: 'user'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting test user:', insertError);
    } else {
      console.log('✅ Test user created:', testUser);
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

createBasicTables().then(success => {
  if (success) {
    console.log('\n🎉 Basic tables created successfully!');
  } else {
    console.log('\n❌ Failed to create tables.');
  }
  process.exit(success ? 0 : 1);
});
