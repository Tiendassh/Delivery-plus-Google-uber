
import React from 'react';
import { SocioRepartidor } from '../types';

interface DriverReputationViewProps {
  drivers: SocioRepartidor[];
}

const DriverReputationView: React.FC<DriverReputationViewProps> = ({ drivers }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 bg-white p-14 rounded-[5rem] shadow-sm border border-slate-100 text-black">
        <div>
          <h2 className="text-7xl font-black tracking-tighter leading-none">Calidad de Red</h2>
          <p className="text-slate-400 mt-6 text-2xl font-medium italic">Scoring de cumplimiento y reputación de socios</p>
        </div>
        <div className="px-8 py-4 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest">
           Media Argentina: 4.8 ★
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-black">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white p-12 rounded-[5rem] border border-slate-100 shadow-sm group hover:-translate-y-2 transition-all duration-500">
             <div className="flex items-center gap-6 mb-10">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.nombre}`} className="w-20 h-20 rounded-full bg-slate-50 p-1 border-2 border-slate-100" alt="socio" />
                <div>
                   <h4 className="text-2xl font-black tracking-tight">{driver.nombre}</h4>
                   <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest italic">Socio {driver.nivel}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-3xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Puntaje</p>
                   <p className="text-3xl font-black">⭐ {driver.calificacion.toFixed(1)}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Reseñas</p>
                   <p className="text-3xl font-black">{driver.reseñas?.length || 0}</p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-2">Cumplimiento Legal</p>
                <div className="flex justify-between px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl">
                   <span className="text-[10px] font-black uppercase">Monotributo</span>
                   <span className="text-[10px] font-black">{driver.monotributoActivo ? 'OK' : 'PENDIENTE'}</span>
                </div>
                <div className="flex justify-between px-4 py-2 bg-blue-50 text-blue-600 rounded-xl">
                   <span className="text-[10px] font-black uppercase">Seguro Vida</span>
                   <span className="text-[10px] font-black">VIGENTE</span>
                </div>
             </div>

             <div className="mt-10 pt-10 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Última Devolución</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed truncate">"{driver.reseñas?.[0]?.comentario || 'Sin comentarios aún'}"</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverReputationView;
