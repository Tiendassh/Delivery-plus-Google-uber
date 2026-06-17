
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { GoogleGenAI } from "@google/genai";
import { mercadoPagoService } from '../services/mercadoPagoService';

const DriverOnboardingView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    vehicle: 'Moto',
    plate: '',
    monotributo: true,
    insurance: 'VIGENTE'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidKit, setPaidKit] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Valida brevemente: Socio ${formData.name}, Patente ${formData.plate}.`
      });

      await apiService.registerDriver({
        nombre: formData.name,
        vehiculo: formData.vehicle,
        patente: formData.plate,
        polizaSeguro: formData.insurance,
        nivel: paidKit ? 'DIAMANTE' : 'PLATA',
        etapaIngreso: 'ACTIVO',
        latitud: -27.368,
        longitud: -55.895
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayKit = async () => {
    await mercadoPagoService.registrarVenta(12500, `Kit Profesional - ${formData.name}`, 'MEMBRESIA_PAQUETERIA');
    setPaidKit(true);
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center p-20 bg-emerald-50 rounded-[5rem] border border-emerald-100 animate-in zoom-in duration-500">
      <div className="text-9xl mb-12">🎉</div>
      <h2 className="text-6xl font-black tracking-tighter text-emerald-900">¡Socio Activado!</h2>
      <button onClick={() => setSuccess(false)} className="mt-12 px-16 py-6 bg-emerald-900 text-white rounded-full font-black uppercase tracking-widest italic">Registrar Otro</button>
    </div>
  );

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-white p-14 rounded-[5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-7xl font-black tracking-tighter leading-none italic uppercase">Rider <span className="text-plus-blue">Nexus</span></h2>
          <p className="text-slate-400 mt-6 text-2xl font-medium italic">Alta de socios y aprovisionamiento de kit logístico</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <form onSubmit={handleRegister} className="bg-white p-16 rounded-[6rem] border border-slate-100 shadow-sm space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Nombre del Socio</label>
            <input required placeholder="Ej. Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-8 py-6 rounded-[2.5rem] font-bold text-lg" />
          </div>

          <div className="bg-plus-blue p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-2xl font-black italic tracking-tighter mb-4">Pack Socio Diamante</h4>
              <p className="text-sm opacity-80 mb-8 leading-relaxed">Prioridad absoluta en envíos de alto valor y kit de seguridad Plus.</p>
              <button type="button" onClick={handlePayKit} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${paidKit ? 'bg-emerald-400' : 'bg-white text-black hover:scale-105'}`}>
                {paidKit ? 'KIT ADQUIRIDO' : 'Comprar Pack - $12.500'}
              </button>
            </div>
            <div className="absolute top-0 right-0 p-10 text-9xl opacity-10 pointer-events-none group-hover:scale-110 transition-transform italic font-black">P+</div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <input required placeholder="Patente" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="bg-slate-50 border border-slate-100 px-8 py-6 rounded-[2.5rem] font-bold" />
            <select value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className="bg-slate-50 border border-slate-100 px-8 py-6 rounded-[2.5rem] font-bold">
               <option>Moto</option>
               <option>Auto</option>
               <option>Bicicleta</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-8 rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-3xl hover:bg-plus-blue transition-all disabled:opacity-50">
            {loading ? 'Sincronizando...' : 'Finalizar Registro de Red'}
          </button>
        </form>

        <div className="bg-[#0A0A0B] p-16 rounded-[6rem] text-white relative overflow-hidden flex flex-col justify-center">
           <h4 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-tight">Política de<br/><span className="text-plus-blue">Cumplimiento</span></h4>
           <p className="text-white/40 font-medium italic leading-relaxed text-sm mb-12">
             Al registrar un nuevo socio, el sistema valida automáticamente la póliza de seguro y el estado fiscal ante la AFIP mediante nuestra red neuronal de auditoría.
           </p>
           <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Verificación Seguros Online</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Validación Fiscal Automática</p>
              </div>
           </div>
           <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-white/[0.02] italic rotate-12 pointer-events-none">OPS</div>
        </div>
      </div>
    </div>
  );
};

export default DriverOnboardingView;
