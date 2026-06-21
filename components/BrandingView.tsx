import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const BrandingView: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [generatedFlyer, setGeneratedFlyer] = useState<string | null>(null);
  const [targetStore, setTargetStore] = useState('Delivery Plus');

  const generateAsset = async (type: 'LOGO' | 'FLYER') => {
    setGenerating(true);
    setError(null);
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    const context = targetStore === 'Delivery Plus' 
      ? "Empresa de logística Delivery Plus Argentina" 
      : `El comercio '${targetStore}' ubicado en Misiones, Argentina`;

    const prompt = type === 'LOGO' 
      ? `Premium minimalist logo for '${context}'. Bold typography, high contrast, vector style, white background, professional branding.`
      : `Modern social media marketing flyer for '${context}'. Instagram story layout, vibrant colors, clear space for text, high resolution, delivery concept.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        // @ts-ignore
        config: { imageConfig: { aspectRatio: type === 'LOGO' ? "1:1" : "9:16" } }
      });

      let found = false;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const url = `data:image/png;base64,${part.inlineData.data}`;
            if (type === 'LOGO') setGeneratedLogo(url);
            else setGeneratedFlyer(url);
            found = true;
            break;
          }
        }
      }
      if (!found) throw new Error("No image part in response");
    } catch (err) {
      console.error("Error IA Branding:", err);
      setError("Error en la generación. Verifica la cuota de la API o reintenta.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-white p-14 rounded-[5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-7xl font-black tracking-tighter leading-none text-black italic">Estudio <span className="text-plus-blue">Creativo</span></h2>
          <p className="text-slate-400 mt-6 text-2xl font-medium italic">Identidad visual generada por red neuronal</p>
        </div>
        <div className="flex flex-col gap-4 text-black w-full md:w-auto">
           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-6">Comercio Objetivo:</label>
           <select 
             value={targetStore}
             onChange={(e) => setTargetStore(e.target.value)}
             className="bg-slate-100 px-10 py-6 rounded-[2rem] font-black text-sm border-none focus:ring-4 focus:ring-blue-100 outline-none"
           >
              <option value="Delivery Plus">Plus Central</option>
              <option value="Pizzería El Sol">Pizzería El Sol</option>
              <option value="Farmacia Posadas">Farmacia Posadas</option>
              <option value="Sushi Master">Sushi Master</option>
           </select>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 p-8 rounded-[3rem] text-red-600 font-black uppercase text-[10px] tracking-widest animate-in slide-in-from-top flex items-center gap-4">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* LOGOS */}
        <div className="bg-white p-20 rounded-[6rem] border border-slate-100 shadow-sm flex flex-col text-black organic-card">
          <div className="flex justify-between items-center mb-16">
             <h4 className="font-black text-3xl tracking-tight uppercase italic">Logotipo</h4>
             <div className="px-6 py-2 bg-blue-50 text-[#276EF1] rounded-full text-[10px] font-black uppercase tracking-widest">IA Vectorial</div>
          </div>
          
          <div className="flex-1 bg-slate-900 rounded-[4rem] aspect-square flex items-center justify-center overflow-hidden relative group border-8 border-slate-50 shadow-inner">
             {generatedLogo ? (
               <img src={generatedLogo} className="w-full h-full object-cover" alt="Logo IA" />
             ) : (
               <div className="text-center p-12 opacity-20">
                 <div className="text-9xl mb-8">🎨</div>
                 <p className="font-black uppercase tracking-widest text-[10px]">Sin activos</p>
               </div>
             )}
             {generating && (
               <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 border-4 border-plus-blue border-t-transparent rounded-full animate-spin mb-8"></div>
                  <p className="font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Renderizando...</p>
               </div>
             )}
          </div>

          <button 
            onClick={() => generateAsset('LOGO')}
            disabled={generating}
            className="mt-12 w-full bg-black text-white py-8 rounded-[3rem] font-black text-base uppercase tracking-[0.3em] shadow-3xl hover:bg-plus-blue transition-all disabled:opacity-50"
          >
            {generating ? 'Procesando...' : `Generar Marca`}
          </button>
        </div>

        {/* FLYERS */}
        <div className="bg-white p-20 rounded-[6rem] border border-slate-100 shadow-sm flex flex-col text-black organic-card">
          <div className="flex justify-between items-center mb-16">
             <h4 className="font-black text-3xl tracking-tight uppercase italic">Promoción</h4>
             <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ads Generator</div>
          </div>

          <div className="flex-1 bg-slate-50 rounded-[4rem] aspect-[9/16] flex items-center justify-center overflow-hidden relative group border-8 border-white shadow-inner max-h-[600px] mx-auto w-full">
             {generatedFlyer ? (
               <img src={generatedFlyer} className="w-full h-full object-cover" alt="Flyer IA" />
             ) : (
               <div className="text-center p-12 opacity-20">
                 <div className="text-9xl mb-8">📣</div>
                 <p className="font-black uppercase tracking-widest text-[10px]">Esperando prompt...</p>
               </div>
             )}
             {generating && (
               <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-white">
                  <div className="w-16 h-16 border-4 border-plus-blue border-t-transparent rounded-full animate-spin mb-8"></div>
                  <p className="font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Compilando Flyer...</p>
               </div>
             )}
          </div>

          <button 
            onClick={() => generateAsset('FLYER')}
            disabled={generating}
            className="mt-12 w-full bg-[#276EF1] text-white py-8 rounded-[3rem] font-black text-base uppercase tracking-[0.3em] shadow-[0_40px_80px_rgba(39,110,241,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {generating ? 'Generando...' : 'Crear Flyer de Red'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingView;