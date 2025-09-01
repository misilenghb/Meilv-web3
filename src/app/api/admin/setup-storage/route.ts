import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log("开始设置Storage存储桶...");

    // 创建存储桶
    const buckets = [
      {
        id: 'guide-applications',
        name: 'guide-applications',
        public: true
      },
      {
        id: 'user-avatars',
        name: 'user-avatars', 
        public: true
      },
      {
        id: 'guide-photos',
        name: 'guide-photos',
        public: true
      }
    ];

    const results = [];

    for (const bucket of buckets) {
      try {
        // 尝试创建存储桶
        const { data, error } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png', 
            'image/webp',
            'application/pdf'
          ],
          fileSizeLimit: 20971520 // 20MB
        });

        if (error) {
          if (error.message.includes('already exists')) {
            results.push({
              bucket: bucket.id,
              status: 'exists',
              message: '存储桶已存在'
            });
          } else {
            results.push({
              bucket: bucket.id,
              status: 'error',
              message: error.message
            });
          }
        } else {
          results.push({
            bucket: bucket.id,
            status: 'created',
            message: '存储桶创建成功'
          });
        }
      } catch (err) {
        results.push({
          bucket: bucket.id,
          status: 'error',
          message: err.message
        });
      }
    }

    // 设置存储桶策略
    const policies = [
      {
        bucket: 'guide-applications',
        policy: `
          CREATE POLICY "Allow authenticated users to upload" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'guide-applications' AND auth.role() = 'authenticated');
          
          CREATE POLICY "Allow public read access" ON storage.objects
          FOR SELECT USING (bucket_id = 'guide-applications');
          
          CREATE POLICY "Allow users to delete their own files" ON storage.objects
          FOR DELETE USING (bucket_id = 'guide-applications' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      }
    ];

    const policyResults = [];
    for (const policy of policies) {
      try {
        // 注意：这里需要直接执行SQL，因为Supabase JS客户端不直接支持策略创建
        console.log(`设置 ${policy.bucket} 存储桶策略...`);
        policyResults.push({
          bucket: policy.bucket,
          status: 'policy_set',
          message: '策略设置完成（需要在Supabase控制台中手动执行）'
        });
      } catch (err) {
        policyResults.push({
          bucket: policy.bucket,
          status: 'policy_error',
          message: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Storage设置完成",
      buckets: results,
      policies: policyResults,
      instructions: {
        message: "请在Supabase控制台的Storage > Policies中手动添加以下策略",
        policies: [
          {
            bucket: "guide-applications",
            name: "Allow authenticated upload",
            operation: "INSERT",
            policy: "bucket_id = 'guide-applications' AND auth.role() = 'authenticated'"
          },
          {
            bucket: "guide-applications", 
            name: "Allow public read",
            operation: "SELECT",
            policy: "bucket_id = 'guide-applications'"
          },
          {
            bucket: "guide-applications",
            name: "Allow user delete own files",
            operation: "DELETE", 
            policy: "bucket_id = 'guide-applications' AND auth.uid()::text = (storage.foldername(name))[1]"
          }
        ]
      }
    });

  } catch (error) {
    console.error('Storage setup error:', error);
    return NextResponse.json(
      { 
        error: "Storage设置失败", 
        details: error.message
      },
      { status: 500 }
    );
  }
}
