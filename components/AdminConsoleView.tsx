import React, { useState } from 'react';
import { SocioRepartidor, Pedido, EstadoPedido } from '../types';
import InteractiveMap from './InteractiveMap';

interface AdminConsoleProps {
  pedidos: Pedido[];
  repartidores: SocioRepartidor[];
  onUpdateStatus: (orderId: any, status: EstadoPedido) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleProps> = ({ pedidos, repartidores, onUpdateStatus }) => {
  // Regional settings
  const [activeRegion, setActiveRegion] = useState<string>('MISIONES');
  const [regions, setRegions] = useState([
    { id: 'MISIONES', nombre: 'Misiones (Posadas)', status: 'OPERATIVO', hubs: 3, delayMin: 12 },
    { id: 'BUENOS_AIRES', nombre: 'Buenos Aires (CABA)', status: 'ALTA_DEMANDA', hubs: 14, delayMin: 22 },
    { id: 'CORDOBA', nombre: 'Córdoba (Capital)', status: 'OPERATIVO', hubs: 5, delayMin: 15 },
    { id: 'ROSARIO', nombre: 'Rosario (Santa Fe)', status: 'CLIMA_ADVERSO', hubs: 4, delayMin: 28 },
  ]);

  // Commissions management
  const [baseTariff, setBaseTariff] = useState<number>(2500);
  const [pricePerKm, setPricePerKm] = useState<number>(650);
  const [rainSurge, setRainSurge] = useState<number>(30); // % percentage
  const [nightSurge, setNightSurge] = useState<number>(15); // % percentage
  const [commissionSaved, setCommissionSaved] = useState<boolean>(false);

  // Wallets management
  const [wallets, setWallets] = useState([
    { id: 'W1', holder: 'Carlos Giménez (Chofer)', type: 'REPARTIDOR', balance: 48500, pendingCashout: 12000, status: 'PENDIENTE' },
    { id: 'W2', holder: 'María Agustina Ramos (Chofer)', type: 'REPARTIDOR', balance: 74200, pendingCashout: 25000, status: 'PENDIENTE' },
    { id: 'W3', holder: 'Pizzería La Estación', type: 'COMERCIO', balance: -4500, pendingCashout: 0, status: 'AL_DIA' },
    { id: 'W4', holder: 'La Trattoria Posadas', type: 'COMERCIO', balance: 112000, pendingCashout: 0, status: 'AL_DIA' },
  ]);

  // Incidents management
  const [incidents, setIncidents] = useState([
    { id: 'INC-702', orderId: '#6412', driver: 'Carlos Giménez', desc: 'Pinchadura de rueda trasera en Av. Costanera', severity: 'ALTA', status: 'CRIADO' },
    { id: 'INC-703', orderId: '#6415', driver: 'Agustin S.', desc: 'Demora prolongada en local comercial de comidas', severity: 'MEDIA', status: 'CRIADO' },
    { id: 'INC-704', orderId: '#6419', driver: 'Mariano K.', desc: 'Dirección del cliente no aparece en mapa principal', severity: 'BAJA', status: 'RESUELTO' },
  ]);

  // Special hours config
  const [isHolidayMode, setIsHolidayMode] = useState<boolean>(false);
  const [peakSurgeEnabled, setPeakSurgeEnabled] = useState<boolean>(true);
  const [specialCurfewHour, setSpecialCurfewHour] = useState<string>('23:00 - 05:00');

  const handleSaveCommissions = () => {
    setCommissionSaved(true);
    setTimeout(() => setCommissionSaved(false), 3000);
  };

  const approveWithdrawal = (walletId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        return { ...w, balance: w.balance - w.pendingCashout, pendingCashout: 0, status: 'APROBADO' };
      }
      return w;
    }));
  };

  const addCredit = (walletId: string, amount: number) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    }));
  };

  const resolveIncident = (incId: string, action: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incId) {
        return { ...inc, status: 'RESUELTO', desc: `${inc.desc} (Solución: ${action})` };
      }
      return inc;
    }));
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="px-3 py-1 bg-plus-blue/15 text-plus-blue font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-plus-blue/10">
            Nivel de Red: Central Nacional
          </span>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-3">
            Consola <span className="text-plus-blue">Administrador</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Supervisión nacional, optimización de algoritmos de fletes y control operacional de Delivery Plus.
          </p>
        </div>

        {/* Regional Selector */}
        <div className="flex bg-slate-100 p-2 rounded-[2.5rem] border border-black/5">
          {regions.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRegion(r.id)}
              className={`px-5 py-3 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all ${
                activeRegion === r.id ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'
              }`}
            >
              {r.id.split('_').join(' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Grid: 1. Visualización Nacional / 2. Horarios Especiales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visualización Nacional & Status */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black italic uppercase">Visualización Nacional Operativa</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
              ● Red Conectada
            </span>
          </div>

          {/* Hubs Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-black/5">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Hubs Nacionales</p>
              <p className="text-3xl font-black italic mt-2 text-black">26</p>
              <p className="text-[8px] font-bold text-slate-500 mt-1">4 Provincias Activas</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-black/5">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Demanda Promedio</p>
              <p className="text-3xl font-black italic mt-2 text-plus-blue">84%</p>
              <p className="text-[8px] font-bold text-emerald-500 mt-1">Crecimiento Sostenido</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-black/5">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Tasa De Entrega</p>
              <p className="text-3xl font-black italic mt-2 text-black">99.2%</p>
              <p className="text-[8px] font-bold text-slate-500 mt-1">Meta mensual superada</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-black/5">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Tiempo Promedio</p>
              <p className="text-3xl font-black italic mt-2 text-amber-500">22 min</p>
              <p className="text-[8px] font-bold text-slate-500 mt-1">Eficiencia IA activa</p>
            </div>
          </div>

          {/* Regional Details Card */}
          <div className="bg-[#0A0A0B] text-white p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Región Seleccionada</p>
              <p className="text-3xl font-black italic uppercase tracking-tight mt-1">
                {regions.find(r => r.id === activeRegion)?.nombre}
              </p>
              <div className="flex gap-4 mt-2 text-white/60 text-xs font-semibold">
                <span>Hubs Operativos: {regions.find(r => r.id === activeRegion)?.hubs}</span>
                <span>•</span>
                <span>Demora Estimada: {regions.find(r => r.id === activeRegion)?.delayMin}min</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Estado del Clúster</span>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                regions.find(r => r.id === activeRegion)?.status === 'OPERATIVO' ? 'bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' :
                regions.find(r => r.id === activeRegion)?.status === 'ALTA_DEMANDA' ? 'bg-amber-500 text-white shadow-[0_10px_20px_rgba(245,158,11,0.3)]' :
                'bg-red-500 text-white shadow-[0_10px_20px_rgba(239,68,68,0.3)]'
              }`}>
                {regions.find(r => r.id === activeRegion)?.status.split('_').join(' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Configuración de Horarios Especiales */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-8 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⏳</span>
              <h3 className="text-2xl font-black italic uppercase">Horarios Especiales</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-8">
              Configure la tasa de nocturnidad, recargos especiales de fin de semana o configure el modo feriado para optimizar la rentabilidad de la red.
            </p>

            <div className="space-y-6">
              {/* Holiday Toggle */}
              <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-black/5">
                <div>
                  <p className="text-xs font-black uppercase text-black leading-none">Modo Feriado Activo</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Aplica +35% de tarifa base</p>
                </div>
                <button
                  onClick={() => setIsHolidayMode(!isHolidayMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isHolidayMode ? 'bg-plus-blue' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isHolidayMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Peak surge Toggle */}
              <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-black/5">
                <div>
                  <p className="text-xs font-black uppercase text-black leading-none">Dynamic Peak Surge (I.A.)</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Auto-recargos en alta congestión</p>
                </div>
                <button
                  onClick={() => setPeakSurgeEnabled(!peakSurgeEnabled)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${peakSurgeEnabled ? 'bg-plus-blue' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${peakSurgeEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Curfew Hour Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Franja Rango Nocturno Extra</label>
                <input
                  type="text"
                  value={specialCurfewHour}
                  onChange={(e) => setSpecialCurfewHour(e.target.value)}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue text-black"
                />
              </div>
            </div>
          </div>

          <button className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all mt-6 shadow-md">
            Guardar Configuración Horaria
          </button>
        </div>

      </div>

      {/* Real-time Logistics Map */}
      <div className="bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-black italic uppercase">Mapa Operativo en Tiempo Real</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Seguimiento vivo de los móviles asignados en {regions.find(r => r.id === activeRegion)?.nombre}.</p>
        </div>
        
        <div className="h-[450px] rounded-[3rem] overflow-hidden border border-black/5 relative shadow-inner">
          <InteractiveMap 
            center="-27.368,-55.895"
            stores={[]}
            drivers={repartidores}
            className="w-full h-full"
            showRiskZones={true}
          />
        </div>
      </div>

      {/* Grid: 3. Gestión de Comisiones / 4. Incidencias */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gestión de Comisiones */}
        <div className="lg:col-span-6 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black italic uppercase">Algoritmo de Tarifa y Comisión</h3>
              {commissionSaved && (
                <span className="text-[8px] bg-emerald-100 text-emerald-800 border-emerald-200 border px-3 py-1 rounded-md font-black uppercase tracking-widest animate-pulse">
                  ¡Valores Actualizados!
                </span>
              )}
            </div>

            <div className="space-y-8">
              {/* Tarifa Base */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Tarifa Base de Arranque</span>
                  <span className="text-plus-blue">${baseTariff} ARS</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="100"
                  value={baseTariff}
                  onChange={(e) => setBaseTariff(Number(e.target.value))}
                  className="w-full accent-plus-blue cursor-pointer"
                />
              </div>

              {/* Precio por km */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Adicional por Kilómetro Recorrido</span>
                  <span className="text-plus-blue">${pricePerKm} / km</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(Number(e.target.value))}
                  className="w-full accent-plus-blue cursor-pointer"
                />
              </div>

              {/* Rain surge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Adicional Clima Adverso (Pilot rain boost)</span>
                  <span className="text-plus-blue">+{rainSurge}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rainSurge}
                  onChange={(e) => setRainSurge(Number(e.target.value))}
                  className="w-full accent-plus-blue cursor-pointer"
                />
              </div>

              {/* Night surge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Plus Nocturnidad (Aplica fin de semana)</span>
                  <span className="text-plus-blue">+{nightSurge}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={nightSurge}
                  onChange={(e) => setNightSurge(Number(e.target.value))}
                  className="w-full accent-plus-blue cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveCommissions}
            className="w-full py-5 bg-plus-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] mt-6"
          >
            Sincronizar Algoritmo de Tarifas
          </button>
        </div>

        {/* Gestión de Incidencias */}
        <div className="lg:col-span-6 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase mb-2">Canal de Incidencias Operativas</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">Móviles demorados, desperfectos de tráfico o accidentes reportados.</p>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
              {incidents.map(inc => (
                <div 
                  key={inc.id}
                  className={`p-6 rounded-3xl border ${inc.status === 'RESUELTO' ? 'bg-slate-50 border-black/5 opacity-60' : 'bg-red-50/40 border-red-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${inc.status === 'RESUELTO' ? 'bg-slate-400' : 'bg-red-500 animate-pulse'}`}></span>
                      <span className="text-xs font-black text-black">{inc.id} (Ref {inc.orderId})</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      inc.severity === 'ALTA' ? 'bg-red-100 text-red-700' : 
                      inc.severity === 'MEDIA' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>{inc.severity}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold mb-1">Chofer: {inc.driver}</p>
                  <p className="text-xs text-slate-500 font-medium mb-4">{inc.desc}</p>
                  
                  {inc.status === 'CRIADO' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => resolveIncident(inc.id, 'Chofer de respaldo asignado')}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-black transition-all"
                      >
                        Reasignar Respaldo
                      </button>
                      <button 
                        onClick={() => resolveIncident(inc.id, 'Exención de cargo aprobada')}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-all"
                      >
                        Eximir Cargo
                      </button>
                      <button 
                        onClick={() => resolveIncident(inc.id, 'Confirmado solucionado por el chofer')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all ml-auto"
                      >
                        Solucionar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Gestión de Billeteras */}
      <div className="bg-[#050505] text-white p-10 md:p-12 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col gap-6">
        <div>
          <span className="px-3 py-1 bg-plus-blue/15 text-plus-blue font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-plus-blue/10">
            FINANZAS GLOBAL DE LA PLATAFORMA
          </span>
          <h3 className="text-3xl font-black italic uppercase italic tracking-tight mt-3">
            Gestión Central de Billeteras
          </h3>
          <p className="text-white/40 text-xs font-semibold mt-2">
            Aprobación de transferencias de trabajadores locales y cobro de deudas de comercios adheridos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {wallets.map(w => (
            <div key={w.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[7.5px] font-black text-white/30 uppercase tracking-widest">{w.type}</span>
                  <h4 className="text-lg font-black italic mt-1">{w.holder}</h4>
                  <p className="text-xs text-white/60 mt-1 font-semibold">Balance: ${w.balance.toLocaleString('es-AR')}</p>
                </div>
                {w.pendingCashout > 0 && w.status === 'PENDIENTE' && (
                  <div className="text-right">
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded font-black uppercase">
                      RETIRO SOLICITADO
                    </span>
                    <p className="text-lg font-black text-amber-500 mt-2">${w.pendingCashout.toLocaleString('es-AR')}</p>
                  </div>
                )}
                {w.status === 'APROBADO' && (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded font-black uppercase">
                    PAGO ENVIADO
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {w.pendingCashout > 0 && w.status === 'PENDIENTE' && (
                  <button 
                    onClick={() => approveWithdrawal(w.id)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md"
                  >
                    Aprobar Transferencia BanCO
                  </button>
                )}
                <button 
                  onClick={() => addCredit(w.id, 5000)}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                >
                  Inyectar $5.000
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
