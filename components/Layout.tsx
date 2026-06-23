
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Menu, Home, Briefcase, Calendar, Wallet, User, Shield, Package, Store, Bot, X } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface Props {
  children: React.ReactNode;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<Props> = ({ children, activeRole, setActiveRole, activeView, setActiveView }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const roles: { id: UserRole; label: string; icon: any }[] = [
    { id: 'REPARTIDOR', label: 'Repartidor', icon: Shield },
    { id: 'COMERCIO', label: 'Comercio', icon: Store },
    { id: 'EMPRENDEDOR', label: 'Emprendedor', icon: Package },
    { id: 'ADMINISTRADOR', label: 'Administrador', icon: Briefcase },
    { id: 'IA_ASISTENTE', label: 'IA Asistente', icon: Bot },
  ];

  const getNavItems = () => {
    // Base 5 items as requested
    const items = [
      { id: 'inicio', label: 'Inicio', icon: Home },
    ];
    if (activeRole === 'REPARTIDOR') {
      items.push({ id: 'trabajos', label: 'Trabajos', icon: Briefcase });
      items.push({ id: 'turnos', label: 'Turnos', icon: Calendar });
    } else if (activeRole === 'COMERCIO' || activeRole === 'EMPRENDEDOR') {
      items.push({ id: 'pedidos', label: 'Pedidos', icon: Package });
      items.push({ id: 'historial', label: 'Historial', icon: Calendar });
    } else if (activeRole === 'ADMINISTRADOR') {
       items.push({ id: 'usuarios', label: 'Usuarios', icon: User });
       items.push({ id: 'reportes', label: 'Reportes', icon: Calendar });
    } else if (activeRole === 'IA_ASISTENTE') {
       items.push({ id: 'chat', label: 'Chat', icon: Bot });
       items.push({ id: 'consultas', label: 'Consultas', icon: Package });
    }
    
    items.push({ id: 'billetera', label: 'Billetera', icon: Wallet });
    items.push({ id: 'perfil', label: 'Perfil', icon: User });
    
    return items.slice(0, 5); // Ensure exactly 5
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col min-h-screen bg-dp-background text-dp-text font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-dp-surface/80 backdrop-blur-lg border-b border-dp-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-dp-surfaceLight transition-colors">
            <Menu size={24} className="text-dp-text" />
          </button>
          <h1 className="text-xl font-poppins font-bold flex items-center gap-2">
            Delivery<span className="text-dp-primary">Plus</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-dp-surfaceLight border border-dp-border rounded-full text-xs font-semibold text-dp-textMuted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dp-success animate-pulse"></span>
            {roles.find(r => r.id === activeRole)?.label || activeRole}
          </div>
          <NotificationCenter />
        </div>
      </header>

      {/* Side Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-80 bg-dp-surface h-full flex flex-col border-r border-dp-border animate-in slide-in-from-left duration-300">
            <div className="p-6 flex justify-between items-center border-b border-dp-border">
               <h2 className="text-lg font-poppins font-bold text-dp-textMuted">Cambiar Rol</h2>
               <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-lg hover:bg-dp-surfaceLight">
                 <X size={20} />
               </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
               {roles.map(role => {
                 const Icon = role.icon;
                 const isActive = activeRole === role.id;
                 return (
                   <button
                     key={role.id}
                     onClick={() => {
                       setActiveRole(role.id);
                       setActiveView('inicio');
                       setIsDrawerOpen(false);
                     }}
                     className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-colors ${
                       isActive ? 'bg-dp-primary text-white shadow-lg shadow-dp-primary/20 bg-opacity-90' : 'text-dp-textMuted hover:text-white hover:bg-dp-surfaceLight'
                     }`}
                   >
                     <Icon size={20} className={isActive ? "text-white" : "text-dp-textMuted group-hover:text-white"} />
                     {role.label}
                   </button>
                 );
               })}

               <div className="my-4 border-t border-dp-border"></div>

               <button
                 onClick={() => {
                   setActiveView('voz_ia');
                   setIsDrawerOpen(false);
                 }}
                 className="w-full flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-colors text-dp-textMuted hover:text-white hover:bg-dp-surfaceLight"
               >
                 <Bot size={20} className="text-dp-textMuted group-hover:text-white" />
                 Configuración Voz IA
               </button>

               <button
                 onClick={() => {
                   setActiveView('acerca');
                   setIsDrawerOpen(false);
                 }}
                 className="w-full flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-colors text-dp-textMuted hover:text-white hover:bg-dp-surfaceLight"
               >
                 <Shield size={20} className="text-dp-textMuted group-hover:text-white" />
                 Acerca de Delivery Plus
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dp-surface/90 backdrop-blur-xl border-t border-dp-border pb-safe">
        <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${
                  isActive ? 'text-dp-primary' : 'text-dp-textMuted hover:text-dp-text'
                }`}
              >
                <Icon size={24} className={isActive ? "fill-dp-primary/20" : ""} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};

export default Layout;
