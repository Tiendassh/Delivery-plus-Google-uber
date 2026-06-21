import React, { useMemo } from 'react';
import { SocioRepartidor } from '../types';
import { Crown, Star, Clock, PackageCheck, TrendingUp, Medal, AlertCircle } from 'lucide-react';

interface EmployeeOfTheMonthViewProps {
  drivers: SocioRepartidor[];
}

export const EmployeeOfTheMonthView: React.FC<EmployeeOfTheMonthViewProps> = ({ drivers }) => {
  const rankedDrivers = useMemo(() => {
    return drivers.map((driver, index) => {
      const baseSeed = (typeof driver.id === 'number' ? driver.id : index) * 13;
      const cumplimiento = 80 + (baseSeed % 20);
      const puntualidad = 75 + (baseSeed % 25);
      const valoracion = (driver.calificacion / 5) * 100;
      const experiencia = Math.min(100, 50 + (driver.gananciasSemanales / 1000) * 5);
      const incidencias = 100 - (baseSeed % 15);
      const finalScore = (cumplimiento * 0.40) + (puntualidad * 0.25) + (valoracion * 0.20) + (experiencia * 0.10) + (incidencias * 0.05);

      let computedLevel: 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE' = 'BRONCE';
      let accentColor = 'from-amber-600 to-amber-800';
      let shadowColor = 'shadow-amber-500/20';
      let textAccent = 'text-amber-700';

      if (finalScore >= 92) { 
        computedLevel = 'DIAMANTE'; 
        accentColor = 'from-indigo-400 to-cyan-400'; 
        shadowColor = 'shadow-cyan-500/30';
        textAccent = 'text-cyan-700';
      } 
      else if (finalScore >= 85) { 
        computedLevel = 'ORO'; 
        accentColor = 'from-yellow-400 to-amber-500'; 
        shadowColor = 'shadow-yellow-500/30';
        textAccent = 'text-yellow-700';
      } 
      else if (finalScore >= 75) { 
        computedLevel = 'PLATA'; 
        accentColor = 'from-slate-300 to-slate-400'; 
        shadowColor = 'shadow-slate-400/20';
        textAccent = 'text-slate-600';
      }

      // Mock entregas based on score/experience to make it realistic
      const entregasRealizadas = Math.floor(experiencia * 3.5) + (baseSeed % 150) + 120;

      return {
        ...driver,
        metrics: { puntualidad, finalScore, entregasRealizadas },
        computedLevel,
        accentColor,
        shadowColor,
        textAccent
      };
    }).sort((a, b) => b.metrics.finalScore - a.metrics.finalScore);
  }, [drivers]);

  if (rankedDrivers.length === 0) return null;

  const topDriver = rankedDrivers[0];
  const otherDrivers = rankedDrivers.slice(1, 5); // Top 5 total

  return (
    <div className="bg-white p-10 lg:p-14 rounded-[4rem] border border-slate-100 shadow-xl space-y-12 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-300/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-yellow-200">
            Capítulo 7 • Salón de la Fama
          </span>
          <h3 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none mt-4 uppercase italic">
            Empleado del <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">Mes</span>
          </h3>
          <p className="text-slate-400 mt-3 text-lg font-bold italic">
            Ranking público de excelencia. <span className="text-slate-600">Los mejores perfiles acceden a tarifas premium.</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Número 1 - Destacado */}
        <div className="lg:col-span-5 relative group perspective">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-[3rem] transform rotate-1 scale-[1.02] opacity-20 transition-transform group-hover:rotate-2"></div>
          
          <div className="bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] relative z-10 text-white shadow-2xl overflow-hidden flex flex-col items-center text-center h-full border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600"></div>
            
            <div className="absolute top-6 right-6 text-yellow-400 flex flex-col items-center animate-pulse">
              <Crown size={32} />
              <span className="text-[10px] font-black tracking-widest uppercase mt-1">Nº 1</span>
            </div>

            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl opacity-20"></div>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topDriver.nombre}`} 
                className="w-40 h-40 rounded-full bg-slate-800 border-4 border-yellow-400 relative z-10 shadow-2xl" 
                alt={topDriver.nombre} 
              />
              <div className="absolute -bottom-4 right-0 flex items-center justify-center p-2 bg-slate-900 rounded-full border-2 border-yellow-400 shadow-xl z-20">
                 <Medal className="text-yellow-400" size={24} />
              </div>
            </div>

            <h4 className="text-4xl font-black tracking-tighter italic uppercase">{topDriver.nombre}</h4>
            
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-[10px] font-black uppercase tracking-widest ${topDriver.computedLevel === 'DIAMANTE' ? 'text-cyan-300' : 'text-yellow-400'}`}>
              <TrendingUp size={12} /> Nivel {topDriver.computedLevel}
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mt-auto pt-10">
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <Star size={16} className="text-yellow-400 mb-2" />
                <span className="text-2xl font-black leading-none">{topDriver.calificacion.toFixed(1)}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estrellas</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <PackageCheck size={16} className="text-emerald-400 mb-2" />
                <span className="text-2xl font-black leading-none">{topDriver.metrics.entregasRealizadas}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Entregas</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <Clock size={16} className="text-blue-400 mb-2" />
                <span className="text-2xl font-black leading-none">{topDriver.metrics.puntualidad.toFixed(0)}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Puntual</span>
              </div>
            </div>

            <div className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 text-[9px] font-black uppercase tracking-widest">
              ✨ Acceso a Tarifas Premium Desbloqueado ✨
            </div>
          </div>
        </div>

        {/* Top 2 al 5 */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Siguientes en el Top 5</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="space-y-4">
            {otherDrivers.map((driver, idx) => (
              <div key={driver.id} className={`flex items-center p-5 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${driver.accentColor}`}></div>
                
                <div className="w-10 text-center font-black text-2xl italic text-slate-300 group-hover:text-black transition-colors">
                  #{idx + 2}
                </div>

                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.nombre}`} 
                  className={`w-14 h-14 rounded-full bg-slate-50 border-2 border-white shadow-md mx-4`} 
                  alt={driver.nombre} 
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-lg font-black uppercase italic tracking-tight">{driver.nombre}</h5>
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-50 border ${driver.textAccent}`}>
                      {driver.computedLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Star size={12} className="text-amber-400" /> {driver.calificacion.toFixed(1)}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      <PackageCheck size={12} className="text-emerald-500" /> {driver.metrics.entregasRealizadas}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Clock size={12} className="text-blue-500" /> {driver.metrics.puntualidad.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end pl-4 border-l border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score Global</span>
                   <span className="text-2xl font-black italic">{driver.metrics.finalScore.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-2xl flex items-start gap-4 border border-blue-100">
             <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
             <p className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">
               Los repartidores en los niveles Diamante y Oro reciben un multiplicador en su tarifa base por kilómetro. Mantené tu puntualidad y valoración altas para escalar en el ranking.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};
