import React from 'react';
import { motion } from 'motion/react';
import { notificationService } from '../services/notificationService';

const InfoLandingView: React.FC = () => {
  const handleLinkAlert = (title: string) => {
    notificationService.playAlert('info');
    notificationService.notify(
      "Navegando a la Landing",
      `Abriendo la landing page oficial de Delivery Plus: ${title}`
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24 text-white bg-black -mx-10 md:-mx-16 p-10 md:p-16 min-h-screen relative overflow-hidden">
      
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111113_1px,transparent_1px),linear-gradient(to_bottom,#111113_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-60"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-plus-blue/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Info */}
      <div className="relative z-10 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">INFORMACIÓN DE DESPLIEGUE</span>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1 uppercase italic leading-none">
            VERCEL LANDING HUB
          </h2>
          <p className="text-white/50 text-xs mt-2 font-medium">
            Central de documentación, enlaces operacionales y estado en tiempo real de la landing corporativa.
          </p>
        </div>
        
        <a 
          href="https://landing-deliveryplus-1nvy.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => handleLinkAlert('Landing v2')}
          className="px-6 py-4 bg-white text-black hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
          id="btn-link-landing-top"
        >
          Visitar Landing Page <span>🚀</span>
        </a>
      </div>

      {/* Core Vercel Info Card */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left main info */}
        <div className="lg:col-span-7 bg-[#09090b] border border-white/10 rounded-[3rem] p-10 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-white/5 rounded-full blur-[80px] group-hover:bg-plus-blue/10 transition-all duration-700"></div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Sincronizado con GitHub & Vercel Edge
            </div>

            <h3 className="text-4xl font-extrabold italic uppercase leading-none tracking-tight">
              Diseño de Vanguardia <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-plus-blue to-emerald-400">
                Optimizado para Conversión
              </span>
            </h3>

            <p className="text-white/60 text-sm leading-relaxed font-medium">
              Nuestra landing page en Vercel actúa como el portal de captación automatizado de Delivery Plus en la ciudad de Posadas. Se encarga de catalogar y canalizar las tres grandes vertientes operativas del ecosistema:
            </p>

            {/* Vertientes cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <span className="text-2xl">🏢</span>
                <h4 className="text-xs font-black uppercase mt-3">Comercios</h4>
                <p className="text-[10px] text-white/40 mt-1">Suscripción a turnos de guardias con fletes estables.</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <span className="text-2xl">🛍️</span>
                <h4 className="text-xs font-black uppercase mt-3">Emprendedores</h4>
                <p className="text-[10px] text-white/40 mt-1">Envíos express inmediatos con pasarelas de pago integradas.</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <span className="text-2xl">🏍️</span>
                <h4 className="text-xs font-black uppercase mt-3">Repartidores</h4>
                <p className="text-[10px] text-white/40 mt-1">Inscripción veloz de flotas independientes con uniformes.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Dominio Oficial Compilado</p>
              <p className="text-sm font-mono text-emerald-400 font-bold">landing-deliveryplus-1nvy.vercel.app</p>
            </div>
            
            <a 
              href="https://landing-deliveryplus-1nvy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkAlert('Landing v2')}
              className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] tracking-wider uppercase rounded-xl transition-all"
              id="btn-link-landing-inline"
            >
              Abrir URL Externa ↗
            </a>
          </div>
        </div>

        {/* Right metrics and status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Lighthouse metrics widget */}
          <div className="bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h4 className="text-[10px] font-black tracking-widest text-white/30 uppercase">METRICAS DE VELOCIDAD DE BORDE (VERCEL KPI)</h4>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-lg font-mono font-black text-emerald-400">100</p>
                <p className="text-[8px] font-black text-white/40 uppercase mt-1">FCP</p>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-lg font-mono font-black text-emerald-400">99</p>
                <p className="text-[8px] font-black text-white/40 uppercase mt-1">SEO</p>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-lg font-mono font-black text-emerald-400">100</p>
                <p className="text-[8px] font-black text-white/40 uppercase mt-1">PERF</p>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-lg font-mono font-black text-emerald-400">100</p>
                <p className="text-[8px] font-black text-white/40 uppercase mt-1">B.P.</p>
              </div>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed font-semibold">
              La arquitectura estática pura nos otorga tiempos de carga inferiores a 240ms a nivel global, eliminando la latencia de primer byte en Posadas.
            </p>
          </div>

          {/* Integration Status Card */}
          <div className="bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 space-y-6 flex-1 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-widest text-[#A855F7] uppercase">BENEFICIOS DE LA ARQUITECTURA</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Soporte Offline Garantizado</h5>
                    <p className="text-[9px] text-white/40">Cacheo progresivo local para mantener visuales sin red de datos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Capas Gráficas vectoriales</h5>
                    <p className="text-[9px] text-white/40">Iconografías y mapas reactivos de alto contraste.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Píxeles de Conversión Inteligente</h5>
                    <p className="text-[9px] text-white/40">Telemetría de pre-inscripciones de fletes sin fugas de datos.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center mt-4">
              <span className="text-[9px] font-black text-white/50 uppercase">CONECTIVIDAD SSL</span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-[8px] font-extrabold uppercase rounded-full border border-emerald-500/10">SEGURO</span>
            </div>
          </div>

        </div>

      </div>

      {/* Visual Embed Box / Mock Frame representing the Landing page website live */}
      <div className="relative z-10 bg-[#0B0B0D] p-8 md:p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-sm font-black tracking-widest text-white/40 uppercase">LIVE SITE PREVIEW</h4>
            <p className="text-xs text-white/60 mt-1">Vista del mapa interactivo de conversiones y beneficios de la landing page.</p>
          </div>
          
          <span className="text-xs px-3 py-1.5 bg-white/5 rounded-xl text-white/60 font-semibold">
            ESTADO DIGITAL: ONLINE
          </span>
        </div>

        {/* Visual Simulated Web Showcase with Cards */}
        <div className="bg-black rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
            </div>
            <div className="px-4 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-mono text-white/55 truncate max-w-xs">
              https://landing-deliveryplus-1nvy.vercel.app
            </div>
            <span className="text-xs">🔒</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
              <span className="px-2 py-0.5 bg-plus-blue/10 text-plus-blue text-[8px] font-black uppercase tracking-widest rounded-md">Vercel Deployment v2</span>
              <h5 className="text-2xl font-black italic text-white leading-tight uppercase">MÁS CONTROL. MENOS LOGÍSTICA.</h5>
              <p className="text-xs text-white/40 leading-relaxed font-semibold">
                Automatiza los despachos de fletes, cubrí tus picos de demanda diaria con contratos fijos estables con conductores verificados, y procesá tus pagos con total seguridad en la ciudad de Posadas.
              </p>
              
              <div className="pt-2 flex gap-3">
                <a 
                  href="https://landing-deliveryplus-1nvy.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-black text-[10px] uppercase tracking-wider text-black rounded-lg transition-all"
                  id="btn-preview-landing-primary"
                >
                  Registrar mi Negocio
                </a>
                <a 
                  href="https://landing-deliveryplus-1nvy.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 font-black text-[10px] uppercase tracking-wider text-white rounded-lg transition-all"
                  id="btn-preview-landing-secondary"
                >
                  Ver Tarifas
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-6 bg-white/5 border border-white/5 rounded-2xl overflow-hidden min-h-[160px]">
              <div className="absolute inset-0 bg-plus-blue/5 animate-pulse rounded-2xl"></div>
              <div className="text-center relative z-10 space-y-2">
                <span className="text-3xl text-emerald-400">🗺️</span>
                <h6 className="text-[11px] font-black uppercase text-white">Mapa de Red de Posadas ACTIVO</h6>
                <p className="text-[10px] text-white/40">Visita la landing page para ver los fletes y repartidores activos geolocalizados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InfoLandingView;
