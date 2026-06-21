import React from 'react';
import { 
  Clock, 
  UserCheck, 
  Store, 
  MapPin, 
  BadgeCheck, 
  DollarSign, 
  XOctagon, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { Pedido, EstadoPedido } from '../types';

interface OrderLifecycleTrackerProps {
  pedidos: Pedido[];
  onUpdateStatus: (orderId: any, status: EstadoPedido) => Promise<void>;
}

export const OrderLifecycleTracker: React.FC<OrderLifecycleTrackerProps> = ({ 
  pedidos, 
  onUpdateStatus 
}) => {
  // Ordered array of non-terminal states for rendering the progress pipeline
  const stages = [
    { key: EstadoPedido.PENDIENTE, label: 'Pendiente', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100' },
    { key: EstadoPedido.ACEPTADO, label: 'Aceptado', icon: UserCheck, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { key: EstadoPedido.EN_RETIRO, label: 'En Retiro', icon: Store, color: 'text-purple-500 bg-purple-50 border-purple-100' },
    { key: EstadoPedido.EN_CAMINO, label: 'En Camino', icon: MapPin, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
    { key: EstadoPedido.ENTREGADO, label: 'Entregado', icon: BadgeCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
    { key: EstadoPedido.LIQUIDADO, label: 'Liquidado', icon: DollarSign, color: 'text-zinc-500 bg-zinc-50 border-zinc-200' }
  ];

  // Helper to determine the index of the current state in stages
  const getStageIndex = (estado: string) => {
    return stages.findIndex(s => s.key === estado);
  };

  // Determine which states are valid next steps for an order
  const getNextState = (estado: string): EstadoPedido | null => {
    switch (estado) {
      case EstadoPedido.PENDIENTE:
        return EstadoPedido.ACEPTADO;
      case EstadoPedido.ACEPTADO:
        return EstadoPedido.EN_RETIRO;
      case EstadoPedido.EN_RETIRO:
        return EstadoPedido.EN_CAMINO;
      case EstadoPedido.EN_CAMINO:
        return EstadoPedido.ENTREGADO;
      case EstadoPedido.ENTREGADO:
        return EstadoPedido.LIQUIDADO;
      default:
        return null;
    }
  };

  // Determine if order can be cancelled (only if it hasn't reached EN_CAMINO/ENTREGADO/LIQUIDADO)
  const canCancel = (estado: string): boolean => {
    return estado === EstadoPedido.PENDIENTE || estado === EstadoPedido.ACEPTADO || estado === EstadoPedido.EN_RETIRO;
  };

  return (
    <div className="bg-white p-10 rounded-[4rem] border border-black/5 shadow-xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <span className="px-3 py-1 bg-plus-blue/15 text-plus-blue font-black text-[8px] uppercase tracking-[0.2em] rounded-md border border-plus-blue/10">
            Capítulo 4 • Transiciones Blindadas de Pedidos
          </span>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mt-3">
            Sistema de Pedidos <span className="text-plus-blue">Garantizado</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Supervisión del ciclo de vida secuencial. <strong className="text-black">No se permite saltar estados</strong> de acuerdo a las reglas del flete.
          </p>
        </div>

        <div className="flex bg-slate-50 border border-black/5 rounded-2xl p-4 gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Pendientes: {pedidos.filter(p => p.estado === EstadoPedido.PENDIENTE).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Activos: {pedidos.filter(p => p.estado !== EstadoPedido.PENDIENTE && p.estado !== EstadoPedido.ENTREGADO && p.estado !== EstadoPedido.LIQUIDADO && p.estado !== EstadoPedido.CANCELADO).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Completados: {pedidos.filter(p => p.estado === EstadoPedido.ENTREGADO || p.estado === EstadoPedido.LIQUIDADO).length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {pedidos.map((order) => {
          const currentStageIdx = getStageIndex(order.estado);
          const nextState = getNextState(order.estado);
          const allowedCancel = canCancel(order.estado);
          const isCancelled = order.estado === EstadoPedido.CANCELADO;

          return (
            <div 
              key={order.id} 
              className={`p-8 rounded-[2.5rem] border transition-all ${
                isCancelled ? 'bg-rose-50/20 border-rose-100 opacity-80' : 
                order.estado === EstadoPedido.LIQUIDADO ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-black/5 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* Left side: Order details */}
                <div className="space-y-2 max-w-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">PEDIDO ID: #{order.id}</span>
                    {isCancelled && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-bold uppercase rounded flex items-center gap-1">
                        <XOctagon size={10} /> Cancelado
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black italic uppercase text-black leading-none">{order.nombreCliente}</h4>
                  <p className="text-xs text-slate-500 font-bold truncate">{order.detalles || 'Paquete Delivery Plus'}</p>
                  <p className="text-lg font-black italic tracking-tight text-plus-blue mt-1">${order.monto.toLocaleString('es-AR')}</p>
                </div>

                {/* Center: Stage stepper */}
                <div className="flex-1 w-full relative">
                  {!isCancelled ? (
                    <div className="relative">
                      {/* Connection bar */}
                      <div className="absolute top-[21px] left-8 right-8 h-0.5 bg-slate-100 -z-10">
                        <div 
                          className="h-full bg-plus-blue transition-all duration-500" 
                          style={{ width: `${currentStageIdx >= 0 ? (currentStageIdx / (stages.length - 1)) * 100 : 0}%` }}
                        />
                      </div>

                      {/* Steps circle details */}
                      <div className="grid grid-cols-6 text-center">
                        {stages.map((stage, idx) => {
                          const Icon = stage.icon;
                          const isVisited = idx <= currentStageIdx;
                          const isActive = idx === currentStageIdx;

                          return (
                            <div key={stage.key} className="flex flex-col items-center">
                              <div 
                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                  isActive ? 'bg-black text-white ring-4 ring-black/10 scale-110 shadow-lg' : 
                                  isVisited ? 'bg-plus-blue text-white' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-wider mt-2 block whitespace-nowrap ${isActive ? 'text-black font-extrabold' : 'text-slate-400'}`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-red-50 border border-red-100 rounded-2xl p-6 text-red-800 gap-3 text-xs font-bold uppercase tracking-widest">
                      <AlertCircle className="animate-bounce" /> El pedido fue cancelado y no admite más transiciones
                    </div>
                  )}
                </div>

                {/* Right side: Action triggers */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  {nextState && (
                    <button
                      onClick={() => onUpdateStatus(order.id, nextState)}
                      className="flex-1 lg:flex-none px-6 py-4 bg-plus-blue hover:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Avanzar a: {nextState}
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {allowedCancel && (
                    <button
                      onClick={() => onUpdateStatus(order.id, EstadoPedido.CANCELADO)}
                      className="flex-1 lg:flex-none px-4 py-4 bg-white hover:bg-red-50 text-red-500 border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Anular Pedido
                    </button>
                  )}
                  {order.estado === EstadoPedido.LIQUIDADO && (
                    <div className="px-5 py-4 bg-emerald-50 text-emerald-800 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                      💸 Flete Liquidado
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {pedidos.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <span className="text-4xl text-slate-300 block">📦</span>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">No hay pedidos cargados en la red central.</p>
          </div>
        )}
      </div>
    </div>
  );
};
