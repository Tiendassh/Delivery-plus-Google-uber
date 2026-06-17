
import React, { useState, useMemo } from 'react';
import { Pedido, SocioRepartidor, EstadoPedido } from '../types';
import StatusBadge from './StatusBadge';
import InteractiveMap from './InteractiveMap';

interface OrderManagementViewProps {
  pedidos: Pedido[];
  repartidores: SocioRepartidor[];
  onAssign: (orderId: any, driverId: any) => void;
  onUpdateStatus: (orderId: any, status: EstadoPedido) => void;
}

const OrderManagementView: React.FC<OrderManagementViewProps> = ({ pedidos, repartidores, onAssign, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'ALL' | EstadoPedido>('ALL');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const filteredOrders = useMemo(() => {
    if (filter === 'ALL') return pedidos;
    return pedidos.filter(p => p.estado === filter);
  }, [pedidos, filter]);

  const stats = useMemo(() => ({
    total: pedidos.length,
    pending: pedidos.filter(p => p.estado === 'PENDIENTE').length,
    active: pedidos.filter(p => p.estado === 'EN_CAMINO' || p.estado === 'ACEPTADO').length
  }), [pedidos]);

  const selectedOrder = useMemo(() => 
    pedidos.find(p => p.id === selectedId), [pedidos, selectedId]
  );

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
          <h2 className="text-7xl font-black tracking-tighter italic uppercase text-black leading-none">
            Menú de <span className="text-plus-blue">Operaciones</span>
          </h2>
          <div className="flex gap-8 mt-6">
             <div>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">En Red</p>
                <p className="text-2xl font-black italic">{stats.total}</p>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-amber-500 tracking-widest">Pendientes</p>
                <p className="text-2xl font-black italic">{stats.pending}</p>
             </div>
             <div>
                <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Activos</p>
                <p className="text-2xl font-black italic">{stats.active}</p>
             </div>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-2 rounded-[2.5rem] border border-black/5">
           {['ALL', 'PENDIENTE', 'ACEPTADO', 'EN_CAMINO', 'ENTREGADO'].map(status => (
             <button 
               key={status}
               onClick={() => setFilter(status as any)}
               className={`px-6 py-3 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:text-black'}`}
             >
               {status}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 min-h-[700px]">
        <div className="xl:col-span-4 bg-white p-8 rounded-[5rem] border border-black/5 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 no-scrollbar">
            {filteredOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                className={`p-10 rounded-[3.5rem] border transition-all cursor-pointer relative overflow-hidden group ${selectedId === order.id ? 'bg-black text-white border-black' : 'bg-slate-50 border-black/5'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{order.nombreCliente}</h4>
                  <StatusBadge status={order.estado} />
                </div>
                <p className={`text-sm font-bold italic truncate ${selectedId === order.id ? 'text-white/60' : 'text-black/40'}`}>{order.detalles}</p>
                <p className="text-2xl font-black italic tracking-tighter mt-8">${order.monto.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-500 bg-white rounded-[5rem] overflow-hidden border border-black/5 shadow-2xl relative ${selectedOrder ? 'xl:col-span-5' : 'xl:col-span-8'}`}>
            <InteractiveMap 
              center="-27.368,-55.895"
              stores={[]}
              drivers={repartidores}
              className="w-full h-full"
              pickup={selectedOrder ? { lat: selectedOrder.latitud, lng: selectedOrder.longitud } : undefined}
              delivery={selectedOrder ? { lat: selectedOrder.latUsuario, lng: selectedOrder.lngUsuario } : undefined}
            />
        </div>

        {selectedOrder && (
          <div className="xl:col-span-3 bg-[#0A0A0B] text-white p-12 rounded-[5rem] shadow-3xl flex flex-col border border-white/5">
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
               <h3 className="text-3xl font-black italic uppercase leading-tight mb-10">{selectedOrder.nombreCliente}</h3>
               
               <div className="flex-1 space-y-6">
                  {!selectedOrder.idRepartidor && (
                    <div className="space-y-4">
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Asignación Manual</p>
                       {repartidores.filter(d => d.etapaIngreso === 'ACTIVO').slice(0, 3).map(driver => (
                         <button 
                            key={driver.id}
                            onClick={() => onAssign(selectedOrder.id, driver.id)}
                            className="w-full bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-plus-blue transition-all"
                         >
                            <span className="font-black italic uppercase text-xs">{driver.nombre}</span>
                            <span>→</span>
                         </button>
                       ))}
                    </div>
                  )}
                  {selectedOrder.estado !== 'ENTREGADO' && (
                     <button 
                       onClick={() => onUpdateStatus(selectedOrder.id, EstadoPedido.CANCELLED)}
                       className="w-full py-4 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest mt-12 hover:bg-red-500 hover:text-white transition-all"
                     >
                       Anular Pedido
                     </button>
                  )}
               </div>

               <button onClick={() => setSelectedId(null)} className="mt-10 w-full py-5 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementView;
