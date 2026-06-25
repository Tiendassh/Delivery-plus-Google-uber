import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { SocioRepartidor, EstadoPedido, Pedido } from '../types';
import InteractiveMap from './InteractiveMap';
import { notificationService } from '../services/notificationService';
import VendedorIAChat from './VendedorIAChat';

interface EntrepreneurOrder {
  id: string | number;
  clientName: string;
  destination: string;
  packageDetails: string;
  payOnDelivery: number;
  deliveryFee: number;
  status: EstadoPedido;
  riderName: string;
  latOrigin: number;
  lngOrigin: number;
  latDest: number;
  lngDest: number;
}

import { voiceService } from '../services/voiceService';

const EmprendedoresView: React.FC = () => {
  const [enterpriseName, setEnterpriseName] = useState('Chocolates Artesanales Posadas');
  const [clientName, setClientName] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [packageDetails, setPackageDetails] = useState('');
  const [payAmount, setPayAmount] = useState('0');
  const [showIaChat, setShowIaChat] = useState(false);
  const [narratorVoice, setNarratorVoice] = useState<'valentina' | 'mateo'>('valentina');
  
  // Coordenadas origen (domicilio del emprendedor)
  const originLat = -27.375;
  const originLng = -55.905;

  // Destino preconfigurado seleccionable para simulación de mapa fácil
  const [selectedDest, setSelectedDest] = useState<number>(0);
  const destinationsGeo = [
    { name: 'Microcentro (Casi Plaza 9 de Julio)', lat: -27.365, lng: -55.892, dist: '1.6 km' },
    { name: 'Barrio Villa Sarita (Av. Roca)', lat: -27.356, lng: -55.888, dist: '2.5 km' },
    { name: 'Terminal de Transferencia Quaranta', lat: -27.399, lng: -55.931, dist: '4.1 km' },
    { name: 'Costanera Posadas (Casi Teatrito)', lat: -27.360, lng: -55.908, dist: '1.8 km' }
  ];

  const [drivers, setDrivers] = useState<SocioRepartidor[]>([]);
  const [activeOrders, setActiveOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignedDriver, setAssignedDriver] = useState<SocioRepartidor | null>(null);

  // Estados para simular el trayecto en el mapa
  const [simulatedRider, setSimulatedRider] = useState<{ lat: number; lng: number } | null>(null);
  const [simulationStep, setSimulationStep] = useState<'IDLE' | 'GOING_TO_PICKUP' | 'COLLECTED' | 'GOING_TO_DELIVERY' | 'COMPLETED'>('IDLE');

  const selectedGeo = destinationsGeo[selectedDest];
  const calculatedFee = 1600 + (Math.round(parseFloat(selectedGeo.dist) * 250));

  useEffect(() => {
    const fetchAndLoad = async () => {
      const d = await apiService.getDrivers();
      setDrivers(d.filter(r => r.etapaIngreso === 'ACTIVO'));

      const o = await apiService.fetchOrders();
      // Filtrar sólo pedidos de tipo PAQUETERIA creados recientemente
      setActiveOrders(o.filter(p => p.detalles.includes('Emprendedor') || (p as any).tipoEntrega === 'PAQUETERIA'));
    };
    fetchAndLoad();
  }, []);

  // Simulación interactiva del movimiento del chofer de Delivery Plus
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simulationStep === 'GOING_TO_PICKUP' && assignedDriver) {
      // Iniciar chofer en alguna coordenada cercana
      let currentLat = assignedDriver.latitud;
      let currentLng = assignedDriver.longitud;
      
      const stepInterval = setInterval(() => {
        // Moverse gradualmente hacia el Origen (-27.375, -55.905)
        const dLat = (originLat - currentLat) * 0.25;
        const dLng = (originLng - currentLng) * 0.25;
        
        currentLat += dLat;
        currentLng += dLng;
        
        setSimulatedRider({ lat: currentLat, lng: currentLng });

        if (Math.abs(currentLat - originLat) < 0.001 && Math.abs(currentLng - originLng) < 0.001) {
          clearInterval(stepInterval);
          setSimulationStep('COLLECTED');
          notificationService.playAlert('info');
          notificationService.notify("Paquete Retirado", `El chofer retiró el producto de tu domicilio.`);
          
          const audioText = `¿Qué onda, che? ¡Ya retiramos tu paquete! El chofer va volando con destino a ${selectedGeo.name}.`;
          voiceService.speak(audioText, narratorVoice);

          // Siguiente paso: ir al destino
          setTimeout(() => {
            setSimulationStep('GOING_TO_DELIVERY');
          }, 2000);
        }
      }, 800);

      return () => clearInterval(stepInterval);
    }

    if (simulationStep === 'GOING_TO_DELIVERY' && assignedDriver) {
      let currentLat = originLat;
      let currentLng = originLng;
      const destLat = selectedGeo.lat;
      const destLng = selectedGeo.lng;

      const stepInterval = setInterval(() => {
        // Moverse hacia el Destino
        const dLat = (destLat - currentLat) * 0.25;
        const dLng = (destLng - currentLng) * 0.25;
        
        currentLat += dLat;
        currentLng += dLng;
        
        setSimulatedRider({ lat: currentLat, lng: currentLng });

        if (Math.abs(currentLat - destLat) < 0.001 && Math.abs(currentLng - destLng) < 0.001) {
          clearInterval(stepInterval);
          setSimulationStep('COMPLETED');
          notificationService.playAlert('success');
          notificationService.notify("Envío Entregado", `¡Tu cliente recibió el paquete de Chocolates Artesanales!`);
          
          const audioText = `¡Posta, excelente noticia! El paquete para ${clientName} ya fue entregado en tiempo récord en Posadas.`;
          voiceService.speak(audioText, narratorVoice);

          // Actualizar en el historial
          apiService.fetchOrders().then(o => {
            setActiveOrders(o.filter(p => p.detalles.includes('Emprendedor') || (p as any).tipoEntrega === 'PAQUETERIA'));
          });
        }
      }, 800);

      return () => clearInterval(stepInterval);
    }
  }, [simulationStep, assignedDriver]);

  const handleRequestSoloDelivery = async () => {
    if (!clientName.trim() || !packageDetails.trim()) {
      alert("Por favor completa el destinatario y detalles del paquete.");
      return;
    }

    setLoading(true);
    notificationService.playAlert('info');

    // Seleccionar un rider disponible al azar para el servicio exprés
    const availableDriver = drivers.length > 0 ? drivers[Math.floor(Math.random() * drivers.length)] : null;
    setAssignedDriver(availableDriver);

    const price = calculatedFee;

    const newOrderPayload = {
      nombreCliente: clientName,
      detalles: `[Emprendedor] ${packageDetails}`,
      monto: price + parseFloat(payAmount),
      estado: EstadoPedido.PENDIENTE,
      latitud: originLat,
      longitud: originLng,
      latUsuario: selectedGeo.lat,
      lngUsuario: selectedGeo.lng,
      tipoEntrega: 'PAQUETERIA',
      idRepartidor: availableDriver ? availableDriver.id : null
    };

    // Registrar pedido en la base
    const registeredOrder = await apiService.createOrder(newOrderPayload);

    const triggerAudio = `¡Perfecto, che! Ya pedimos tu flete exprés para ${clientName}. El chofer ${availableDriver ? availableDriver.nombre : 'de Delivery Plus'} va rumbo a tu casa.`;
    voiceService.speak(triggerAudio, narratorVoice);

    setTimeout(() => {
      setLoading(false);
      setSimulationStep('GOING_TO_PICKUP');
      
      // Auto-aceptar pedido por el repartidor asignado
      if (availableDriver && registeredOrder) {
        apiService.updateOrder(Number(registeredOrder.id), EstadoPedido.ACEPTADO);
      }

      notificationService.notify(
        "Rider Asignado Exclusivo",
        availableDriver 
          ? `${availableDriver.nombre} está en camino a tu domicilio para retirar el paquete.`
          : "Buscando repartidores cercanos libres..."
      );

      // Recargar lista
      apiService.fetchOrders().then(o => {
        setActiveOrders(o.filter(p => p.detalles.includes('Emprendedor') || (p as any).tipoEntrega === 'PAQUETERIA'));
      });
    }, 1500);
  };

  // Armar lista de repartidores a renderizar en mapa
  const mapDrivers = assignedDriver ? [
    {
      ...assignedDriver,
      latitud: simulatedRider ? simulatedRider.lat : assignedDriver.latitud,
      longitud: simulatedRider ? simulatedRider.lng : assignedDriver.longitud
    }
  ] : drivers;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Header */}
      <div className="bg-[#0A0A0B] p-12 rounded-[4rem] text-white border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Módulo Emprendedor • Envíos Flexibles</p>
            </div>
            <h2 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
              Despacho <span className="text-emerald-500">Express</span>
            </h2>
            <p className="text-slate-400 mt-4 text-sm max-w-xl font-medium">
              Vendes desde casa, pides un repartidor desde la web. Sin mínimos, sin contratos forzosos. Paga por unidad por cada envío solicitado con narración de voz inteligente en tiempo real.
            </p>
          </div>
          <div className="bg-white/5 px-8 py-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <div>
              <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1 font-bold">Cobro por Envío</p>
              <p className="text-xl font-black text-emerald-500 italic">Precios del Barrio</p>
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
        <div className="absolute -bottom-20 -right-20 text-[20rem] opacity-[0.02] font-black pointer-events-none italic">1ENVIO</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Panel Izquierdo: Datos del despacho */}
        <div className="lg:col-span-5 bg-white p-10 md:p-12 rounded-[5rem] border border-black/5 shadow-2xl space-y-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2.5xl font-black italic uppercase tracking-tighter border-b border-black/5 pb-4 mb-6">
              Solicitar Rider
            </h3>

            <div className="space-y-6">
              
              {/* Origen (Fijo - trabaja en domicilio) */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5 relative">
                <span className="absolute top-6 right-8 text-xs font-black uppercase tracking-widest text-emerald-500">MÍO 🏠</span>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Origen / Tu Casa</label>
                <input 
                  type="text" 
                  value={enterpriseName}
                  onChange={e => setEnterpriseName(e.target.value)}
                  className="w-full bg-transparent border-none text-base font-bold text-black focus:ring-0 focus:outline-none"
                  placeholder="Nombre de tu emprendimiento"
                />
              </div>

              {/* Destinatario */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Cliente Destinatario</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-transparent border-none text-base font-bold text-black focus:ring-0 focus:outline-none"
                  placeholder="Ej. Juan Manuel"
                />
              </div>

              {/* Selección Geográfica Posadas */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Zona y Destino de Envío</label>
                <select 
                  value={selectedDest}
                  onChange={e => setSelectedDest(Number(e.target.value))}
                  className="w-full bg-transparent border-none text-base font-bold text-black focus:ring-0 focus:outline-none"
                >
                  {destinationsGeo.map((dest, i) => (
                    <option key={i} value={i}>{dest.name} ({dest.dist})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Detalles de paquete */}
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Paquete</label>
                  <input 
                    type="text" 
                    value={packageDetails}
                    onChange={e => setPackageDetails(e.target.value)}
                    className="w-full bg-transparent border-none text-sm font-bold text-black focus:ring-0 focus:outline-none"
                    placeholder="Ej. 1 docena donas"
                  />
                </div>

                {/* Importe a cobrar contra entrega */}
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-black/5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block font-bold">Cobrar al Entregar ($)</label>
                  <input 
                    type="number" 
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-transparent border-none text-sm font-bold text-black focus:ring-0 focus:outline-none"
                    placeholder="0 si ya pagó"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-8 border-t border-black/5 mt-8">
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Costo del Envío ({selectedGeo.dist}):</span>
              <span className="text-3xl font-black text-emerald-500 italic">${calculatedFee.toLocaleString('es-AR')}</span>
            </div>
            
            <button 
              onClick={handleRequestSoloDelivery}
              disabled={loading}
              className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] disabled:opacity-50"
            >
              {loading ? 'Sincronizando Satélite...' : 'Solicitar Rider Exprés'}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Mapa en Vivo + Envíos Unitarios Solicitados */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          
          {/* Mapa Interactivo con tracking del rider exprés */}
          <div className="bg-white p-6 rounded-[5rem] border border-black/5 shadow-2xl overflow-hidden h-[450px] relative">
            <div className="absolute top-10 right-10 z-20 bg-emerald-500 px-4 py-2 rounded-xl text-white text-[8px] font-black tracking-widest uppercase">
              {simulationStep === 'IDLE' ? 'SEGUIMIENTO EN ESPERA' : `ESTADO: ${simulationStep}`}
            </div>
            <InteractiveMap 
              center="-27.368,-55.895"
              stores={[]}
              drivers={mapDrivers}
              className="w-full h-full rounded-[4.2rem]"
              pickup={{ lat: originLat, lng: originLng }}
              delivery={{ lat: selectedGeo.lat, lng: selectedGeo.lng }}
              showRiskZones={false}
            />
          </div>

          {/* Listado de Envíos del Emprendedor */}
          <div className="bg-white p-10 rounded-[5rem] border border-black/5 shadow-2xl flex-1">
            <h4 className="text-xl font-black italic uppercase tracking-widest mb-6 text-black">
              Envíos Recientes de tu Negocio ({activeOrders.length})
            </h4>
            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
              {activeOrders.map((ord, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-black/5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/30 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-emerald-555/10 text-emerald-600 font-extrabold text-[7px] uppercase tracking-widest rounded-full">
                        ID: #{String(ord.id).slice(-4)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{ord.estado}</span>
                    </div>
                    <p className="text-sm font-black uppercase text-gray-900">{ord.nombreCliente}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">{ord.detalles}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-lg font-black italic text-gray-900">${ord.monto.toLocaleString()}</p>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                        ● Envío por Unidad
                      </span>
                    </div>
                    <button
                      onClick={() => voiceService.speak(`Pedido para ${ord.nombreCliente} con estado ${ord.estado}. Contiene ${ord.detalles}`, narratorVoice)}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs shadow-sm active:scale-90 transition-all"
                      title="Escuchar detalles del pedido con acento argentino"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
              {activeOrders.length === 0 && (
                <p className="text-center py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Aún no realizaste solicitudes hoy
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

export default EmprendedoresView;
