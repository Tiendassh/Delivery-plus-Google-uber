
import { GoogleGenAI } from "@google/genai";

const MODEL = 'gemini-3-pro-preview';

export const generateSmartContract = async (clientData: string) => {
  try {
    // Correctly initialize GoogleGenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Genera una PROPUESTA COMERCIAL FORMAL para: ${clientData}. 
      Debe incluir: 
      1. Plan sugerido (Gold/Diamond).
      2. Comisión por envío (15-20%).
      3. Cláusula de exclusividad logística.
      Tono: Legal, ejecutivo y persuasivo. Formato: Markdown elegante.`,
      config: {
        systemInstruction: "Eres el Director Legal de Delivery Plus. Tu especialidad es redactar acuerdos comerciales que aseguren el ROI y la protección de la red de choferes en Argentina."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Contract AI Error:", error);
    return "Error generando borrador legal. Contacte a soporte humano.";
  }
};
