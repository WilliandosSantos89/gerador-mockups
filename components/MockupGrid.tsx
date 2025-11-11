
import React from 'react';
import { DownloadIcon, RedoIcon, LoadingIcon, ImageIcon } from './icons';

interface MockupGridProps {
  images: string[];
  loadingStates: boolean[];
  onRedo: (index: number) => void;
  onDownload: (imageUrl: string) => void;
  hasGenerated: boolean;
}

const MockupCard: React.FC<{
  image: string;
  isLoading: boolean;
  onRedo: () => void;
  onDownload: () => void;
}> = ({ image, isLoading, onRedo, onDownload }) => {
  return (
    <div className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square shadow-inner">
      {isLoading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-200/50">
          <LoadingIcon className="h-10 w-10 text-indigo-500" />
        </div>
      ) : image ? (
        <img src={image} alt="Mockup gerado" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
           <ImageIcon className="w-16 h-16 text-gray-300" />
        </div>
      )}
      
      {!isLoading && image && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-4">
          <button
            onClick={onDownload}
            className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition"
            title="Baixar"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onRedo}
            className="bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition"
            title="Refazer"
          >
            <RedoIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      {isLoading && (
         <div className="absolute bottom-2 right-2 bg-white/80 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <LoadingIcon className="h-3 w-3" />
            <span>Gerando...</span>
         </div>
      )}
    </div>
  );
};

const MockupGrid: React.FC<MockupGridProps> = ({ images, loadingStates, onRedo, onDownload, hasGenerated }) => {
  if (!hasGenerated) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
        <ImageIcon className="w-24 h-24 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Seus mockups aparecerão aqui</h3>
        <p className="mt-1">Preencha as configurações ao lado para começar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {images.map((img, index) => (
        <MockupCard
          key={index}
          image={img}
          isLoading={loadingStates[index]}
          onRedo={() => onRedo(index)}
          onDownload={() => onDownload(img)}
        />
      ))}
    </div>
  );
};

export default MockupGrid;
