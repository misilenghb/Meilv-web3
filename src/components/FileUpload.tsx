"use client";

import { useState, useRef } from "react";
import { ModernIcons } from "./icons/ModernIcons";

interface FileUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // MB
  fileType?: 'image' | 'document';
  category?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function FileUpload({
  onUpload,
  onError,
  accept = "image/*",
  maxSize = 10,
  fileType = 'image',
  category = 'photos',
  multiple = false,
  className = "",
  children
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // 目前只处理单个文件
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      // 验证文件大小
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`文件大小不能超过 ${maxSize}MB`);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onUpload(result.url);
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (children) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <ModernIcons.Loading size={24} className="text-pink-600" />
              <span>上传中...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <ModernIcons.Loading size={32} className="text-pink-600" />
            <p className="text-gray-600">上传中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <ModernIcons.Upload size={32} className="text-gray-400" />
            <p className="text-gray-600">
              点击选择文件或拖拽文件到此处
            </p>
            <p className="text-sm text-gray-400">
              支持 {accept.replace(/\*/g, '').replace(/,/g, ', ')} 格式，最大 {maxSize}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
