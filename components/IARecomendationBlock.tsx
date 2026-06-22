import React, { useState } from 'react';

interface IARecomendationBlockProps {
  role: 'REPARTIDOR' | 'COMERCIO' | 'EMPRENDEDOR';
}

export const IARecomendationBlock: React.FC<IARecomendationBlockProps> = ({ role }) => {
  const [iaLoading, setIaLoading] = useState(false);
  const [iaRecommendation, setIaRecommendation] = useState(
    role === 'REPARTIDOR'
      ? 'Descubrí cómo el clima y el horario afectan tus ingresos rápidos. Hacé clic para generar plan logístico.'
      : role === 'COMERCIO'
      ? 'Descubrí la mejor hora para armar tus despachos según el estado del tráfico y lluvia de hoy.'
      : 'Estrategias logísticas exprés para que tus envíos salgan más rápido según la demanda de mensajeros diaria.'
  );

  const handleGetIaRecommendation = async () => {
    setIaLoading(true);
    try {
      const prompt = `Como asistente de Delivery Plus Misiones. Escribe en argentino rioplatense (che, mirá, viste).
      Rol del usuario al que le hablas: ${role}.
      Clima actual: 24°C, Tormentas Aisladas, 65% probabilidad lluvia.
      Pídele que se prepare acorde al clima y recomiéndale acciones. Breve, max 40 palabras.`;

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'user', text: prompt }],
          systemInstruction: 'Eres un estratega logístico amigable y argentino.'
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setIaRecommendation(data.text);
    } catch {
      setIaRecommendation('Che, la conexión anda medio inestable por la tormenta, pero te recomiendo priorizar despachos urgentes ahora mismo que hay motos disponibles. ¡Éxitos!');
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] text-white p-8 md:p-12 rounded-[20px] border border-blue-500/30 shadow-lg shadow-blue-500/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 text-[15rem] font-poppins font-black text-blue-500/[0.03] select-none pointer-events-none">
        I.A.
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="max-w-2xl">
          <span className="px-3 py-1 bg-blue-500/15 text-blue-400 font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-blue-500/20">
            ASISTENTE PREDICTIVO IA NATIVO [ARGENTINA]
          </span>
          <h3 className="text-2xl md:text-3xl font-poppins font-bold mt-4">
            Recomendación Operativa Delivery Plus
          </h3>
          <p className="text-gray-400 text-sm font-semibold mt-4 leading-relaxed italic border-l-2 border-blue-500 pl-4">
            "{iaRecommendation}"
          </p>
        </div>

        <button
          onClick={handleGetIaRecommendation}
          disabled={iaLoading}
          className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-black uppercase text-[10px] tracking-wider transition-all disabled:opacity-50 ${
            iaLoading ? 'animate-pulse' : ''
          }`}
        >
          {iaLoading ? 'Analizando Red...' : 'Recibir Consejos Heurísticos IA'}
        </button>
      </div>
    </div>
  );
};
