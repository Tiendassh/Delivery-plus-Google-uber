
import React, { useState, useEffect, useCallback } from 'react';
import Estructura from './components/Layout';
import OrderManagementView from './components/OrderManagementView';
import VoiceCommandCenter from './components/VoiceCommandCenter';
import HybridSupportView from './components/HybridSupportView';
import StoreOnboardingView from './components/StoreOnboardingView';
import DriverOnboardingView from './components/DriverOnboardingView';
import RegistrationZoneView from './components/RegistrationZoneView';
import WalletView from './components/WalletView';
import AboutUsView from './components/AboutUsView';
import MobileSimulator from './components/MobileSimulator';
import LoginView from './components/LoginView';
import ComerciosTurnosView from './components/ComerciosTurnosView';
import EmprendedoresView from './components/EmprendedoresView';
import VercelLandingView from './components/VercelLandingView';
import InfoLandingView from './components/InfoLandingView';
import { apiService } from './services/apiService';
import { notificationService } from './services/notificationService';
import { Pedido, EstadoPedido, SocioRepartidor, Comercio } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [pestañaActiva, setPestañaActiva] = useState('tablero');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [repartidores, setRepartidores] = useState<SocioRepartidor[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setCargando(true);
    try {
      const [o, d, c] = await Promise.all([
        apiService.fetchOrders().catch(() => []),
        apiService.getDrivers().catch(() => []),
        apiService.getStores().catch(() => [])
      ]);
      
      // Lógica de notificación si cambia el estado del primer pedido (demo)
      if (pedidos.length > 0 && o.length > 0 && o[0].estado !== pedidos[0].estado) {
        notificationService.notify("Actualización de Red", `Pedido #${o[0].id} ahora está ${o[0].estado}`);
      }

      setPedidos(o as Pedido[]);
      setRepartidores(d as SocioRepartidor[]);
      setComercios(c as Comercio[]);
    } catch (err) { 
      console.warn("[Delivery Plus] Sincronización local activa."); 
    } finally { 
      setCargando(false); 
    }
  }, [pedidos]);

  useEffect(() => { 
    if (user) {
      fetchData();
      notificationService.requestPermission();
      const interval = setInterval(() => fetchData(true), 20000); 
      return () => clearInterval(interval);
    }
  }, [fetchData, user]);

  if (!user) return <LoginView onLogin={setUser} />;

  if (cargando && pedidos.length === 0) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="relative">
         <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase animate-pulse tracking-tighter relative z-10">Delivery<span className="text-plus-blue">Plus</span></h1>
         <div className="absolute -inset-10 bg-plus-blue/10 blur-[100px] rounded-full"></div>
      </div>
      <div className="mt-12 flex flex-col items-center">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
           <div className="h-full bg-plus-blue animate-[shimmer_2s_infinite_linear] w-1/3"></div>
        </div>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em] animate-pulse">Autenticando Nodo Central...</p>
      </div>
    </div>
  );

  return (
    <Estructura 
      pestañaActiva={pestañaActiva} 
      setPestañaActiva={setPestañaActiva}
      toast={toast}
      onClearToast={() => setToast(null)}
    >
      {pestañaActiva === 'tablero' && (
        <OrderManagementView 
          pedidos={pedidos} 
          repartidores={repartidores} 
          onAssign={(oid, did) => {
            notificationService.playAlert('success');
            apiService.assignOrder(oid, did).then(() => fetchData(true));
          }} 
          onUpdateStatus={(oid, status) => {
            notificationService.playAlert('info');
            apiService.updateOrder(oid, status).then(() => fetchData(true));
          }} 
        />
      )}
      {pestañaActiva === 'comercios-turnos' && <ComerciosTurnosView />}
      {pestañaActiva === 'flutter-vercel' && <VercelLandingView />}
      {pestañaActiva === 'info-landing' && <InfoLandingView />}
      {pestañaActiva === 'emprendedores' && <EmprendedoresView />}
      {pestañaActiva === 'voice-command' && <VoiceCommandCenter />}
      {pestañaActiva === 'hybrid-support' && <HybridSupportView />}
      {pestañaActiva === 'inscripcion' && <RegistrationZoneView setPestañaActiva={setPestañaActiva} />}
      {pestañaActiva === 'alta-socio' && <DriverOnboardingView />}
      {pestañaActiva === 'alta-comercio' && <StoreOnboardingView />}
      {pestañaActiva === 'billetera' && <WalletView />}
      {pestañaActiva === 'quienes-somos' && <AboutUsView />}

      <button 
        onClick={() => setShowSimulator(true)}
        className="fixed bottom-10 right-10 z-[100] bg-black text-white px-8 py-6 rounded-[2.5rem] shadow-2xl font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:scale-105 transition-all border border-white/10"
      >
        <span className="text-xl">🛵</span>
        Simulador
      </button>

      {repartidores.length > 0 && (
        <MobileSimulator 
          isOpen={showSimulator}
          onClose={() => setShowSimulator(false)}
          driver={repartidores[0]}
          activeOrders={pedidos.filter(p => p.estado === EstadoPedido.ACEPTADO || p.estado === EstadoPedido.PENDIENTE)}
          onOrderAccepted={(id) => apiService.updateOrder(id, EstadoPedido.ACEPTADO).then(() => fetchData(true))}
          onOrderDelivered={(id) => {
            notificationService.notify("Pedido Entregado", `El pedido #${id} ha sido completado.`);
            apiService.updateOrder(id, EstadoPedido.ENTREGADO).then(() => fetchData(true));
          }}
        />
      )}
    </Estructura>
  );
};

export default App;
