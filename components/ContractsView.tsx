
import React, { useState } from 'react';
import { generateSmartContract } from '../services/contractService';
import StatusBadge from './StatusBadge';

const ContractsView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [contractDraft, setContractDraft] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('Restaurante El Noble');

  const handleGenerate = async () => {
    setLoading(true);
    const draft = await generateSmartContract(`CLIENTE: ${selectedClient}. PLAN: Diamond. REGION: Misiones. OPERATIVA: 500 envíos/mes.`);
    setContractDraft(draft || null);
    setLoading(false);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-white p-14 rounded-[5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-7xl font-black tracking-tighter leading-none">Smart Contracts</h2>
          <p className="text-slate-400 mt-6 text-2xl font-medium italic">Automatización legal para expansión agresiva</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-3 rounded-full">
           <select 
             className="bg-transparent px-8 py-3 font-black text-sm border-none focus:ring-0"
             value={selectedClient}
             onChange={(e) => setSelectedClient(e.target.value)}
           >
              <option>Restaurante El Noble</option>
              <option>Sushi Master</option>
              <option>Tienda Nube Ezeiza</option>
           </select>
           <button 
             onClick={handleGenerate}
             disabled={loading}
             className="bg-black text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
           >
             {loading ? 'Generando...' : 'Analizar & Redactar'}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white rounded-[5rem] border border-slate-100 shadow-sm p-16 min-h-[600px] overflow-y-auto custom-scrollbar">
           {contractDraft ? (
             <div className="prose prose-slate max-w-none">
                <div className="flex justify-between items-start mb-12">
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Borrador IA v4.0 • Gemini 3 Pro</p>
                   </div>
                   <StatusBadge status="PENDING" />
                </div>
                <div className="font-medium text-slate-700 text-lg leading-relaxed whitespace-pre-wrap italic bg-slate-50 p-12 rounded-[3rem] border border-slate-100">
                   {contractDraft}
                </div>
                <div className="mt-12 flex gap-4">
                   <button className="flex-1 bg-black text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl">Firmar & Enviar a Cliente</button>
                   <button className="px-12 bg-slate-100 text-slate-500 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest">Editar Manualmente</button>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                <div className="text-[12rem] mb-8">🖋️</div>
                <p className="text-2xl font-black uppercase tracking-[0.5em]">Seleccione un lead para formalizar</p>
             </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-black p-12 rounded-[4rem] text-white shadow-3xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Pipeline de Cierre</p>
              <div className="space-y-6">
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold">Pizzería El Sol</p>
                    <StatusBadge status="ACTIVE" />
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                    <p className="text-xs font-bold">Farmacia 24hs</p>
                    <StatusBadge status="PREPARING" />
                 </div>
              </div>
           </div>
           
           <div className="bg-[#276EF1] p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 group-hover:scale-125 transition-transform duration-1000">🤝</div>
              <p className="text-4xl font-black tracking-tighter mb-2">92%</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Probabilidad de Cierre Hoy</p>
              <p className="text-xs mt-8 font-medium italic opacity-80 leading-relaxed">"Gemini Pro detecta alta intención de compra en el Restaurante El Noble tras mención de plan Diamond."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsView;
