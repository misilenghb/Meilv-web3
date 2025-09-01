/**
 * Cloudflare Images 加载器
 * 用于优化图片加载性能
 */
export default function cloudflareImageLoader({ src, width, quality }) {
  // 如果是外部URL，直接返回
  if (src.startsWith('http')) {
    return src;
  }
  
  // 如果是本地开发环境，返回原始路径
  if (process.env.NODE_ENV === 'development') {
    return src;
  }
  
  // 构建Cloudflare Images URL
  const params = new URLSearchParams();
  
  if (width) {
    params.set('width', width.toString());
  }
  
  if (quality) {
    params.set('quality', quality.toString());
  }
  
  // 如果配置了Cloudflare Images，使用优化URL
  if (process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID) {
    const accountId = process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID;
    return `https://imagedelivery.net/${accountId}/${src}?${params.toString()}`;
  }
  
  // 否则返回原始路径
  return src;
}
