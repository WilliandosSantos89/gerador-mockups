
import React, { useState, useCallback } from 'react';
import { generateMockup } from './services/geminiService';
import { MockupCategory } from './types';
import ImageUploader from './components/ImageUploader';
import MockupGrid from './components/MockupGrid';
import { LoadingIcon } from './components/icons';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; base64: string } | null>(null);
  const [category, setCategory] = useState<MockupCategory>('stationery');
  const [promptText, setPromptText] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>(Array(4).fill(''));
  const [loadingStates, setLoadingStates] = useState<boolean[]>(Array(4).fill(false));
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const categories: { key: MockupCategory; name: string }[] = [
    { key: 'stationery', name: 'Papelaria' },
    { key: 'facade', name: 'Fachada' },
    { key: 'packaging', name: 'Embalagem' },
    { key: 'tshirt', name: 'Camiseta' },
    { key: 'mobile', name: 'Mobile' },
    { key: 'desktop', name: 'Desktop' },
    { key: 'tablet', name: 'Tablet' },
  ];

  const handleGeneration = useCallback(async (indices: number[]) => {
    if (!uploadedImage) {
      setError('Por favor, faça upload de uma imagem primeiro.');
      return;
    }

    setError(null);
    setHasGenerated(true);

    const newLoadingStates = [...loadingStates];
    indices.forEach(i => newLoadingStates[i] = true);
    setLoadingStates(newLoadingStates);
    if (indices.length > 1) setIsGeneratingAll(true);

    const promises = indices.map(index => 
        generateMockup(uploadedImage.base64, uploadedImage.file.type, category, promptText)
          .then(newImage => ({ newImage, index }))
          .catch(err => ({ error: err, index }))
    );

    const results = await Promise.all(promises);

    const finalImages = [...generatedImages];
    const finalLoadingStates = [...loadingStates];
    
    results.forEach(result => {
      const { index } = result;
      if ('newImage' in result) {
        finalImages[index] = result.newImage;
      } else {
        console.error(`Error generating image for index ${index}:`, result.error);
        setError(`Erro ao gerar imagem ${index + 1}. Tente novamente.`);
        finalImages[index] = ''; // Clear image on error
      }
      finalLoadingStates[index] = false;
    });

    setGeneratedImages(finalImages);
    setLoadingStates(finalLoadingStates);
    if (indices.length > 1) setIsGeneratingAll(false);
  }, [uploadedImage, category, promptText, generatedImages, loadingStates]);

  const handleGenerateAll = () => {
    handleGeneration([0, 1, 2, 3]);
  };

  const handleRedo = (index: number) => {
    handleGeneration([index]);
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `mockup-${category}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Gerador de Mockups com IA</h1>
          <p className="text-lg text-gray-600 mt-2">Transforme suas imagens em mockups profissionais instantaneamente.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-4 text-gray-700">Configurações</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">1. Faça upload da sua imagem</label>
                <ImageUploader onImageUpload={setUploadedImage} />
              </div>

              <div>
                <label htmlFor="category" className="block text-md font-medium text-gray-700 mb-2">2. Escolha o contexto</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MockupCategory)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="prompt" className="block text-md font-medium text-gray-700 mb-2">3. Detalhe o estilo (opcional)</label>
                <textarea
                  id="prompt"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: minimalista, fundo de madeira, luz natural..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <button
                onClick={handleGenerateAll}
                disabled={!uploadedImage || isGeneratingAll}
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isGeneratingAll && <LoadingIcon />}
                {isGeneratingAll ? 'Gerando...' : 'Gerar 4 Mockups'}
              </button>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
             <MockupGrid
                images={generatedImages}
                loadingStates={loadingStates}
                onRedo={handleRedo}
                onDownload={handleDownload}
                hasGenerated={hasGenerated}
             />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
