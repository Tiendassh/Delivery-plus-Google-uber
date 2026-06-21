
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import { UserRole } from './types';
import LoginView from './components/LoginView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { RepartidorConsoleView } from './components/RepartidorConsoleView';
import { ComercioConsoleView } from './components/ComercioConsoleView';
import { EmprendedorConsoleView } from './components/EmprendedorConsoleView';
import { AssistantIAView } from './components/AssistantIAView';
import WalletView from './components/WalletView';
import MobileSimulator from './components/MobileSimulator';
import DriverReputationView from './components/DriverReputationView';
// Additional components as needed
import { apiService } from './services/apiService';
import { notificationService } from './services/notificationService';
import { Pedido, EstadoPedido, SocioRepartidor, Comercio } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  
  const [activeRole, setActiveRole] = useState<UserRole>('REPARTIDOR');
  const [activeView, setActiveView] = useState<string>('inicio');
  
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [repartidores, setRepartidores] = useState<SocioRepartidor[]>([]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setCargando(true);
    try {
      const [o, d, c] = await Promise.all([
        apiService.fetchOrders().catch(() => []),
        apiService.getDrivers().catch(() => []),
        apiService.getStores().catch(() => [])
      ]);
      setPedidos(o as Pedido[]);
      setRepartidores(d as SocioRepartidor[]);
      setComercios(c as Comercio[]);
    } catch (err) { 
      console.warn("[Delivery Plus] Sincronización local activa."); 
    } finally { 
      setCargando(false); 
    }
  }, []);

  useEffect(() => { 
    if (user) {
      fetchData();
      notificationService.requestPermission();
      const interval = setInterval(() => fetchData(true), 20000); 
      return () => clearInterval(interval);
    }
  }, [fetchData, user]);

  const handleUpdateOrderStatus = async (oid: any, status: EstadoPedido) => {
    try {
      await apiService.updateOrder(oid, status);
      setToast({ message: `Pedido ${status}`, type: 'success' });
      fetchData(true);
    } catch (err) {
      setToast({ message: "Error al actualizar", type: 'error' });
    }
  };

  if (!user) return <LoginView onLogin={setUser} />;

  if (cargando && pedidos.length === 0) return (
    <div className="h-screen bg-dp-background flex flex-col items-center justify-center">
       <h1 className="text-4xl font-black text-white italic animate-pulse">Delivery<span className="text-dp-primary">Plus</span></h1>
    </div>
  );

  return (
    <Layout 
      activeRole={activeRole}
      setActiveRole={setActiveRole}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {/* Dynamic Views based on activeView and activeRole */}
      <div className="p-6">
        
        {activeView === 'inicio' && activeRole === 'REPARTIDOR' && (
          <RepartidorConsoleView
            pedidos={pedidos}
            repartidor={repartidores[0] || { id: 'test', nombre: 'Carlos G.', gananciasSemanales: 28400, patente: 'A023BC4', vehiculo: 'Moto Honda', nivel: 'ORO' }}
            onAcceptOrder={(oid) => {
              apiService.assignOrder(oid, repartidores[0]?.id || '1').then(() => fetchData(true));
            }}
            onAcceptShift={() => {}}
          />
        )}

        {activeView === 'inicio' && activeRole === 'COMERCIO' && (
          <ComercioConsoleView
            repartidores={repartidores}
            onCreatePedido={() => {}}
            onCreateTurno={() => {}}
            onContratarRepartidor={() => {}}
          />
        )}
        
        {activeView === 'inicio' && activeRole === 'EMPRENDEDOR' && (
          <EmprendedorConsoleView
            repartidores={repartidores}
            onCreatePedido={() => {}}
            onContratarRepartidor={() => {}}
          />
        )}

        {activeView === 'inicio' && activeRole === 'ADMINISTRADOR' && (
          <AdminConsoleView 
            pedidos={pedidos}
            repartidores={repartidores}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
        
        {activeView === 'billetera' && <WalletView />}
        
        {activeRole === 'IA_ASISTENTE' && activeView === 'chat' && <AssistantIAView />}
        
        {/* Fill other sections smoothly inside the new dark theme */}
        {activeView === 'perfil' && (
           <DriverReputationView drivers={repartidores} />
        )}
        
      </div>
    </Layout>
  );
};

export default App;
