
import React, { useState, useEffect, useRef } from 'react';
import { SocioRepartidor, Pedido, EstadoPedido, MensajeChat, ChatRoom } from '../types';
import InteractiveMap from './InteractiveMap';
import { firebaseService } from '../services/firebaseService';

interface PropiedadesSimulador {
  isOpen: boolean;
  onClose: () => void;
  driver: SocioRepartidor;
  activeOrders: Pedido[];
  onOrderAccepted?: (orderId: string | number) => void;
  onOrderDelivered?: (orderId: string | number) => void;
  onUpdateStatus?: (orderId: any, status: EstadoPedido) => Promise<void>;
}

type AppState = 'OFFLINE' | 'ONLINE' | 'ON_TRIP' | 'CHAT';
type TripPhase = 'TO_PICKUP' | 'TO_DELIVERY' | 'ARRIVED';

const MobileSimulator: React.FC<PropiedadesSimulador> = ({ 
  isOpen, onClose, driver, activeOrders, onOrderAccepted, onOrderDelivered, onUpdateStatus
}) => {
  const [appState, setAppState] = useState<AppState>('OFFLINE');
  const [tripPhase, setTripPhase] = useState<TripPhase>('TO_PICKUP');
  const [currentOrder, setCurrentOrder] = useState<Pedido | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [inputText, setInputText] = useState('');
  const [simulatedDriver, setSimulatedDriver] = useState(driver);
  const scrollRef = useRef<HTMLDivElement>(null);
  const movementInterval = useRef<number | null>(null);

  // Simulación de movimiento hacia el destino dinámicamente
  useEffect(() => {
    if (appState === 'ON_TRIP' && currentOrder) {
      const targetLat = tripPhase === 'TO_PICKUP' ? currentOrder.latitud : currentOrder.latUsuario;
      const targetLng = tripPhase === 'TO_PICKUP' ? currentOrder.longitud : currentOrder.lngUsuario;

      movementInterval.current = window.setInterval(() => {
        setSimulatedDriver(prev => {
          const step = 0.0005; // Velocidad ajustada para realismo en demo
          const latDiff = targetLat - prev.latitud;
          const lngDiff = targetLng - prev.longitud;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          
          if (distance < 0.0006) {
            if (movementInterval.current) clearInterval(movementInterval.current);
            if (tripPhase === 'TO_PICKUP') setTripPhase('TO_DELIVERY');
            else setTripPhase('ARRIVED');
            return prev;
          }

          return {
            ...prev,
            latitud: prev.latitud + (latDiff / distance) * step,
            longitud: prev.longitud + (lngDiff / distance) * step
          };
        });
      }, 1000);
    } else {
      if (movementInterval.current) clearInterval(movementInterval.current);
    }
    return () => { if (movementInterval.current) clearInterval(movementInterval.current); };
  }, [appState, currentOrder, tripPhase]);

  useEffect(() => {
    if (currentOrder && appState === 'CHAT') {
      const unsubscribe = firebaseService.subscribe(currentOrder.id, (chat) => {
        setChatRoom(chat);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 50);
      });
      return unsubscribe;
    }
  }, [currentOrder, appState]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!currentOrder || !inputText.trim()) return;
    firebaseService.sendMessage(currentOrder.id, driver.id, driver.nombre, inputText, 'USUARIO');
    setInputText('');
  };

  const liveOrder = currentOrder ? activeOrders.find(o => String(o.id) === String(currentOrder.id)) || currentOrder : null;

  const handleAccept = (order: Pedido) => {
    setCurrentOrder(order);
    setAppState('ON_TRIP');
    setTripPhase('TO_PICKUP');
    if (onUpdateStatus) {
      onUpdateStatus(order.id, EstadoPedido.ACEPTADO).catch(() => {});
    } else if (onOrderAccepted) {
      onOrderAccepted(order.id);
    }
  };

  const handleStepStatus = () => {
    if (!liveOrder) return;
    const currentStatus = liveOrder.estado;
    let nextStatus: EstadoPedido | null = null;

    if (currentStatus === EstadoPedido.ACEPTADO) {
      nextStatus = EstadoPedido.EN_RETIRO;
    } else if (currentStatus === EstadoPedido.EN_RETIRO) {
      nextStatus = EstadoPedido.EN_CAMINO;
    } else if (currentStatus === EstadoPedido.EN_CAMINO) {
      nextStatus = EstadoPedido.ENTREGADO;
    } else if (currentStatus === EstadoPedido.ENTREGADO) {
      nextStatus = EstadoPedido.LIQUIDADO;
    }

    if (nextStatus && onUpdateStatus) {
      onUpdateStatus(liveOrder.id, nextStatus).then(() => {
        if (nextStatus === EstadoPedido.LIQUIDADO) {
          setCurrentOrder(null);
          setAppState('ONLINE');
          setTripPhase('TO_PICKUP');
        }
      }).catch(err => {
        alert(err.message || 'Transición denegada.');
      });
    } else {
      // Fallback
      if (onOrderDelivered) onOrderDelivered(liveOrder.id);
      setCurrentOrder(null);
      setAppState('ONLINE');
      setTripPhase('TO_PICKUP');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[375px] h-[812px] bg-white rounded-[3rem] border-[8px] border-black shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Notch Area */}
        <div className="h-11 bg-white relative z-50 flex justify-between items-center px-8">
           <span className="text-xs font-bold">9:41</span>
           <div className="w-24 h-6 bg-black rounded-b-3xl absolute left-1/2 -translate-x-1/2 top-0"></div>
           <div className="flex gap-1.5 items-center">
              <div className="w-4 h-2.5 border border-black/20 rounded-sm"></div>
           </div>
        </div>

        <div className="flex-1 relative flex flex-col bg-[#F6F6F6]">
          {/* Background Map */}
          {appState !== 'OFFLINE' && (
            <div className="absolute inset-0 z-0">
               <InteractiveMap 
                 center={`${simulatedDriver.latitud},${simulatedDriver.longitud}`} 
                 stores={[]} 
                 drivers={[simulatedDriver]} 
                 className="w-full h-full"
                 pickup={currentOrder ? { lat: currentOrder.latitud, lng: currentOrder.longitud } : undefined}
                 delivery={currentOrder ? { lat: currentOrder.latUsuario, lng: currentOrder.lngUsuario } : undefined}
                 showRiskZones={true}
               />
            </div>
          )}

          {/* Top Info Bar */}
          {appState !== 'OFFLINE' && appState !== 'CHAT' && (
            <div className="absolute top-4 inset-x-4 z-20">
               <div className="bg-black text-white p-4 rounded-2xl shadow-xl border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full animate-pulse ${appState === 'ON_TRIP' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {appState === 'ON_TRIP' ? `Misión: ${tripPhase}` : 'Buscando Pedidos...'}
                     </p>
                  </div>
                  <p className="text-xs font-bold italic">$142.50</p>
               </div>
            </div>
          )}

          {/* Offline Splash */}
          {appState === 'OFFLINE' && (
            <div className="flex-1 flex flex-col bg-white z-10 items-center justify-center p-10 text-center animate-in fade-in">
               <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8 shadow-2xl">
                  <span className="text-white font-black text-5xl italic">P+</span>
               </div>
               <h2 className="text-3xl font-[900] tracking-tighter text-black uppercase mb-4 italic leading-tight">Estás fuera de línea</h2>
               <p className="text-sm text-black/40 font-medium px-10">Conéctate para recibir nuevos viajes y envíos prioritarios.</p>
            </div>
          )}

          {/* Bottom Sheet Interface */}
          <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none">
             
             {/* New Request Card */}
             {appState === 'ONLINE' && activeOrders.length > 0 && !currentOrder && (
                <div className="p-4 pointer-events-auto animate-in slide-in-from-bottom duration-500">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-black/5">
                      <div className="flex justify-between items-start mb-6">
                         <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase italic">Nuevo Viaje</span>
                         <p className="text-3xl font-black italic">${activeOrders[0].gananciaChofer}</p>
                      </div>
                      <p className="text-xs font-bold mb-8 opacity-60">Punto de retiro: {activeOrders[0].detalles}</p>
                      <button 
                        onClick={() => handleAccept(activeOrders[0])}
                        className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Aceptar
                      </button>
                   </div>
                </div>
             )}

             {/* On Trip Actions */}
             {appState === 'ON_TRIP' && liveOrder && (
                <div className="p-4 pointer-events-auto animate-in slide-in-from-bottom duration-500">
                   <div className="bg-white p-8 rounded-[3rem] shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-3xl overflow-hidden">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${liveOrder.nombreCliente}`} alt="u" />
                            </div>
                            <div>
                               <h4 className="text-lg font-black uppercase italic leading-none mb-1">{liveOrder.nombreCliente}</h4>
                               <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-extrabold uppercase rounded">
                                 {liveOrder.estado}
                               </span>
                            </div>
                         </div>
                         <button onClick={() => setAppState('CHAT')} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl">💬</button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border text-[9px] font-bold text-slate-500 uppercase leading-snug">
                         📍 Fase: {tripPhase === 'TO_PICKUP' ? 'Yendo al Comercio' : tripPhase === 'TO_DELIVERY' ? 'En viaje al Destinatario' : 'Llegaste al punto de entrega'}
                      </div>

                      {liveOrder.estado === EstadoPedido.ACEPTADO && (
                        <button 
                          onClick={() => {
                            if (onUpdateStatus) onUpdateStatus(liveOrder.id, EstadoPedido.EN_RETIRO);
                            setTripPhase('TO_DELIVERY');
                          }}
                          className="w-full py-5 rounded-2xl bg-black hover:bg-slate-800 text-white font-black uppercase tracking-wider text-xs"
                        >
                          Llegué a Comercio ➔
                        </button>
                      )}

                      {liveOrder.estado === EstadoPedido.EN_RETIRO && (
                        <button 
                          onClick={() => {
                            if (onUpdateStatus) onUpdateStatus(liveOrder.id, EstadoPedido.EN_CAMINO);
                            setTripPhase('ARRIVED');
                          }}
                          className="w-full py-5 rounded-2xl bg-black hover:bg-slate-800 text-white font-black uppercase tracking-wider text-xs"
                        >
                          Retirar Paquete e Iniciar Viaje ➔
                        </button>
                      )}

                      {liveOrder.estado === EstadoPedido.EN_CAMINO && (
                        <button 
                          onClick={handleStepStatus}
                          className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20"
                        >
                          Confirmar Entrega ➔
                        </button>
                      )}

                      {liveOrder.estado === EstadoPedido.ENTREGADO && (
                        <button 
                          onClick={handleStepStatus}
                          className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-indigo-600/20 animate-pulse"
                        >
                          Solicitar Liquidación Viáticos ➔
                        </button>
                      )}
                   </div>
                </div>
             )}

             {/* Main Toggle (Offline/Online) */}
             <div className={`bg-white border-t border-black/5 px-8 pt-8 pb-12 pointer-events-auto transition-transform duration-500 ${appState === 'ON_TRIP' || appState === 'CHAT' ? 'translate-y-full' : 'translate-y-0'}`}>
                <button 
                  onClick={() => setAppState(appState === 'OFFLINE' ? 'ONLINE' : 'OFFLINE')}
                  className={`w-full py-6 rounded-3xl font-black text-lg transition-all shadow-2xl uppercase tracking-widest italic flex items-center justify-center gap-4 ${appState === 'OFFLINE' ? 'bg-blue-600 text-white' : 'bg-black text-white'}`}
                >
                  {appState === 'OFFLINE' ? 'CONECTARSE' : 'DESCONECTARSE'}
                </button>
             </div>
          </div>
        </div>

        <div className="h-1.5 bg-black/10 w-1/3 mx-auto rounded-full mb-3"></div>
      </div>
      <button onClick={onClose} className="absolute top-10 right-10 text-white/40 hover:text-white text-4xl">✕</button>
    </div>
  );
};

export default MobileSimulator;
