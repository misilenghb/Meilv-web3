"use client";

import { useState } from "react";
import { ShareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
}

export default function ShareButton({ title, description, url, imageUrl }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} - ${description}`;

  const shareOptions = [
    {
      name: "微信",
      icon: "💬",
      color: "bg-green-500",
      action: () => {
        // 微信分享需要微信SDK，这里先显示提示
        alert("请复制链接后在微信中分享");
        copyToClipboard();
      }
    },
    {
      name: "QQ",
      icon: "🐧",
      color: "bg-blue-500",
      action: () => {
        const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        window.open(qqUrl, '_blank');
      }
    },
    {
      name: "微博",
      icon: "📱",
      color: "bg-red-500",
      action: () => {
        const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}&pic=${encodeURIComponent(imageUrl || '')}`;
        window.open(weiboUrl, '_blank');
      }
    },
    {
      name: "复制链接",
      icon: "🔗",
      color: "bg-gray-500",
      action: copyToClipboard
    }
  ];

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowModal(false);
      }, 2000);
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowModal(false);
      }, 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-3 bg-white border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors"
        title="分享"
      >
        <ShareIcon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">分享地陪</h3>
              <p className="text-gray-600 text-sm">{title}</p>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`${option.color} hover:opacity-90 text-white p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 shadow-lg hover:shadow-xl`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* URL Display */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <p className="text-xs text-gray-500 mb-1">分享链接</p>
                  <p className="text-sm text-gray-800 truncate">{shareUrl}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {copied && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm text-center">
                  ✅ 链接已复制到剪贴板
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
