import React, { useState } from 'react';
import { SocioRepartidor, Pedido, EstadoPedido } from '../types';
import { WeatherWidget3D } from './WeatherWidget3D';
import { MiniTrackingMap } from './MiniTrackingMap';
import { IARecomendationBlock } from './IARecomendationBlock';

interface ComercioConsoleProps {
  repartidores: SocioRepartidor[];
  onCreatePedido: (pedido: Partial<Pedido>) => void;
  onCreateTurno: (shiftName: string, duration: number, store: string) => void;
  onContratarRepartidor: (driverId: any, storeName: string, duration: number) => void;
}

export const ComercioConsoleView: React.FC<ComercioConsoleProps> = ({ 
  repartidores, 
  onCreatePedido, 
  onCreateTurno,
  onContratarRepartidor 
}) => {
  // New Order State
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [payout, setPayout] = useState<number>(3500);
  const [orderCreatedToast, setOrderCreatedToast] = useState(false);

  // New Shift State
  const [shiftStore, setShiftStore] = useState('La Trattoria Posadas');
  const [shiftHours, setShiftHours] = useState<number>(4);
  const [shiftVehicle, setShiftVehicle] = useState('Moto Honda 150cc');
  const [shiftCreatedToast, setShiftCreatedToast] = useState(false);

  // Payments / Prepaid system
  const [balance, setBalance] = useState<number>(85400);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceList] = useState([
    { id: 'FAC-4122', date: '15 Jun 2026', desc: 'Comisión mensual Plus', amount: 15400, status: 'PAGADO' },
    { id: 'FAC-4123', date: '17 Jun 2026', desc: 'Suscripción Silver', amount: 8900, status: 'PAGADO' },
    { id: 'FAC-4124', date: '18 Jun 2026', desc: 'Contrato Turno Exclusivo (4hs)', amount: 14000, status: 'PENDIENTE' },
  ]);

  // Past dispatches / Historial
  const [historyOrders, setHistoryOrders] = useState([
    { id: 'FLET-1102', client: 'Amalia Ortiz', date: 'Hoy', status: 'ENTREGADO', desc: 'Pedido de comida grande', price: 4200, rating: 5 },
    { id: 'FLET-1103', client: 'Marcos Benítez', date: 'Ayer', status: 'ENTREGADO', desc: 'Paquete de ferretería', price: 3800, rating: 4 },
    { id: 'FLET-1104', client: 'Javier Solís', date: '12 Jun 2026', status: 'DEVUELTO', desc: 'Caja frágil', price: 5500, rating: null },
  ]);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !address) return;

    const newPed: Partial<Pedido> = {
      nombreCliente: clientName,
      detalles: details || 'Despacho de alimentos/bebidas',
      monto: payout,
      estado: EstadoPedido.PENDIENTE,
      deliveryAddressText: address,
      creadoEn: new Date().toLocaleTimeString(),
      latUsuario: -27.37,
      lngUsuario: -55.89,
      latitud: -27.365,
      longitud: -55.892,
      idRepartidor: null
    };

    onCreatePedido(newPed);
    
    // Feed the history list
    setHistoryOrders(prev => [
      { id: `FLET-${Math.floor(1000 + Math.random() * 9000)}`, client: clientName, date: 'Hoy', status: 'PENDIENTE', desc: details || 'Despacho corporativo', price: payout, rating: null },
      ...prev
    ]);

    setClientName('');
    setAddress('');
    setDetails('');
    setOrderCreatedToast(true);
    setTimeout(() => setOrderCreatedToast(false), 3000);
  };

  const handleCreateShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = shiftHours === 4 ? 14000 : 25000;
    
    onCreateTurno(`Turno Exclusivo - ${shiftHours} Horas`, shiftHours, shiftStore);
    setBalance(prev => prev - price);
    setShiftCreatedToast(true);
    setTimeout(() => setShiftCreatedToast(false), 3000);
  };

  const handleContratar = (driverId: any, name: string) => {
    const cost = 14000; // block cost
    if (balance < cost) {
      alert('⚠️ Saldo insuficiente en tu cuenta prepaga. Recargá fondos antes de contratar.');
      return;
    }
    setBalance(prev => prev - cost);
    onContratarRepartidor(driverId, shiftStore, 4);
    alert(`¡Chofer Contratado! El chofer ${name} ha quedado asignado de forma exclusiva a tu tienda.`);
  };

  const handleDeposit = () => {
    setBalance(prev => prev + 20000);
    alert('💳 Depósito Exitoso. Se acreditaron $20.000 ARS en tu billetera prepaga mediante Mercado Pago.');
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-500">
      
      {/* Header and Turn status */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-amber-200">
            Ficha del Comercio Adherido
          </span>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-3">
            Consola <span className="text-plus-blue">Comercio</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Creá fletes individuales, contratá turnos exclusivos y gestioná tu cuenta corriente desde Delivery Plus.
          </p>
        </div>

        {/* Prepago balance shield */}
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-black/5 shadow-md">
          <div>
            <p className="text-[8px] font-black uppercase text-slate-400">Fondos Prepago</p>
            <p className="text-xl font-black italic mt-1 text-black">${balance.toLocaleString('es-AR')}</p>
          </div>
          <button
            onClick={handleDeposit}
            className="px-4 py-2.5 bg-plus-blue text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all active:scale-95"
          >
            Saldar / Recargar 💳
          </button>
        </div>
      </header>

      {/* Weather Widget */}
      <WeatherWidget3D />

      {/* IA recommendations section */}
      <IARecomendationBlock role="COMERCIO" />

      {/* Grid: 1. Crear Pedidos / 2. Crear Turnos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Crear Pedido */}
        <div className="lg:col-span-6 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Crear Pedido Individual</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Despachá envíos de comida o paquetería de forma rápida</p>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcos Benítez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase">Valor del Envío ($)</label>
                <input
                  type="number"
                  required
                  value={payout}
                  onChange={(e) => setPayout(Number(e.target.value))}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase">Dirección de Destino</label>
              <input
                type="text"
                required
                placeholder="Ej: Av. Costanera 1420, Posadas"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase">Detalles del Paquete</label>
              <input
                type="text"
                placeholder="Ej: Bulto mediano, 2 pizzas familiares"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-md mt-4"
            >
              Lanzar Envío de Red 🚀
            </button>
          </form>

          {orderCreatedToast && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-black uppercase tracking-wider animate-bounce">
              ✔️ ¡Pedido lanzado! Asignando moto mensajero en vivo...
            </div>
          )}
        </div>

        {/* Crear Turnos Exclusivos */}
        <div className="lg:col-span-6 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase mb-2">Reservar Bloque de Turno Exclusivo</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mb-6">Bloqueá un repartidor exclusivamente para tu comercio y reducí costos.</p>

            <form onSubmit={handleCreateShiftSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Comercio Contratante</label>
                  <input
                    type="text"
                    required
                    value={shiftStore}
                    onChange={(e) => setShiftStore(e.target.value)}
                    className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Bloque Horario</label>
                  <select
                    value={shiftHours}
                    onChange={(e) => setShiftHours(Number(e.target.value))}
                    className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value={4}>4 Horas ($14.000)</option>
                    <option value={8}>8 Horas ($25.000)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase">Preferencia de Vehículo</label>
                <select
                  value={shiftVehicle}
                  onChange={(e) => setShiftVehicle(e.target.value)}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="Moto Honda 150cc">Solo Motocicleta (Rápido)</option>
                  <option value="Bicicleta">Bicicleta (Cercano - Ecológico)</option>
                  <option value="Furgón">Furgón (Cargas pesadas)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-black/5 text-[9px] font-black text-slate-400 uppercase leading-relaxed">
                ℹ️ La contratación de bloques se debita instantáneamente del saldo prepago de tu comercio.
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-plus-blue text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.4)] mt-4"
              >
                Crear Oferta de Cobertura Turno
              </button>
            </form>

            {shiftCreatedToast && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-4 text-emerald-800 text-xs font-black uppercase tracking-wider animate-bounce">
                ✔️ ¡Oferta de Bloque Creada! Quedará visible en la cartera de repartidores.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid: 3. Contratar Repartidores / 4. Facturación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contratar Repartidores */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Buscador y Match Directo de Choferes</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Socio-Repartidores activos cerca tuyo listos para ser reservados de inmediato</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
            {repartidores.filter(d => d.etapaIngreso === 'ACTIVO').map(driver => (
              <div key={driver.id} className="p-6 bg-slate-50 rounded-3xl border border-black/5 flex justify-between items-center hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-black/10 bg-slate-200">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.nombre}`} alt="D" />
                  </div>
                  <div>
                    <h4 className="text-base font-black italic text-black uppercase">{driver.nombre}</h4>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 mt-1">
                      <span>🚗 {driver.vehiculo}</span>
                      <span>⭐ {driver.calificacion}</span>
                      <span className="text-plus-blue font-bold tracking-widest uppercase">[{driver.nivel}]</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleContratar(driver.id, driver.nombre)}
                  className="px-5 py-3 bg-black hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                >
                  Contratar (4hs / $14.000)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cuentas y Facturación */}
        <div className="lg:col-span-5 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Facturación y Pagos</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Balance histórico de comprobantes y cargos directos</p>
          </div>

          <div className="space-y-4">
            {invoiceList.map(invoice => (
              <div 
                key={invoice.id} 
                onClick={() => setSelectedInvoice(invoice)}
                className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-2xl border border-black/5 flex justify-between items-center transition-all"
              >
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{invoice.id}</span>
                  <h4 className="text-xs font-black text-black mt-1">{invoice.desc}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{invoice.date}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <p className="text-sm font-black italic text-black">${invoice.amount.toLocaleString('es-AR')}</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                    invoice.status === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tracking Mini Map */}
      <div className="bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Posicionamiento de Logística</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Status de entregas en tiempo real.</p>
          </div>
        </div>
        <MiniTrackingMap role="COMERCIO" />
      </div>

      {/* Historial corporativo de dispatches */}
      <div className="bg-[#050505] text-white p-10 md:p-12 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col gap-6">
        <div>
          <span className="px-3 py-1 bg-plus-blue/15 text-plus-blue font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-plus-blue/10">
            REGISTRO CORPORATIVO DE LOGÍSTICA
          </span>
          <h3 className="text-3xl font-black italic uppercase italic tracking-tight mt-3">
            Historial de Despachos del Comercio
          </h3>
          <p className="text-white/40 text-xs font-semibold mt-2">
            Revisión de paquetes pasados, estados de entrega y valoraciones de los clientes.
          </p>
        </div>

        <div className="border border-white/10 rounded-3xl overflow-hidden mt-2">
          {historyOrders.map((h, idx) => (
            <div key={idx} className="p-6 border-b border-white/10 last:border-b-0 flex justify-between items-center hover:bg-white/[0.02] transition-all">
              <div>
                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">{h.id} • {h.date}</span>
                <h4 className="text-base font-black italic text-white mt-1">Destinatario: {h.client}</h4>
                <p className="text-xs text-white/40 mt-1 font-semibold">{h.desc}</p>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-lg font-black italic text-white">${h.price.toLocaleString('es-AR')}</p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${
                    h.status === 'ENTREGADO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                    h.status === 'PENDIENTE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                    'bg-slate-500/20 text-slate-400 border border-slate-500/10'
                  }`}>
                    {h.status}
                  </span>
                </div>
                {h.rating !== null && (
                  <span className="text-xs text-amber-400 font-bold">⭐ {h.rating}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
