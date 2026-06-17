
import React from 'react';
import { EstadoPedido } from '../types';

interface PropiedadesEtiqueta {
  status: string;
}

const EtiquetaEstado: React.FC<PropiedadesEtiqueta> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case EstadoPedido.NEW: 
      case 'PENDIENTE':
        return 'bg-slate-100 text-slate-400 border border-slate-200';
      case EstadoPedido.ACCEPTED_BY_BUSINESS:
      case 'ACEPTADO':
        return 'bg-blue-100 text-[#2563EB] border border-blue-200';
      case EstadoPedido.PREPARING:
      case 'PREPARANDO':
        return 'bg-amber-100 text-amber-600 border border-amber-200';
      case EstadoPedido.READY_FOR_PICKUP: 
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case EstadoPedido.ASSIGNED_TO_DRIVER: 
        return 'bg-indigo-100 text-indigo-600 border border-indigo-200';
      case EstadoPedido.PICKED_UP:
      case 'EN_CAMINO':
        return 'bg-black text-white font-black';
      case EstadoPedido.DELIVERED:
      case 'ENTREGADO':
        return 'bg-emerald-600 text-white font-black shadow-[0_10px_20px_rgba(16,185,129,0.3)]';
      case EstadoPedido.CANCELLED: 
        return 'bg-red-100 text-red-600 border border-red-200';
      case EstadoPedido.INCIDENT: 
        return 'bg-red-600 text-white font-black animate-pulse';
      case EstadoPedido.RETURNED: 
        return 'bg-slate-400 text-white font-black';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span className={`px-4 py-1.5 text-[8px] font-black tracking-[0.3em] uppercase rounded-full transition-all duration-500 whitespace-nowrap ${getStyles()}`}>
      {getLabel()}
    </span>
  );
};

export default EtiquetaEstado;
