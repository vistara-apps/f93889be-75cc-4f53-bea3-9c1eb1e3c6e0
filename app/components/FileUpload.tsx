'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = 'image/*,video/*,audio/*',
  maxFiles = 5,
  maxSize = 50, // 50MB
  className,
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);

    // Validate file count
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes and types
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB`);
        continue;
      }

      // Basic type validation
      if (!file.type.match(/(image|video|audio)/)) {
        alert(`File ${file.name} is not a supported type`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create preview URLs for images
    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setIsUploading(true);

    try {
      await onUpload(validFiles);

      // Update status to completed
      setUploadedFiles(prev =>
        prev.map(uf =>
          validFiles.includes(uf.file)
            ? { ...uf, progress: 100, status: 'completed' as const }
            : uf
        )
      );
    } catch (error: any) {
      // Update status to error
      setUploadedFiles(prev =>
        prev.map(uf =>
          validFiles.includes(uf.file)
            ? { ...uf, status: 'error' as const, error: error.message }
            : uf
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
          isDragOver
            ? 'border-accent bg-accent bg-opacity-10'
            : 'border-accent border-opacity-30 hover:border-opacity-60',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-fg mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Media Assets'}
        </h3>
        <p className="text-muted mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-muted">
          Supports images, videos, and audio files up to {maxSize}MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-fg">Uploaded Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedFiles.map((uploadedFile, index) => {
              const Icon = getFileIcon(uploadedFile.file);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center space-x-3 p-3 border rounded-sm',
                    uploadedFile.status === 'completed'
                      ? 'border-green-500 bg-green-500 bg-opacity-10'
                      : uploadedFile.status === 'error'
                      ? 'border-red-500 bg-red-500 bg-opacity-10'
                      : 'border-accent border-opacity-30'
                  )}
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-12 h-12 object-cover rounded-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-surface rounded-sm flex items-center justify-center">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress/Error */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-surface rounded-full h-1">
                          <div
                            className="bg-accent h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">
                          {uploadedFile.progress}% uploaded
                        </p>
                      </div>
                    )}

                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <p className="text-xs text-red-400 mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 p-1 text-muted hover:text-red-400 transition-colors duration-200"
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {uploadedFiles.length} of {maxFiles} files uploaded
        </span>
        {isUploading && (
          <span className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </span>
        )}
      </div>
    </div>
  );
}

