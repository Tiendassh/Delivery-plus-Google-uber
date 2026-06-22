
import React, { useMemo } from 'react';
import { SocioRepartidor } from '../types';
import { Shield, TrendingUp, Award, Clock, Star, Activity, AlertTriangle } from 'lucide-react';
import { BrandIllustration } from './BrandComponents';

interface DriverReputationViewProps {
  drivers: SocioRepartidor[];
}

export const DriverReputationView: React.FC<DriverReputationViewProps> = ({ drivers }) => {

  // Simulate metrics for each driver to show the formula
  const reputationData = useMemo(() => {
    return drivers.map((driver, index) => {
      // Use driver.id or index to deterministically generate stats
      const baseSeed = (typeof driver.id === 'number' ? driver.id : index) * 13;
      
      const cumplimiento = 80 + (baseSeed % 20); // 80 - 100
      const puntualidad = 75 + (baseSeed % 25); // 75 - 100
      const valoracion = (driver.calificacion / 5) * 100; // 0 - 100
      const experiencia = Math.min(100, 50 + (driver.gananciasSemanales / 1000) * 5); // 50 - 100
      const incidencias = 100 - (baseSeed % 15); // 85 - 100 (100 means no incidents)

      const finalScore = 
        (cumplimiento * 0.40) +
        (puntualidad * 0.25) +
        (valoracion * 0.20) +
        (experiencia * 0.10) +
        (incidencias * 0.05);

      let computedLevel: 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE' = 'BRONCE';
      let accentColor = 'from-amber-600 to-amber-800';
      let badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';

      if (finalScore >= 92) {
        computedLevel = 'DIAMANTE';
        accentColor = 'from-indigo-400 to-cyan-400';
        badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      } else if (finalScore >= 85) {
        computedLevel = 'ORO';
        accentColor = 'from-yellow-400 to-amber-500';
        badgeBg = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      } else if (finalScore >= 75) {
        computedLevel = 'PLATA';
        accentColor = 'from-slate-400 to-slate-500';
        badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
      }

      return {
        ...driver,
        metrics: { cumplimiento, puntualidad, valoracion, experiencia, incidencias, finalScore },
        computedLevel,
        accentColor,
        badgeBg
      };
    }).sort((a, b) => b.metrics.finalScore - a.metrics.finalScore);
  }, [drivers]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
        <div>
          <span className="px-3 py-1 bg-black text-white font-black text-[8px] uppercase tracking-[0.2em] rounded-md">
            Capítulo 6
          </span>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mt-4">
            Sistema de <span className="text-plus-blue">Reputación</span>
          </h2>
          <p className="text-slate-400 mt-4 text-xl font-medium italic">Scoring logístico multivariable para asignar prioridad de viajes</p>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs font-semibold w-full md:w-auto">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Fórmula del Algoritmo</p>
          <div className="space-y-2">
             <div className="flex justify-between gap-4"><span className="text-slate-500">Cumplimiento</span> <span className="font-black">40%</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">Puntualidad</span> <span className="font-black">25%</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">Valoración</span> <span className="font-black">20%</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">Experiencia</span> <span className="font-black">10%</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">Control Incidencias</span> <span className="font-black">5%</span></div>
          </div>
        </div>
      </header>

      {reputationData.length === 0 ? (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
          <BrandIllustration title="Sin Repartidores" message="No existen movimientos" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {reputationData.map(driver => (
          <div key={driver.id} className="bg-white p-8 lg:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-black/5 transition-colors">
             
             {/* Gradient Accent Bar */}
             <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${driver.accentColor}`}></div>

             <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                <div className="flex items-center gap-5">
                   <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${driver.accentColor} rounded-full blur-md opacity-20`}></div>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.nombre}`} className="w-20 h-20 rounded-full bg-slate-50 relative z-10 border-2 border-white shadow-sm" alt={driver.nombre} />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${driver.accentColor} border-2 border-white shadow-md z-20`}>
                        <Shield size={14} />
                      </div>
                   </div>
                   <div>
                      <h4 className="text-2xl font-black tracking-tight uppercase italic">{driver.nombre}</h4>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border mt-2 text-[9px] font-black uppercase tracking-widest ${driver.badgeBg}`}>
                        <TrendingUp size={10} /> {driver.computedLevel}
                      </div>
                   </div>
                </div>
                
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score Global</p>
                   <p className="text-5xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-black to-slate-500">
                     {driver.metrics.finalScore.toFixed(1)}
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                   <div className="flex items-center gap-2 mb-3">
                      <Award size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Cumplim.</span>
                   </div>
                   <p className="text-lg font-black">{driver.metrics.cumplimiento.toFixed(0)} <span className="text-xs text-slate-400 font-medium">/ 100</span></p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                   <div className="flex items-center gap-2 mb-3">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Puntual.</span>
                   </div>
                   <p className="text-lg font-black">{driver.metrics.puntualidad.toFixed(0)} <span className="text-xs text-slate-400 font-medium">/ 100</span></p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                   <div className="flex items-center gap-2 mb-3">
                      <Star size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Valorac.</span>
                   </div>
                   <p className="text-lg font-black">{driver.metrics.valoracion.toFixed(0)} <span className="text-xs text-slate-400 font-medium">/ 100</span></p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                   <div className="flex items-center gap-2 mb-3">
                      <Activity size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Exper.</span>
                   </div>
                   <p className="text-lg font-black">{driver.metrics.experiencia.toFixed(0)} <span className="text-xs text-slate-400 font-medium">/ 100</span></p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
                   <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Incidenc.</span>
                   </div>
                   <p className="text-lg font-black">{driver.metrics.incidencias.toFixed(0)} <span className="text-xs text-slate-400 font-medium">/ 100</span></p>
                </div>
             </div>

          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default DriverReputationView;

