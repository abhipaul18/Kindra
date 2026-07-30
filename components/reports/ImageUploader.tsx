'use client';

import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File | null) => void;
  error?: string;
}

export function ImageUploader({ onImageSelected, error }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setPreviewUrl(null);
      setFileName(null);
      onImageSelected(null);
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds maximum limit of 10MB');
      return;
    }

    // Validate format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFileName(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelected(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-bold text-on-surface flex items-center justify-between">
        <span>Issue Photo <span className="text-error">*</span></span>
        <span className="text-xs text-on-surface-variant font-normal">JPG, PNG, WEBP (Max 10MB)</span>
      </label>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-primary/30 group bg-surface-container-high">
          <img src={previewUrl} alt="Report Upload Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-md">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface text-on-surface px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              Replace
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="bg-error text-on-error px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-surface/90 text-on-surface text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm truncate max-w-[80%]">
            {fileName}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-md text-center cursor-pointer transition-colors ${
            error || fileError
              ? 'border-error/50 bg-error-container/10'
              : 'border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-primary-container/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">add_a_photo</span>
          </div>
          <p className="font-bold text-sm text-on-surface">Click or drag image to upload</p>
          <p className="text-xs text-on-surface-variant mt-1">Take photo with camera or choose from gallery</p>
        </div>
      )}

      {(error || fileError) && (
        <span className="text-xs text-error font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {fileError || error}
        </span>
      )}
    </div>
  );
}
