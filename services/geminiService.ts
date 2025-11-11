
import { GoogleGenAI, Modality } from "@google/genai";
import { MockupCategory } from '../types';

const categoryMap: Record<MockupCategory, string> = {
    stationery: 'artigos de papelaria (cartão de visita, papel timbrado)',
    facade: 'fachada de uma loja ou prédio',
    packaging: 'uma embalagem de produto (caixa, sacola, rótulo)',
    tshirt: 'uma camiseta ou peça de vestuário',
    mobile: 'a tela de um smartphone',
    desktop: 'a tela de um monitor de computador',
    tablet: 'a tela de um tablet'
};

export const generateMockup = async (
  base64Image: string,
  mimeType: string,
  category: MockupCategory,
  promptText: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const contextDescription = categoryMap[category] || 'um item genérico';

  const prompt = `Crie um mockup fotorrealista aplicando a imagem fornecida em um contexto de ${contextDescription}. A imagem principal deve ser o foco central, claramente visível e bem integrada ao ambiente. ${promptText ? `Incorpore o seguinte estilo: ${promptText}.` : 'Use um estilo limpo e moderno.'}`;
  
  // The Gemini API expects the base64 string without the data URI prefix.
  const pureBase64 = base64Image.split(',')[1];
  
  if (!pureBase64) {
      throw new Error("Invalid base64 image format.");
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: pureBase64,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64Bytes = part.inlineData.data;
      const responseMimeType = part.inlineData.mimeType;
      return `data:${responseMimeType};base64,${base64Bytes}`;
    }
  }

  throw new Error("A API não retornou uma imagem.");
};
