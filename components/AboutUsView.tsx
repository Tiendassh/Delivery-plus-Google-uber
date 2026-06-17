import React, { useState } from 'react';

const AboutUsView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-12">
      <header className="mb-12">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-black leading-none mb-4">
          Quiénes <span className="text-plus-blue">Somos</span>
        </h2>
        <p className="text-xl text-gray-600 font-medium max-w-3xl">
          Conectando comercios locales, repartidores independientes y clientes a través de una plataforma tecnológica eficiente y transparente, nacida en Argentina.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🇦🇷
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">Nuestra Misión</h3>
          <p className="text-gray-600 leading-relaxed">
            En Delivery Plus, nuestra misión es democratizar el acceso a la logística de última milla para los comercios de barrio, al mismo tiempo que brindamos una oportunidad de ingresos flexible y justa para los repartidores. Creemos en el poder de la tecnología para impulsar la economía local.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🚀
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">Nuestra Visión</h3>
          <p className="text-gray-600 leading-relaxed">
            Ser la plataforma de delivery líder en la región, reconocida por su transparencia, bajas comisiones y excelente soporte humano y tecnológico. Queremos ser el socio estratégico número uno de cada emprendedor gastronómico y comercial.
          </p>
        </div>
      </div>

      <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl mt-12">
        <h3 className="text-4xl font-black italic uppercase tracking-tight mb-8 text-center">¿Cómo funciona nuestro servicio?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🏪
            </div>
            <h4 className="text-xl font-bold mb-3">Para Comercios</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Te damos una vitrina digital. Recibís pedidos directamente en nuestra plataforma, los preparás y nosotros nos encargamos de enviar a un repartidor para que llegue rápido y seguro a tu cliente.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🛵
            </div>
            <h4 className="text-xl font-bold mb-3">Para Repartidores</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Te conectás cuando querés. Aceptás los pedidos que te convienen, recogés el paquete en el comercio y lo entregás. Ganás dinero por cada viaje completado, con liquidaciones claras.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              📱
            </div>
            <h4 className="text-xl font-bold mb-3">Para Clientes</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Exploran los mejores locales de su zona, piden lo que necesitan con unos pocos clics y siguen su pedido en tiempo real hasta la puerta de su casa.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-black/5 mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight mb-2">¿Listo para sumarte?</h3>
          <p className="text-gray-600">Conocé los requisitos y empezá a operar con nosotros hoy mismo.</p>
        </div>
        <button 
          onClick={() => document.querySelector('button:has(span:contains("Inscripción"))')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
          className="bg-plus-blue hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-colors whitespace-nowrap"
        >
          Ir a Inscripción
        </button>
      </div>

      {/* SECCIÓN EXCLUSIVA: PORTAL WEB & QR ACCESIBLE */}
      <div className="bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl mt-12 overflow-hidden relative group border border-white/5">
        {/* Decorative background effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Text block & Link */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-[#38BDF8] text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
              <span>🚀</span> PRESENCIA WEB DE SOCIOS
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic uppercase leading-none tracking-tight">
              Explorá nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-[#38BDF8]">Landing Page</span> oficial
            </h3>
            <p className="text-white/70 text-sm leading-relaxed font-semibold max-w-xl">
              Descubrí nuestro portal interactivo optimizado para comercios locales y residentes. Accedé al portal oficial publicado en Vercel para visualizar la cobertura completa de fletes y logística inteligente en Misiones.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="https://landing-deliveryplus-1nvy.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#38BDF8] hover:bg-sky-400 text-slate-900 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-[0_10px_20px_rgba(56,189,248,0.2)]"
              >
                <span>🔗</span> Ir a la Landing Page
              </a>
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-white/50 font-bold whitespace-nowrap">
                🌐 landing-deliveryplus-1nvy.vercel.app
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 shadow-xl w-full max-w-[280px]">
              {/* QR Image Frame */}
              <div className="bg-white p-3.5 rounded-3xl shadow-inner relative group/qr overflow-hidden w-full max-w-[180px] aspect-square flex items-center justify-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&data=https://landing-deliveryplus-1nvy.vercel.app/" 
                  alt="Código QR de Delivery Plus" 
                  className="w-full h-full object-contain transition-transform duration-300 group-hover/qr:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* QR Meta */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black tracking-widest text-[#38BDF8] uppercase block">
                  📱 ESCANEÁ PARA ACCEDER
                </span>
                <span className="text-[9px] text-white/40 font-semibold uppercase block">
                  Acceso interactivo móvil
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutUsView;

