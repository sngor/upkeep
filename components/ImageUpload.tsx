
import React, { useRef, useState } from 'react';
import { CameraIcon, UploadCloudIcon } from './Icons';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="text-center bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700">
      <div className="max-w-xl mx-auto">
        <CameraIcon className="mx-auto h-16 w-16 text-indigo-400 animate-text-focus-in" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white animate-text-focus-in" style={{animationDelay: '0.2s'}}>
          Your Smart Home Partner
        </h2>
        <p className="mt-2 text-md text-slate-300 animate-text-focus-in" style={{animationDelay: '0.4s'}}>
          Snap a photo of your appliance's label to instantly get maintenance schedules, user manuals, and local service providers.
        </p>
      </div>

      <input
        type="file"
        id="file-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      <label
          htmlFor="file-upload"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mt-8 group relative block w-full rounded-lg border-2 border-dashed border-slate-600 p-12 text-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out cursor-pointer ${isDragging ? 'ring-2 ring-indigo-400 ring-offset-4 ring-offset-slate-900 bg-indigo-500/10 scale-105' : ''}`}
        >
        <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-500 transition-transform duration-300 group-hover:scale-110"/>
        <span className="mt-2 block text-sm font-medium text-slate-200">
          <span className="text-indigo-400">Upload a file</span> or drag and drop
        </span>
        <span className="block text-xs text-slate-400">PNG, JPG, GIF up to 10MB</span>
      </label>

      <button
        onClick={handleButtonClick}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-indigo-600 hover:bg-indigo-500 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105"
      >
        <CameraIcon className="-ml-1 mr-3 h-5 w-5" />
        Snap a Photo
      </button>
    </div>
  );
};