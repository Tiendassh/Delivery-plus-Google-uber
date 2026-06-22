import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, X, Info, AlertTriangle } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'SUCCESS', title: 'Pedido Entregado', msg: 'El pedido #FLET-1102 fue entregado con éxito a Amalia Ortiz.', time: 'Hace 2 min', read: false },
    { id: 2, type: 'WARNING', title: 'Alta Demanda', msg: 'Zonas céntricas con alta demanda. Aprovechá tarifas dinámicas.', time: 'Hace 15 min', read: false },
    { id: 3, type: 'INFO', title: 'Nuevo mensaje de soporte', msg: 'Tenés una respuesta a tu ticket de ayer.', time: 'Hace 2 hs', read: true },
    { id: 4, type: 'DANGER', title: 'Alerta Operativa', msg: 'Precaución: Lluvia fuerte en zona sur.', time: 'Hace 3 hs', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircle className="text-dp-success w-5 h-5" />;
      case 'WARNING': return <AlertTriangle className="text-dp-warning w-5 h-5" />;
      case 'DANGER': return <AlertTriangle className="text-dp-danger w-5 h-5" />;
      case 'INFO': default: return <Info className="text-dp-primary w-5 h-5" />;
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative p-3 rounded-full bg-dp-surfaceLight border border-dp-border hover:bg-dp-border transition-colors">
        <Bell className="w-5 h-5 text-dp-text" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-dp-danger rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-dp-danger/30">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-dp-surface h-full border-l border-dp-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <header className="p-6 border-b border-dp-border flex justify-between items-center bg-dp-surfaceLight/50">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-dp-primary" />
                <h2 className="text-xl font-poppins font-bold text-dp-text">Notificaciones</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-dp-surfaceLight rounded-full hover:bg-dp-border text-dp-textMuted">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-4 flex gap-2 border-b border-dp-border">
              <button 
                onClick={() => setActiveTab('ALL')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'ALL' ? 'bg-dp-primary text-white' : 'bg-dp-surfaceLight text-dp-textMuted hover:bg-dp-border'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setActiveTab('UNREAD')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'UNREAD' ? 'bg-dp-primary text-white' : 'bg-dp-surfaceLight text-dp-textMuted hover:bg-dp-border'}`}
              >
                No Leídas ({unreadCount})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.filter(n => activeTab === 'ALL' || !n.read).map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl border ${notif.read ? 'bg-dp-surfaceLight border-dp-border' : 'bg-dp-primary/5 border-dp-primary/20'} flex gap-4 transition-all hover:bg-dp-border/50 cursor-default`}>
                  <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-poppins font-bold text-dp-text">{notif.title}</h4>
                    <p className="text-xs text-dp-textMuted mt-1 leading-relaxed">{notif.msg}</p>
                    <div className="flex items-center gap-1.5 mt-2 opacity-50">
                      <Clock className="w-3 h-3 text-dp-textMuted" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-dp-textMuted">{notif.time}</span>
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-dp-primary shrink-0 mt-2 shadow-[0_0_8px_rgba(38,102,255,0.8)]"></div>
                  )}
                </div>
              ))}
              
              {notifications.filter(n => activeTab === 'ALL' || !n.read).length === 0 && (
                <div className="text-center py-20 text-dp-textMuted">
                  <Bell className="w-12 h-12 mx-auto opacity-20 mb-4" />
                  <p className="text-sm font-bold uppercase">Sin notificaciones</p>
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="p-4 border-t border-dp-border bg-dp-surfaceLight">
                <button onClick={markAllAsRead} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-dp-primary hover:bg-dp-primary/10 rounded-xl transition-colors">
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
