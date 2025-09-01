import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 上传文件到Supabase Storage
 * @param file 要上传的文件
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @returns 上传结果
 */
export async function uploadFile(file: File, bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      success: true,
      data: data,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('文件上传失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 删除文件
 * @param bucket 存储桶名称
 * @param path 文件路径
 */
export async function deleteFile(bucket: string, path: string) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('文件删除失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成唯一的文件名
 * @param originalName 原始文件名
 * @param prefix 前缀
 */
export function generateUniqueFileName(originalName: string, prefix: string = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${prefix}${timestamp}_${random}.${extension}`;
}

/**
 * 验证文件类型
 * @param file 文件
 * @param allowedTypes 允许的文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]) {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 * @param file 文件
 * @param maxSizeInMB 最大大小（MB）
 */
export function validateFileSize(file: File, maxSizeInMB: number) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * 压缩图片
 * @param file 图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 质量 (0-1)
 */
export function compressImage(
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

// 常用的存储桶和路径配置
export const STORAGE_BUCKETS = {
  GUIDE_APPLICATIONS: 'guide-applications',
  USER_AVATARS: 'user-avatars',
  GUIDE_PHOTOS: 'guide-photos'
} as const;

export const STORAGE_PATHS = {
  ID_CARDS: 'id-cards',
  PHOTOS: 'photos',
  CERTIFICATES: 'certificates',
  AVATARS: 'avatars'
} as const;
