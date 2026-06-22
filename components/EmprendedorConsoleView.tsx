import React, { useState } from 'react';
import { SocioRepartidor, Pedido, EstadoPedido } from '../types';
import { WeatherWidget3D } from './WeatherWidget3D';
import { MiniTrackingMap } from './MiniTrackingMap';
import { IARecomendationBlock } from './IARecomendationBlock';

interface EmprendedorConsoleProps {
  repartidores: SocioRepartidor[];
  onCreatePedido: (pedido: Partial<Pedido>) => void;
  onContratarRepartidor: (driverId: any, storeName: string, duration: number) => void;
}

export const EmprendedorConsoleView: React.FC<EmprendedorConsoleProps> = ({ 
  repartidores, 
  onCreatePedido, 
  onContratarRepartidor 
}) => {
  // Envíos individuales state
  const [recipient, setRecipient] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [parcelSize, setParcelSize] = useState<'CHICO' | 'MEDIANO' | 'GRANDE'>('CHICO');
  const [notes, setNotes] = useState('');
  const [priceCalculated, setPriceCalculated] = useState<number>(3100);
  const [createdToast, setCreatedToast] = useState(false);

  // Past shipments / Historial
  const [shipments, setShipments] = useState([
    { id: 'ENV-3910', recipient: 'Diana Maidana', date: 'Hoy', desc: 'Decoración de cerámica fragil', size: 'MEDIANO', status: 'CRIADO', price: 4200 },
    { id: 'ENV-3911', recipient: 'Rodrigo Cáceres', date: 'Ayer', desc: 'Prenda de ropa con caja', size: 'CHICO', status: 'ENTREGADO', price: 3100 },
    { id: 'ENV-3912', recipient: 'Estudio Jurídico Posadas', date: '10 Jun 2026', desc: 'Sobres de documentación notarial', size: 'CHICO', status: 'ENTREGADO', price: 3100 },
  ]);

  // Payments / Saldos simple
  const [walletBalance, setWalletBalance] = useState<number>(12300);
  const [paymentsHistory] = useState([
    { id: 'PAY-891', date: 'Hoy', type: 'COBRO_ENVIO', desc: 'Despacho Diana Maidana', amount: -4200, status: 'DEBITADO' },
    { id: 'PAY-892', date: 'Ayer', type: 'COBRO_ENVIO', desc: 'Despacho Rodrigo Cáceres', amount: -3100, status: 'DEBITADO' },
    { id: 'PAY-893', date: '08 Jun 2026', type: 'RECARGA_CUENTA', desc: 'Depósito a través de Mercado Pago', amount: 15000, status: 'CREDITADO' },
  ]);

  const handleSizeChange = (size: 'CHICO' | 'MEDIANO' | 'GRANDE') => {
    setParcelSize(size);
    if (size === 'CHICO') setPriceCalculated(3100);
    else if (size === 'MEDIANO') setPriceCalculated(4200);
    else setPriceCalculated(6500);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !destination) return;

    if (walletBalance < priceCalculated) {
      alert('⚠️ Fondos insuficientes para costear el envío. Hacé una recarga de saldo primero.');
      return;
    }

    const newPed: Partial<Pedido> = {
      nombreCliente: recipient,
      detalles: `Pedido Emprendedor: ${notes || 'Caja individual de venta directa'}`,
      monto: priceCalculated,
      estado: EstadoPedido.PENDIENTE,
      deliveryAddressText: destination,
      creadoEn: new Date().toLocaleTimeString(),
      latUsuario: -27.37,
      lngUsuario: -55.89,
      latitud: -27.365,
      longitud: -55.892,
      idRepartidor: null
    };

    onCreatePedido(newPed);
    setWalletBalance(prev => prev - priceCalculated);
    
    setShipments(prev => [
      { id: `ENV-${Math.floor(3000 + Math.random() * 6999)}`, recipient, date: 'Hoy', desc: notes || 'Venta de cosméticos / indumentaria', size: parcelSize, status: 'CRIADO', price: priceCalculated },
      ...prev
    ]);

    setRecipient('');
    setRecipientPhone('');
    setDestination('');
    setNotes('');
    setCreatedToast(true);
    setTimeout(() => setCreatedToast(false), 3000);
  };

  const handleRecharge = () => {
    setWalletBalance(prev => prev + 10000);
    alert('💳 Recarga exitosa. Se sumaron $10.000 ARS a tu balance de micro-emprendedor.');
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-500">
      
      {/* Header and simple status */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3 py-1 bg-green-100 text-green-800 font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-green-200">
            Ficha para Micro-Emprendedores y Páginas de Venta
          </span>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mt-3">
            Consola <span className="text-plus-blue">Emprendedor</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Espacio diseñado para despachar artículos individuales, artesanías, ropa y ventas locales en la ciudad.
          </p>
        </div>

        {/* Small balance holder */}
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-black/5 shadow-md">
          <div>
            <p className="text-[8px] font-black uppercase text-slate-400">Tu Saldo Micro</p>
            <p className="text-xl font-black italic mt-1 text-black">${walletBalance.toLocaleString('es-AR')}</p>
          </div>
          <button
            onClick={handleRecharge}
            className="px-4 py-2 bg-plus-blue text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all active:scale-95"
          >
            Sumar $10k
          </button>
        </div>
      </header>

      {/* Weather Widget */}
      <WeatherWidget3D />

      {/* IA recommendations section */}
      <IARecomendationBlock role="EMPRENDEDOR" />

      {/* Grid: 1. Crear Envíos Individuales / 2. Contratar Repartidores Instant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Crear Envío Individual */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Despacho de Envío Individual</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Ingresá los datos del cliente para pedir una moto mensajería ya</p>
          </div>

          <form onSubmit={handleCreateShipment} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Gómez"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase">Teléfono de Contacto</label>
                <input
                  type="text"
                  required
                  placeholder="3764-123456"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase">Dirección de Entrega</label>
              <input
                type="text"
                required
                placeholder="Ej: Calle Junín 2110, Posadas Misiones"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none focus:border-plus-blue"
              />
            </div>

            {/* Parcel Size */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tamaño Estimado del Paquete</label>
              <div className="grid grid-cols-3 gap-3">
                {['CHICO', 'MEDIANO', 'GRANDE'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size as any)}
                    className={`p-4 rounded-xl text-[10px] font-black transition-all ${
                      parcelSize === size 
                        ? 'bg-black text-white shadow-md border-black' 
                        : 'bg-slate-50 text-black/50 hover:bg-slate-100 border border-black/5'
                    }`}
                  >
                    {size === 'CHICO' && '📨 CHICO ($3.100)'}
                    {size === 'MEDIANO' && '📦 MEDI ($4.200)'}
                    {size === 'GRANDE' && '🛍️ GRANDE ($6.500)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase">Notas internas de empaque / Envío</label>
              <input
                type="text"
                placeholder="Ej: Entregar tocando timbre azul, es un regalo de cumpleaños."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            {/* Price calc card */}
            <div className="p-5 bg-plus-blue/5 border border-plus-blue/10 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black text-plus-blue uppercase">Costo Estimado de Despacho</p>
                <p className="text-2xl font-black italic mt-1 text-black">${priceCalculated.toLocaleString('es-AR')}</p>
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-plus-blue text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all active:scale-95"
              >
                Despachar Ahora 🏍️
              </button>
            </div>
          </form>

          {createdToast && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-black uppercase tracking-wider animate-bounce mt-2 text-center">
              ✔️ ¡Envío Individual Creado! Ya figura en la red de motos disponibles en Posadas.
            </div>
          )}
        </div>

        {/* Buscador de Repartidores */}
        <div className="lg:col-span-5 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Buscador Instantáneo de Choferes</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Localizá motos y furgoneros en vivo para reservar al instante</p>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
            {repartidores.filter(r => r.etapaIngreso === 'ACTIVO').map(driver => (
              <div key={driver.id} className="p-6 bg-slate-50 rounded-3xl border border-black/5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="text-2xl">🛵</span>
                    <div>
                      <h4 className="text-sm font-black italic text-black">{driver.nombre}</h4>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Calificación: ⭐ {driver.calificacion} • {driver.vehiculo}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    DISPONIBLE
                  </span>
                </div>

                <button
                  onClick={() => {
                    onContratarRepartidor(driver.id, 'Envías Directo Emprendedor', 4);
                    alert(`¡Móvil Asignado! ${driver.nombre} fue notificado de tu flete individual.`);
                  }}
                  className="w-full py-2.5 bg-black hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                >
                  Match Directo (Solo Moto flete)
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tracking Mini Map */}
      <div className="bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Tracking GPS Logístico</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Ubicación de tus envíos y de mensajeros en ruta en tiempo real.</p>
          </div>
        </div>
        <MiniTrackingMap role="EMPRENDEDOR" />
      </div>

      {/* Grid: 3. Historial de Envíos / 4. Gestión de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Historial de Envíos */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Seguimiento de Envíos Realizados</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Revisá el estado en tiempo real de tus ventas despachadas</p>
          </div>

          <div className="space-y-4">
            {shipments.map(s => (
              <div key={s.id} className="p-5 bg-slate-50 rounded-2xl border border-black/5 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{s.id} • {s.date}</span>
                  <h4 className="text-xs font-black text-black mt-1 leading-none">Cliente: {s.recipient}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1.5 truncate max-w-sm">{s.desc}</p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-sm font-black italic text-black">${s.price.toLocaleString('es-AR')}</p>
                    <span className="text-[8px] text-slate-400 font-bold uppercase py-0.5 block">{s.size}</span>
                  </div>
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                    s.status === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {s.status === 'CRIADO' ? 'En espera' : s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facturación y Libros de Cuenta */}
        <div className="lg:col-span-5 bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-black italic uppercase">Libros de Cuenta Recientes</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Detalle contable de recargas, envíos y deudas saldadas</p>
          </div>

          <div className="space-y-4">
            {paymentsHistory.map(pay => (
              <div key={pay.id} className="p-4 bg-slate-50 rounded-xl border border-black/5 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase">{pay.id} • {pay.date}</span>
                  <h4 className="text-xs font-black text-black mt-1 leading-none">{pay.desc}</h4>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-black italic ${pay.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {pay.amount < 0 ? '-' : '+'}${Math.abs(pay.amount).toLocaleString('es-AR')}
                  </p>
                  <span className="text-[7.5px] font-black text-slate-300 uppercase mt-1 block">{pay.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
