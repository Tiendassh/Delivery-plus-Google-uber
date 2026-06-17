import React, { useState } from 'react';

const AboutUsView: React.FC = () => {
  // Checklist and custom states for the domain setup guide
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    renderAdd: false,
    cloudflareA: false,
    cloudflareCNAME: false,
    cloudflareSSL: false,
    propagation: false,
  });

  const [simulatedStatus, setSimulatedStatus] = useState<'idle' | 'checking' | 'active'>('idle');

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const runVerification = () => {
    setSimulatedStatus('checking');
    setTimeout(() => {
      setSimulatedStatus('active');
    }, 1500);
  };

  const stepsList = [
    {
      id: 'renderAdd',
      title: 'Paso 1: Registrar el dominio en Render',
      desc: 'Ingresá a dashboard.render.com, seleccioná tu servicio "delivery-plus-google-uber", andá a "Settings -> Custom Domains" y agregá tanto "internetgm.es" como "www.internetgm.es".'
    },
    {
      id: 'cloudflareA',
      title: 'Paso 2: Registrar el Apex A Record en Cloudflare',
      desc: 'En Cloudflare, dentro de internetgm.es -> DNS -> Records, agregá un registro tipo A apuntando la raíz (@) al balanceador de Render: 216.24.57.1.'
    },
    {
      id: 'cloudflareCNAME',
      title: 'Paso 3: Registrar el CNAME "www" en Cloudflare',
      desc: 'Agregá un registro tipo CNAME para el host "www" apuntando a "delivery-plus-google-uber.onrender.com" con Proxy (Nube Naranja) activo.'
    },
    {
      id: 'cloudflareSSL',
      title: 'Paso 4: Configurar SSL/TLS "Full" en Cloudflare ⚠️ Crítico',
      desc: 'Ir a "SSL/TLS" en Cloudflare y cambiar el modo de cifrado a "Full" o "Full (strict)". Si usás "Flexible", Render causará un error de redirecciones infinitas (ERR_TOO_MANY_REDIRECTS).'
    },
    {
      id: 'propagation',
      title: 'Paso 5: Esperar de 5 a 10 minutos',
      desc: 'Los cambios de DNS y la emisión del certificado SSL gratuito por parte de Render (vía Let\'s Encrypt) demoran unos minutos. Una vez completado, cargará con HTTPS seguro.'
    }
  ];

  const allDone = Object.values(completedSteps).every(Boolean);
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

      {/* CLOUDFLARE CUSTOM DOMAIN INTEGRATED DEPLOYMENT GUIDE */}
      <div className="bg-slate-950 text-white rounded-[3.5rem] border border-white/10 p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="border-b border-white/10 pb-6 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">
            <span>🔌</span> GUÍA TÉCNICA DE REDIRECCIÓN DNS
          </div>
          <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight leading-none text-white">
            CONFIGURAR DOMINIO EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#F97316]">CLOUDFLARE</span>
          </h3>
          <p className="text-white/55 text-xs font-semibold leading-relaxed max-w-2xl">
            Sincronizá tu dominio temporal <strong className="text-white">internetgm.es</strong> para que apunte directamente a la arquitectura de Render en <strong className="text-white">delivery-plus-google-uber.onrender.com</strong> sin fallos de SSL.
          </p>
        </div>

        {/* 2-Column Dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
          
          {/* Left Column: Interactive Steps */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-black tracking-widest text-white/50 uppercase">
              📋 LISTA DE VERIFICACIÓN LOGÍSTICA PARA INTERNETGM.ES
            </h4>
            <div className="space-y-3">
              {stepsList.map(step => (
                <div 
                  key={step.id} 
                  onClick={() => toggleStep(step.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 ${completedSteps[step.id] ? 'bg-orange-500/5 border-orange-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-mono text-xs shrink-0 ${completedSteps[step.id] ? 'bg-orange-400 border-orange-400 text-black font-black' : 'border-white/20 text-transparent'}`}>
                    ✓
                  </div>
                  <div className="space-y-1">
                    <span className={`text-[11px] font-black uppercase block ${completedSteps[step.id] ? 'text-orange-400 line-through' : 'text-white'}`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-white/45 leading-relaxed block font-medium">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Records and Validation Test Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B0F19] rounded-3xl border border-white/5 p-6 space-y-6">
              <h4 className="text-[10px] font-black tracking-widest text-orange-400 uppercase">
                ⚙️ REGISTROS DNS A CARGAR EN CLOUDFLARE
              </h4>

              {/* dns table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] font-mono whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase text-[8px] font-black tracking-wider">
                      <th className="pb-2">TIPO</th>
                      <th className="pb-2">NOMBRE (HOST)</th>
                      <th className="pb-2">VALOR (OBJECTIVO)</th>
                      <th className="pb-2 text-right">PROXY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    <tr>
                      <td className="py-2.5 font-bold text-orange-400">A</td>
                      <td className="py-2.5">@ (o raíz)</td>
                      <td className="py-2.5 text-white">216.24.57.1</td>
                      <td className="py-2.5 text-right text-orange-300">Proxied 🧡</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-cyan-400">CNAME</td>
                      <td className="py-2.5">www</td>
                      <td className="py-2.5 text-white max-w-[120px] truncate">delivery-plus-google-uber.onrender.com</td>
                      <td className="py-2.5 text-right text-orange-300">Proxied 🧡</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-cyan-400">CNAME</td>
                      <td className="py-2.5">@ (opcional)</td>
                      <td className="py-2.5 text-white">CNAME Flattening</td>
                      <td className="py-2.5 text-right text-orange-300">Proxied 🧡</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* warning note */}
              <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 space-y-2">
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block">⚠️ EVITAR BUCLE DE REDIRECCIÓN EN CLOUDFLARE</span>
                <p className="text-[10px] text-white/70 leading-relaxed font-semibold">
                  Dado que Render provee su propio certificado SSL, si dejas Cloudflare en modo <strong className="text-white">"Flexible"</strong>, tu dominio arrojará error de bucle. Debes entrar a <strong className="text-white">{"SSL/TLS → Overview"}</strong> y marcar <strong className="text-orange-400">"Full" (o "Full strict")</strong>.
                </p>
              </div>

              {/* Interactive verification utility */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <span className="text-[8px] font-black tracking-widest text-white/30 uppercase block">SIMULADOR INTEGRADO DE PROPAGACIÓN DNS</span>

                {simulatedStatus === 'idle' && (
                  <button 
                    onClick={runVerification}
                    disabled={!allDone}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 text-center block ${allDone ? 'bg-orange-500 hover:bg-orange-600 text-black active:scale-95' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'}`}
                  >
                    {allDone ? '⚡ Verificar Dominio internetgm.es' : '🔒 Marcar todos los pasos para probar'}
                  </button>
                )}

                {simulatedStatus === 'checking' && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider animate-pulse">
                      Haciendo Lookup en DNS Anycast Cloudflare...
                    </span>
                  </div>
                )}

                {simulatedStatus === 'active' && (
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                      <span>🟢</span> CONEXIÓN PROPAGADA EXITOSAMENTE
                    </div>
                    <p className="text-[9px] font-mono text-white/50 leading-relaxed block">
                      DNS Query resolvía: <strong>internetgm.es</strong> {" → "} <strong>216.24.57.1</strong><br />
                      CNAME resolvía: <strong>www.internetgm.es</strong> {" → "} <strong>delivery-plus-google-uber.onrender.com</strong><br />
                      Status SSL: <strong>Full (Conexión Cifrada de Extremo a Extremo en Render)</strong>
                    </p>
                    <button 
                      onClick={() => setSimulatedStatus('idle')}
                      className="text-[9px] font-black text-emerald-400 underline uppercase tracking-widest block mx-auto pt-1 hover:text-emerald-300"
                    >
                      Volver a probar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutUsView;

