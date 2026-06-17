
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { WeatherNow } from '../types';

interface Props {
  children: React.ReactNode;
  pestañaActiva: string;
  setPestañaActiva: (pestaña: string) => void;
  toast?: { message: string, type: 'error' | 'success' | 'info' } | null;
  onClearToast?: () => void;
}

const Estructura: React.FC<Props> = ({ children, pestañaActiva, setPestañaActiva, toast, onClearToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'ACTIVE' | 'PENDING'>('PENDING');
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  const pestañas = [
    { id: 'tablero', label: 'Menú Principal', icon: '⚡' },
    { id: 'flutter-vercel', label: 'Estrellas del Mes', icon: '🏆' },
    { id: 'comercios-turnos', label: 'Turnos Comercio', icon: '🏢' },
    { id: 'emprendedores', label: 'Emprendedores', icon: '🏠' },
    { id: 'voice-command', label: 'Vendedor IA', icon: '🤖' },
    { id: 'hybrid-support', label: 'Soporte Real', icon: '🤝' },
    { id: 'inscripcion', label: 'Inscripción', icon: '📝' },
    { id: 'billetera', label: 'Billetera', icon: '💰' },
    { id: 'quienes-somos', label: 'Quiénes Somos', icon: '👥' },
  ];

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'ACTIVE' : 'PENDING');
      }
    };
    
    const updateWeather = async () => {
      const w = await apiService.fetchWeather(-34.6037, -58.3816);
      setWeather(w);
    };

    checkKey();
    updateWeather();
    const interval = setInterval(() => {
      checkKey();
      updateWeather();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyConfig = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setKeyStatus('ACTIVE');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8FA] text-black">
      {toast && (
        <div className="fixed top-10 right-10 z-[300] bg-black text-white px-8 py-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-right duration-500 flex items-center gap-4">
           <span className="text-xl">ℹ️</span>
           <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* Hamburguesa floating button on mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-6 left-6 z-40 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-white/10 text-xl active:scale-95 transition-all text-center"
        id="btn-sidebar-open"
      >
        ☰
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-in fade-in duration-300"
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-black flex flex-col h-screen shadow-[20px_0_60px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:sticky md:top-0 md:translate-x-0
      `}>
        <div className="p-12 flex justify-between items-start">
          <div>
            <h1 className="text-[38px] font-[900] tracking-tighter text-white italic leading-none uppercase">Delivery<span className="text-plus-blue">Plus</span></h1>
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30 mt-4 leading-none italic">Neural Logistics Core</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-white/40 hover:text-white text-2xl focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Piloto Paraguas Engine */}
        <div className="px-10 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 backdrop-blur-md">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Weather Pulse</span>
                <span className={`w-2 h-2 rounded-full ${weather && weather.rainProb > 50 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-2xl">{weather && weather.rainProb > 50 ? '☔' : '☀️'}</span>
                <div>
                   <p className="text-[10px] font-black text-white uppercase italic">{weather?.summary || 'Sincronizando...'}</p>
                   <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Lluvia: {weather?.rainProb || 0}%</p>
                </div>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar">
          {pestañas.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setPestañaActiva(tab.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-5 px-8 py-5 text-[10px] font-black transition-all group ${
                pestañaActiva === tab.id 
                  ? 'bg-plus-blue text-white rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.3)]' 
                  : 'text-white/20 hover:text-white'
              }`}
            >
              <span className="text-xl transform group-hover:scale-110 transition-transform">{tab.icon}</span>
              <span className="uppercase tracking-[0.3em] italic">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2.5rem] border border-white/5 border-t-white/10">
            <div className="w-10 h-10 rounded-full bg-plus-blue flex items-center justify-center font-bold text-white shadow-lg italic overflow-hidden border border-white/20">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Transforme" alt="A" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Core Node</p>
              <p className="text-[7px] text-plus-blue font-black uppercase tracking-[0.3em] mt-1 italic">Synced v1.0.2</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-10 lg:p-16 max-w-[1800px] mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Estructura;
