
import { GoogleGenAI } from "@google/genai";

const PRO_MODEL = 'gemini-3-pro-preview'; 
const FLASH_MODEL = 'gemini-3-flash-preview';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const getLogisticsInsights = async (summary: string) => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Contexto: ${summary}. Genera una observación ejecutiva de máximo 15 palabras. No uses markdown, solo texto plano.`,
      config: {
        systemInstruction: "Eres el Analista Estratégico de Delivery Plus. Tu tono es profesional, analítico y directo."
      }
    });
    return response.text || "Operativa estable. Red sincronizada.";
  } catch (err: any) {
    if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return "Cuota de IA excedida. Reintentando en breve...";
    }
    console.error("Gemini Insight Error:", err);
    return "Analizando flujos neuronales...";
  }
};

export const chatWithStrategist = async (history: ChatMessage[], message: string) => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: PRO_MODEL,
      config: {
        systemInstruction: "Eres el Consultor Senior de Delivery Plus. Ayudas a optimizar la rentabilidad de los choferes y la expansión de la red logística en Argentina. Responde de forma concisa pero con autoridad técnica."
      }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (err: any) {
    if (err.message?.includes('429')) {
      return "El sistema está saturado. Por favor, selecciona una API Key con facturación activa en la configuración.";
    }
    console.error("Gemini Strategist Error:", err);
    return "Error en el enlace estratégico. Reintentando conexión segura...";
  }
};
