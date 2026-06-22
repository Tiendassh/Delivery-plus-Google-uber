import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { SocioRepartidor, Comercio } from '../types';
import InteractiveMap from './InteractiveMap';
import { notificationService } from '../services/notificationService';
import VendedorIAChat from './VendedorIAChat';

interface ContractedShift {
  id: string;
  storeName: string;
  driverName: string;
  hours: number;
  price: number;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  lat: number;
  lng: number;
  driverLat: number;
  driverLng: number;
}

import { voiceService } from '../services/voiceService';

const ComerciosTurnosView: React.FC = () => {
  const [stores, setStores] = useState<Comercio[]>([]);
  const [drivers, setDrivers] = useState<SocioRepartidor[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | number>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | number>('');
  const [hours, setHours] = useState<4 | 8>(4);
  const [shiftTime, setShiftTime] = useState<string>('MAÑANA (08:00 - 12:00)');
  const [contractedShifts, setContractedShifts] = useState<ContractedShift[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showIaChat, setShowIaChat] = useState<boolean>(false);
  const [narratorVoice, setNarratorVoice] = useState<'valentina' | 'mateo'>('valentina');

  useEffect(() => {
    const fetchData = async () => {
      const s = await mockApi.getStores();
      const d = await mockApi.getDrivers();
      setStores(s);
      setDrivers(d.filter(rider => rider.etapaIngreso === 'ACTIVO'));

      // Settea selecciones por defecto si hay items disponibles
      if (s.length > 0) setSelectedStoreId(s[0].id);
      if (d.length > 0) setSelectedDriverId(d[0].id);

      // Cargar turnos contratados desde localStorage para persistencia
      const stored = localStorage.getItem('dp_contracted_shifts');
      if (stored) {
        setContractedShifts(JSON.parse(stored));
      } else {
        // Mock inicial de un turno activo
        const initialMock: ContractedShift[] = [
          {
            id: 'SHIFT-101',
            storeName: s[0]?.nombre || 'Ferretería Central',
            driverName: d[0]?.nombre || 'Ramiro Tech',
            hours: 8,
            price: 24000,
            date: new Date().toLocaleDateString('es-AR'),
            status: 'ACTIVE',
            lat: -27.368,
            lng: -55.895,
            driverLat: -27.368,
            driverLng: -55.895
          }
        ];
        setContractedShifts(initialMock);
        localStorage.setItem('dp_contracted_shifts', JSON.stringify(initialMock));
      }
    };
    fetchData();
  }, []);

  const priceCalculation = hours === 4 ? 14000 : 25000;

  const handleContractShift = async () => {
    if (!selectedStoreId || !selectedDriverId) {
      alert('Por favor selecciona un comercio y un driver.');
      return;
    }

    setLoading(true);
    notificationService.playAlert('info');

    const storeObj = stores.find(s => String(s.id) === String(selectedStoreId));
    const driverObj = drivers.find(d => String(d.id) === String(selectedDriverId));

    if (!storeObj || !driverObj) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const newShift: ContractedShift = {
        id: `SHIFT-${Math.floor(100 + Math.random() * 900)}`,
        storeName: storeObj.nombre,
        driverName: driverObj.nombre,
        hours,
        price: priceCalculation,
        date: new Date().toLocaleDateString('es-AR'),
        status: 'ACTIVE',
        lat: storeObj.lat || -27.368,
        lng: storeObj.lng || -55.895,
        driverLat: storeObj.lat || -27.368,
        driverLng: storeObj.lng || -55.895
      };

      const updated = [newShift, ...contractedShifts];
      setContractedShifts(updated);
      localStorage.setItem('dp_contracted_shifts', JSON.stringify(updated));

       // Agregar transacción en mockApi
       mockApi.addTransaction({
         monto: -priceCalculation,
         tipo: 'VENTA_TURNO',
         detalle: `Contrato de turno (${hours}hs) para ${storeObj.nombre}`
       });

      const confirmText = `¡Listo, mirá! Contrataste la cobertura exclusiva de ${hours} horas para ${storeObj.nombre}. El repartidor ${driverObj.nombre} ya quedó asignado a tu local.`;
      voiceService.speak(confirmText, narratorVoice);

      notificationService.notify(
        "Turno Contratado Exitosamente",
        `El chofer ${driverObj.nombre} quedará asignado al comercio durante su turno.`
      );

      setLoading(false);
    }, 1500);
  };

  const activeShiftMarkers = contractedShifts
    .filter(s => s.status === 'ACTIVE')
    .map(s => {
      // Retornar un simulador de repartidor asignado de forma fija a ese comercio
      return {
        id: `SHIFT-D-${s.id}`,
        nombre: `${s.driverName} (Asignado)`,
        vehiculo: 'Moto',
        patente: 'Fijo',
        calificacion: 5,
        nivel: 'DIAMANTE' as const,
        latitud: s.driverLat,
        longitud: s.driverLng,
        etapaIngreso: 'ACTIVO' as const
      };
    });

  const activeStoreMarkers = contractedShifts
    .filter(s => s.status === 'ACTIVE')
    .map(s => {
      return {
        id: `SHIFT-S-${s.id}`,
        nombre: s.storeName,
        categoria: 'Comida',
        estado: 'ACTIVO' as const,
        lat: s.lat,
        lng: s.lng
      };
    });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Header */}
      <div className="bg-[#0A0A0B] p-12 rounded-[4rem] text-white border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-plus-blue rounded-full animate-pulse shadow-[0_0_10px_#2563EB]"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-plus-blue italic">Módulo Corporativo • Turnos Completos</p>
            </div>
            <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
              Turnos <span className="text-plus-blue">Exclusivos</span>
            </h2>
            <p className="text-slate-400 mt-4 text-sm max-w-xl font-medium">
              Contrata repartidores de forma exclusiva por bloques de 4 u 8 horas para tu comercio. Cubre tus picos de demanda con un costo fijo asegurado e indicaciones de voz con acento es-AR.
            </p>
          </div>
          <div className="bg-white/5 px-8 py-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <div>
              <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1 font-bold">Precio Por Bloque</p>
              <p className="text-xl font-black text-plus-blue italic">$14.000 / $25.000</p>
            </div>
            <div className="border-t border-white/10 pt-2 flex items-center justify-between gap-4">
              <span className="text-[8px] text-white/40 uppercase font-black">Voz Narrador:</span>
              <select
                value={narratorVoice}
                onChange={(e) => setNarratorVoice(e.target.value as any)}
                className="bg-black text-white text-[9px] border-none font-bold outline-none cursor-pointer rounded-lg p-1 uppercase"
              >
                <option value="carlos">Carlos 🗣️</option>
                <option value="agustina">Agustina 🗣️</option>
                <option value="vendedor_bot">Bot 🗣️</option>
              </select>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.02] font-black pointer-events-none italic">4HS</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Panel Izquierdo: Formulario de Contratación */}
        <div className="lg:col-span-5 bg-white p-10 md:p-12 rounded-[5rem] border border-black/5 shadow-2xl space-y-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2.5xl font-black italic uppercase tracking-tighter border-b border-black/5 pb-4 mb-6">
              Nueva Contratación
            </h3>

            <div className="space-y-6">
              
              {/* Seleccionar Comercio */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Seleccionar Comercio</label>
                <select 
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full bg-transparent border-none text-base font-bold text-black focus:ring-0 focus:outline-none"
                >
                  {stores.length > 0 ? (
                    stores.map(st => (
                      <option key={st.id} value={st.id}>{st.nombre}</option>
                    ))
                  ) : (
                    <option value="">Cargando comercios...</option>
                  )}
                </select>
              </div>

              {/* Horas del Turno */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Duración del Turno</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setHours(4); setShiftTime('MAÑANA (08:00 - 12:00)'); }}
                    className={`py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${hours === 4 ? 'bg-black text-white' : 'bg-white text-black border border-black/5'}`}
                  >
                    4 Horas (Media)
                  </button>
                  <button 
                    onClick={() => { setHours(8); setShiftTime('COMPLETO (12:00 - 20:00)'); }}
                    className={`py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${hours === 8 ? 'bg-black text-white' : 'bg-white text-black border border-black/5'}`}
                  >
                    8 Horas (Completo)
                  </button>
                </div>
              </div>

              {/* Margen de Horario */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block font-bold">Bloque Horario Disponible</label>
                <p className="text-sm font-black italic text-plus-blue uppercase">{shiftTime}</p>
              </div>

              {/* Asignar Driver */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Seleccionar Chofer Disponible</label>
                <select 
                  value={selectedDriverId} 
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-transparent border-none text-base font-bold text-black focus:ring-0 focus:outline-none"
                >
                  {drivers.map(drv => (
                    <option key={drv.id} value={drv.id}>{drv.nombre} ({drv.vehiculo})</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          <div className="pt-8 border-t border-black/5 mt-8">
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total a Cotizar:</span>
              <span className="text-3xl font-black text-black italic">${priceCalculation.toLocaleString('es-AR')}</span>
            </div>
            
            <button 
              onClick={handleContractShift}
              disabled={loading}
              className="w-full bg-plus-blue text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-700 transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] disabled:opacity-50"
            >
              {loading ? 'Confirmando Enlace...' : 'Contratar Turno Completo'}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Mapa en Vivo + Turnos Contratados */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          
          {/* Mapa Interactivo con Filtros Especiales para Turnos */}
          <div className="bg-white p-6 rounded-[5rem] border border-black/5 shadow-2xl overflow-hidden h-[450px] relative">
            <div className="absolute top-10 right-10 z-20 bg-black/80 px-4 py-2 rounded-xl text-white text-[8px] font-black tracking-widest uppercase">
              REPARTIDORES EXCLUSIVOS ACTIVOS
            </div>
            <InteractiveMap 
              center="-27.368,-55.895"
              stores={activeStoreMarkers as any}
              drivers={activeShiftMarkers as any}
              className="w-full h-full rounded-[4.2rem]"
              showRiskZones={false}
            />
          </div>

          {/* Listado de Turnos Contratados Actuales */}
          <div className="bg-white p-10 rounded-[5rem] border border-black/5 shadow-2xl flex-1">
            <h4 className="text-xl font-black italic uppercase tracking-widest mb-6 text-black">
              Contratos Vigentes ({contractedShifts.length})
            </h4>
            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
              {contractedShifts.map((sh, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-black/5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-plus-blue/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-plus-blue/10 text-plus-blue font-black text-[7px] uppercase tracking-widest rounded-full">
                        {sh.id}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{sh.date}</span>
                    </div>
                    <p className="text-sm font-black uppercase text-gray-900">{sh.storeName}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Asignado: {sh.driverName} ({sh.hours} Horas)</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-lg font-black italic text-gray-900">${sh.price.toLocaleString()}</p>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                        ● Cobertura Activa
                      </span>
                    </div>
                    <button
                      onClick={() => voiceService.speak(`Contrato de turno ${sh.id} para ${sh.storeName} por ${sh.hours} horas con el chofer ${sh.driverName}.`, narratorVoice)}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs shadow-sm active:scale-90 transition-all"
                      title="Escuchar detalles del turno..."
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
              {contractedShifts.length === 0 && (
                <p className="text-center py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Sin turnos vigentes contratados
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Sección del Vendedor IA Integrada (Chat de Texto y Voz) */}
      <div className="border-t border-black/5 pt-12">
        <div className="bg-[#050505] p-10 md:p-12 rounded-[4rem] border border-white/5 shadow-2xl text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="px-3 py-1 bg-plus-blue/15 text-plus-blue font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-plus-blue/10">
                PROBAR VOCES Y NEGOCIAR EN VIVO
              </span>
              <h3 className="text-3xl font-black italic uppercase italic tracking-tight mt-3">
                ¿Querés probar las voces del Vendedor IA? 🎙️
              </h3>
              <p className="text-white/40 text-xs font-semibold mt-2 max-w-xl leading-relaxed">
                Desplegá el chat interactivo para negociar fletes o entablar una conversación fluida con Carlos, Agustina o el robot con acento argentino es-AR nativo, tanto escribiendo como enviando tu audio de voz.
              </p>
            </div>
            <button
              onClick={() => setShowIaChat(!showIaChat)}
              className="px-8 py-4 bg-plus-blue hover:bg-blue-600 font-black text-[10px] uppercase tracking-wider text-white rounded-2xl transition-all shadow-lg active:scale-95"
            >
              {showIaChat ? 'Ocultar Chat de Voces' : 'Abrir Chat de Voces [es-AR]'}
            </button>
          </div>
        </div>

        {showIaChat && (
          <div className="animate-in slide-in-from-bottom duration-500">
            <VendedorIAChat />
          </div>
        )}
      </div>

    </div>
  );
};

export default ComerciosTurnosView;
