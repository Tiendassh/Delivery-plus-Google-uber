import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SocioRepartidor, Pedido, EstadoPedido } from '../types';

interface RepartidorConsoleProps {
  pedidos: Pedido[];
  repartidor: SocioRepartidor;
  onAcceptOrder: (orderId: any) => void;
  onAcceptShift: (shiftName: string, store: string, duration: number) => void;
}

export const RepartidorConsoleView: React.FC<RepartidorConsoleProps> = ({ 
  pedidos, 
  repartidor, 
  onAcceptOrder, 
  onAcceptShift 
}) => {
  // Main settings / state
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [vehicle, setVehicle] = useState<string>(repartidor.vehiculo || 'Moto de Reparto');
  const [plate, setPlate] = useState<string>(repartidor.patente || 'A023BC4');
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  // IA recommendations state
  const [iaRecommendation, setIaRecommendation] = useState<string>(
    'Che che, cargá tu cel y prepará el casco. Hacé clic en "Generar Recomendación Operativa IA" para que estudie el clima de hoy y te diga dónde están los fletes más jugosos.'
  );
  const [iaLoading, setIaLoading] = useState<boolean>(false);

  // Available job listings (simulation)
  const [availableJobs, setAvailableJobs] = useState([
    { id: 'JOB-901', store: 'Rotisería Lo de Coco', type: 'ENVIO_COMIDA', payout: 3800, dist: '1.2 km', desc: 'Hamburguesa Gigante con Papas' },
    { id: 'JOB-902', store: 'Distribuidora San Ignacio', type: 'ENVIO_PAQUETERIA', payout: 7500, dist: '4.8 km', desc: 'Bulto mediano de mercadería' },
    { id: 'JOB-903', store: 'Farmacia de la Costa', type: 'ENVIO_PAQUETERIA', payout: 4200, dist: '2.5 km', desc: 'Medicamentos urgentes' },
  ]);

  // Available Shifts
  const [availableShifts, setAvailableShifts] = useState([
    { id: 'SH-501', store: 'Heladerías Duomo', hours: 4, pay: 14000, time: 'Tarde (14:00 - 18:00)', date: 'Hoy' },
    { id: 'SH-502', store: 'Ferretería El Bulón', hours: 8, pay: 25000, time: 'Completo (09:00 - 17:00)', date: 'Mañana' },
    { id: 'SH-503', store: 'Panadería Trigo Dorado', hours: 4, pay: 14000, time: 'Mañana (08:00 - 12:00)', date: 'Mañana' },
  ]);

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(repartidor.gananciasSemanales || 28400);
  const [withdrawalPending, setWithdrawalPending] = useState<boolean>(false);
  const [withdrawalToast, setWithdrawalToast] = useState<boolean>(false);

  // Driver ranking board (Stars of the Month)
  const rankingList = [
    { pos: 1, name: 'Esteban "Rayo" Silva', points: 4850, Deliveries: 142, rating: 4.98 },
    { pos: 2, name: 'Facundo Rossi', points: 4200, Deliveries: 120, rating: 4.95 },
    { pos: 3, name: 'María Agustina Ramos', points: 3950, Deliveries: 115, rating: 4.92 },
    { pos: 4, name: 'Carlos Giménez (Vos)', points: 3840, Deliveries: 110, rating: 4.89 },
    { pos: 5, name: 'Leandro Pereira', points: 3200, Deliveries: 98, rating: 4.75 },
  ];

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleWithdraw = () => {
    setWithdrawalPending(true);
    setTimeout(() => {
      setWithdrawalPending(false);
      setWithdrawalToast(true);
      setTimeout(() => setWithdrawalToast(false), 4000);
    }, 2000);
  };

  const handleGetIaRecommendation = async () => {
    setIaLoading(true);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Actúa como el estratega logístico líder de Delivery Plus en Argentina. 
      Escribe en dialecto argentino coloquial rioplatense (che, mirá, viste, laburo, bondi, etc.). 
      El repartidor tiene un vehículo tipo ${vehicle}, está ${isOnDuty ? 'activo' : 'inactivo'}, y hay ${availableJobs.length} pedidos disponibles y ${availableShifts.length} turnos esperando asignación. 
      Dales 2 o 3 consejos súper precisos, cortitos e inteligentes (máximo 70 palabras). No uses markdown, escribe un bloque fluido de texto plano con excelente vibra argentina.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response && response.text) {
        setIaRecommendation(response.text);
      } else {
        throw new Error();
      }
    } catch (err) {
      setIaRecommendation(
        '¡Che, mirá! Justo se saturó la señal satelital, pero metele garra: hoy de tarde conviene arrimarte a las zonas de heladerías que el calor se viene con todo en la Costanera. ¡Metéle acelerador!'
      );
    } finally {
      setIaLoading(false);
    }
  };

  const handleTakeJob = (jobId: string, store: string, payout: number) => {
    // Simulate accepting order
    setWalletBalance(prev => prev + payout);
    setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
    onAcceptOrder(jobId);
    alert(`¡Trabajo Aceptado! Se asignó el despacho de "${store}" a tu hoja de ruta activa.`);
  };

  const handleTakeShift = (shiftId: string, store: string, hours: number) => {
    setAvailableShifts(prev => prev.filter(s => s.id !== shiftId));
    onAcceptShift(shiftId, store, hours);
    alert(`¡Turno Reservado! Quedarás de forma exclusiva con ${store} durante las ${hours} horas seleccionadas.`);
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-500">
      
      {/* Header and Turn status */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-dp-surfaceLight text-dp-text font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-dp-border">
            Ficha del Trabajador
          </span>
          <h2 className="text-5xl md:text-7xl font-poppins font-black tracking-tighter uppercase mt-3">
            Consola <span className="text-dp-primary">Repartidor</span>
          </h2>
          <p className="text-dp-textMuted text-xs font-semibold mt-1">
            Revisá tus fletes ganados, gestioná tu billetera virtual, y accedé a la inteligencia heurística de ruteo.
          </p>
        </div>

        {/* Active state toggle */}
        <div className="flex items-center gap-4 dp-card px-6 py-4">
          <span className="text-[10px] font-black uppercase text-dp-textMuted">Estado</span>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-dp-success animate-pulse' : 'bg-dp-danger'}`}></span>
            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                isOnDuty ? 'bg-dp-success text-black' : 'bg-dp-surfaceLight text-dp-textMuted'
              }`}
            >
              {isOnDuty ? 'En Servicio' : 'Fuera de Servicio'}
            </button>
          </div>
        </div>
      </header>

      {/* IA recommendations section */}
      <div className="bg-dp-surfaceLight text-dp-text p-8 md:p-12 rounded-[20px] border border-dp-primary/30 shadow-lg shadow-dp-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-[15rem] font-poppins font-black text-dp-primary/[0.05] select-none pointer-events-none">
          I.A.
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <span className="px-3 py-1 bg-dp-primary/15 text-dp-primary font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-dp-primary/20">
              ASISTENTE PREDICTIVO IA NATIVO [ARGENTINA]
            </span>
            <h3 className="text-2xl md:text-3xl font-poppins font-bold mt-4">
              Recomendación Operativa delivery Plus
            </h3>
            <p className="text-dp-textMuted text-sm font-semibold mt-4 leading-relaxed">
              "{iaRecommendation}"
            </p>
          </div>

          <button
            onClick={handleGetIaRecommendation}
            disabled={iaLoading}
            className={`dp-button uppercase tracking-wider px-8 text-[10px] ${
              iaLoading ? 'animate-pulse opacity-50' : ''
            }`}
          >
            {iaLoading ? 'Analizando Red...' : 'Recibir Consejos Heurísticos IA'}
          </button>
        </div>
      </div>

      {/* Grid: 1. Buscar Trabajos / 2. Reservar Turnos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Buscar Trabajos */}
        <div className="lg:col-span-7 dp-card p-10 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-poppins font-bold">Bolsa de Trabajos</h3>
              <p className="text-[10px] text-dp-textMuted font-bold uppercase mt-1">Pedidos listos para retiro inmediato en Posadas</p>
            </div>
            <span className="text-[9px] font-black uppercase text-dp-warning bg-dp-warning/10 border border-dp-warning/20 px-3 py-1 rounded">
              ● {availableJobs.length} En cola
            </span>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
            {availableJobs.map(job => (
              <div key={job.id} className="p-6 bg-dp-surfaceLight rounded-3xl border border-dp-border flex justify-between items-center group hover:bg-[#202020] transition-colors">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-dp-primary">{job.type === 'ENVIO_COMIDA' ? '🍴' : '📦'}</span>
                    <h4 className="text-base font-poppins font-bold text-dp-text">{job.store}</h4>
                  </div>
                  <p className="text-xs text-dp-textMuted font-semibold mt-1">{job.desc}</p>
                  <p className="text-[9px] text-dp-textMuted font-black mt-1 uppercase tracking-wider">Distancia del local: {job.dist}</p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-xl font-poppins font-bold text-dp-success">${job.payout.toLocaleString('es-AR')}</p>
                    <span className="text-[8px] font-black text-dp-textMuted uppercase">Garantizado</span>
                  </div>
                  <button
                    onClick={() => handleTakeJob(job.id, job.store, job.payout)}
                    disabled={!isOnDuty}
                    className="dp-button text-[9px] uppercase tracking-wider px-5 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Aceptar Pedido
                  </button>
                </div>
              </div>
            ))}
            {availableJobs.length === 0 && (
              <div className="text-center py-12 text-dp-textMuted uppercase font-bold text-xs">
                💤 No hay más fletes pendientes en este cuadrante.
              </div>
            )}
          </div>
        </div>

        {/* Reservar Turnos */}
        <div className="lg:col-span-5 dp-card p-10 flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-poppins font-bold">Reservar Turnos</h3>
            <p className="text-[10px] text-dp-textMuted font-bold uppercase mt-1">Fijá tu ganancia laburando por bloques exclusivos</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
            {availableShifts.map(sh => (
              <div key={sh.id} className="p-6 bg-dp-surfaceLight rounded-3xl border border-dp-border flex flex-col justify-between gap-4 group hover:bg-[#202020] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-poppins font-bold text-dp-text leading-none">{sh.store}</h4>
                    <span className="text-[8px] font-black text-dp-textMuted uppercase tracking-widest mt-2 block">{sh.time} • {sh.date}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-poppins font-bold text-dp-success">${sh.pay.toLocaleString('es-AR')}</p>
                    <span className="text-[8px] font-black text-dp-textMuted uppercase">{sh.hours}hs Cobertura</span>
                  </div>
                </div>

                <button
                  onClick={() => handleTakeShift(sh.id, sh.store, sh.hours)}
                  disabled={!isOnDuty}
                  className="dp-button-secondary text-[9px] uppercase tracking-wider h-10 disabled:opacity-40"
                >
                  Confirmar Cobertura ({sh.hours}hs)
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: 3. Wallet / 4. Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Wallet */}
        <div className="lg:col-span-6 dp-card p-10 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-2xl font-poppins font-bold mb-2">Mi Billetera Delivery Plus</h3>
            <p className="text-xs text-dp-textMuted font-semibold mb-6">Administrá tus comisiones recolectadas en el turno.</p>

            <div className="bg-dp-surfaceLight p-6 rounded-3xl border border-dp-border flex justify-between items-center mt-4">
              <div>
                <p className="text-[8px] font-black text-dp-textMuted uppercase tracking-wider">Saldo Disponible para Retiro</p>
                <p className="text-4xl font-poppins font-bold text-dp-text mt-2">${walletBalance.toLocaleString('es-AR')}</p>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={walletBalance < 1000 || withdrawalPending}
                className="dp-button text-[10px] uppercase tracking-wider disabled:opacity-40"
              >
                {withdrawalPending ? 'Procesando...' : 'Retirar Fondos'}
              </button>
            </div>

            {withdrawalToast && (
              <div className="bg-dp-success/10 border border-dp-success/20 rounded-2xl p-4 mt-4 animate-pulse">
                <p className="text-dp-success text-xs font-black uppercase">¡Retiro Enviado con éxito!</p>
                <p className="text-dp-success/80 text-[10px] uppercase font-bold mt-1">Revisá tu CBU ingresado en un lapso de 15 minutos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="lg:col-span-6 dp-card p-10 flex flex-col justify-between gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-poppins font-bold">Gestión de Perfil</h3>
              {profileSaved && (
                <span className="text-[8px] bg-dp-success/10 text-dp-success border-dp-success/20 border px-3 py-1 rounded-md font-black uppercase tracking-widest animate-pulse">
                  Guardado
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-dp-textMuted uppercase tracking-widest">Vehículo</label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="bg-dp-surfaceLight border border-dp-border p-4 rounded-xl text-xs font-bold focus:outline-none text-dp-text"
                >
                  <option value="Moto Honda 150cc">Moto Honda 150cc</option>
                  <option value="Bicicleta Deportiva">Bicicleta Deportiva</option>
                  <option value="Furgón de Carga">Furgón de Carga</option>
                  <option value="Auto Particular">Auto Particular</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-dp-textMuted uppercase tracking-widest">Patente de Red</label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="bg-dp-surfaceLight border border-dp-border p-4 rounded-xl text-xs font-bold focus:outline-none text-dp-text"
                />
              </div>
            </div>
            
            <div className="bg-dp-surfaceLight p-4 rounded-2xl border border-dp-border mt-4 text-[10px] text-dp-textMuted font-bold uppercase tracking-wide leading-relaxed">
              Asegurate de mantener tu documentación al día para el core.
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="dp-button-secondary text-[10px] uppercase tracking-widest mt-4"
          >
            Sincronizar Documentación
          </button>
        </div>

      </div>

      {/* Driver ranking screen */}
      <div className="dp-card p-10 flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-poppins font-bold">Consulta de Rankings de Red</h3>
          <p className="text-xs text-dp-textMuted font-semibold mt-1">Líderes semanales y estrellas olímpicas con acreditación instantánea de bonus.</p>
        </div>

        <div className="border border-dp-border rounded-3xl overflow-hidden mt-2">
          {rankingList.map((rank, idx) => (
            <div 
              key={idx}
              className={`p-6 flex justify-between items-center border-b border-dp-border last:border-b-0 ${
                rank.name.includes('(Vos)') ? 'bg-dp-primary/10 border-l-4 border-l-dp-primary' : 'bg-dp-surfaceLight'
              }`}
            >
              <div className="flex items-center gap-6">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black uppercase ${
                  rank.pos === 1 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                  rank.pos === 2 ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' :
                  rank.pos === 3 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-dp-surface text-dp-textMuted border border-dp-border'
                }`}>
                  {rank.pos}
                </span>

                <div>
                  <h4 className="text-sm font-poppins font-bold text-dp-text">{rank.name}</h4>
                  <p className="text-[10px] text-dp-textMuted font-bold uppercase mt-0.5">{rank.Deliveries} entregas este mes</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-xs font-black text-dp-textMuted uppercase tracking-widest">Puntos Red</p>
                  <p className="text-sm font-poppins font-bold text-dp-text mt-1">{rank.points} Puntos</p>
                </div>
                <div>
                  <p className="text-xs font-black text-dp-textMuted uppercase tracking-widest">Score</p>
                  <p className="text-sm font-black text-amber-500 mt-1">⭐ {rank.rating}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
