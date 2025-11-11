
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (image: { file: File; base64: string } | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        onImageUpload({ file, base64: base64String });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      onImageUpload(null);
      if(file) alert("Por favor, envie apenas arquivos PNG.");
    }
  }, [onImageUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png"
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition"
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="font-semibold">Clique para fazer upload</p>
            <p className="text-sm">ou arraste e solte</p>
            <p className="text-xs mt-1">Apenas PNG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
