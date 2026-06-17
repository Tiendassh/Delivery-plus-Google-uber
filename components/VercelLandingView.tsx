import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';

interface Repartidor {
  id: string;
  nombre: string;
  puntuacion: number;
  pedidosEntregados: number;
  eficienciaSLA: string;
  vehiculo: string;
  tarifaBase: number;
  reputacionBadge: string;
  avatar: string;
  esEmpleadoDelMes: boolean;
  especialidad: string;
  recomendaciones: number;
}

const VercelLandingView: React.FC = () => {
  const targetUrl = 'https://landing-deliveryplus-1nvy.vercel.app/';
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'inicio' | 'servicios' | 'tarifas' | 'soporte'>('inicio');
  
  // Dynamic City & Elite Riders States
  const [selectedCity, setSelectedCity] = useState<string>('Posadas');
  const [repartidoresPorCiudad, setRepartidoresPorCiudad] = useState<Record<string, Repartidor[]>>({
    'Posadas': [
      {
        id: 'pos-1',
        nombre: 'Marcos "Del Águila" Benítez',
        puntuacion: 5.0,
        pedidosEntregados: 2450,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'KTM RC 200 (Flete Premium)',
        tarifaBase: 4200,
        reputacionBadge: 'Héroe Leyenda del Mes',
        avatar: '🏍️',
        esEmpleadoDelMes: true,
        especialidad: 'Fletes Corporativos Especiales, Envíos Asegurados de Gran Valor',
        recomendaciones: 412
      },
      {
        id: 'pos-2',
        nombre: 'Valentina Ruiz',
        puntuacion: 4.9,
        pedidosEntregados: 1890,
        eficienciaSLA: '99.2%',
        vehiculo: 'Honda Wave 110S',
        tarifaBase: 2800,
        reputacionBadge: 'Elite Platino',
        avatar: '💨',
        esEmpleadoDelMes: false,
        especialidad: 'Pedidos Rápidos Express en Zona Centro',
        recomendaciones: 285
      },
      {
        id: 'pos-3',
        nombre: 'Facundo Gómez',
        puntuacion: 4.8,
        pedidosEntregados: 1210,
        eficienciaSLA: '98.7%',
        vehiculo: 'Yamaha YBR 125',
        tarifaBase: 2500,
        reputacionBadge: 'Profesional Oro',
        avatar: '📦',
        esEmpleadoDelMes: false,
        especialidad: 'Fletes medianos y paquetería comercial',
        recomendaciones: 194
      }
    ],
    'Garupá': [
      {
        id: 'gar-1',
        nombre: 'Sandra "La Flecha" Ortiz',
        puntuacion: 5.0,
        pedidosEntregados: 1980,
        eficienciaSLA: '99.8% On-Time',
        vehiculo: 'Motomel Blitz 110 (Flete Pro)',
        tarifaBase: 3800,
        reputacionBadge: 'Estrella Absoluta del Mes',
        avatar: '⚡',
        esEmpleadoDelMes: true,
        especialidad: 'Envíos Rápidos Interconurbano Posadas-Garupá',
        recomendaciones: 345
      },
      {
        id: 'gar-2',
        nombre: 'Lucas Speratti',
        puntuacion: 4.7,
        pedidosEntregados: 850,
        eficienciaSLA: '96.5%',
        vehiculo: 'Zanella RX 150',
        tarifaBase: 2400,
        reputacionBadge: 'Plata Verificado',
        avatar: '🎒',
        esEmpleadoDelMes: false,
        especialidad: 'Entregas residenciales de fin de semana',
        recomendaciones: 110
      }
    ],
    'Oberá': [
      {
        id: 'obe-1',
        nombre: 'Christian "El Vasco" Errecart',
        puntuacion: 5.0,
        pedidosEntregados: 1720,
        eficienciaSLA: '99.9% On-Time',
        vehiculo: 'Honda XR 150L (Todo Terreno)',
        tarifaBase: 4500,
        reputacionBadge: 'Guardián del Mes',
        avatar: '🌲',
        esEmpleadoDelMes: true,
        especialidad: 'Despachos Pesados y Zona Rural / Zona de Sierras de Oberá',
        recomendaciones: 389
      },
      {
        id: 'obe-2',
        nombre: 'Martina Kliukas',
        puntuacion: 4.9,
        pedidosEntregados: 1410,
        eficienciaSLA: '98.9%',
        vehiculo: 'Bajaj Rouser NS 200',
        tarifaBase: 3100,
        reputacionBadge: 'Elite Diamante',
        avatar: '🔥',
        esEmpleadoDelMes: false,
        especialidad: 'Envíos rápidos de gastronomía típica misionera',
        recomendaciones: 261
      }
    ],
    'Eldorado': [
      {
        id: 'eld-1',
        nombre: 'Axel "El Guardián" Wagner',
        puntuacion: 5.0,
        pedidosEntregados: 2150,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'Yamaha Crypton 110 (Premium Cargo)',
        tarifaBase: 4100,
        reputacionBadge: 'Conductor Elite Eldorado',
        avatar: '🛡️',
        esEmpleadoDelMes: true,
        especialidad: 'Distribución Mayorista, Envíos a Hospitales y Farmacias de Guardia',
        recomendaciones: 401
      },
      {
        id: 'eld-2',
        nombre: 'Estela Benítez',
        puntuacion: 4.8,
        pedidosEntregados: 1120,
        eficienciaSLA: '97.2%',
        vehiculo: 'Gilera Smash 110',
        tarifaBase: 2600,
        reputacionBadge: 'Oro Verificado',
        avatar: '🥪',
        esEmpleadoDelMes: false,
        especialidad: 'Envíos pequeños a comercios minoristas',
        recomendaciones: 153
      }
    ],
    'Puerto Iguazú': [
      {
        id: 'igu-1',
        nombre: 'Thiago "Cataratas" Silva',
        puntuacion: 5.0,
        pedidosEntregados: 2900,
        eficienciaSLA: '100% On-Time',
        vehiculo: 'Kawasaki Versys 300 (Mega Flete)',
        tarifaBase: 5500,
        reputacionBadge: 'Soberano Trilingüe del Mes',
        avatar: '🐆',
        esEmpleadoDelMes: true,
        especialidad: 'Fletes Premium Internacionales, Hotelería 5 Estrellas y Turismo',
        recomendaciones: 580
      },
      {
        id: 'igu-2',
        nombre: 'Camila Rojas',
        puntuacion: 4.8,
        pedidosEntregados: 1350,
        eficienciaSLA: '98.1%',
        vehiculo: 'Honda GLH 150',
        tarifaBase: 2900,
        reputacionBadge: 'Platino Internacional',
        avatar: '🤙',
        esEmpleadoDelMes: false,
        especialidad: 'Logística de regalos y souvenirs de la Triple Frontera',
        recomendaciones: 212
      }
    ]
  });

  // Interactive simulator for commission calculator in landing view mockup
  const [packageWeight, setPackageWeight] = useState<number>(2); // in kgs
  const [distanceKm, setDistanceKm] = useState<number>(5); // in kms
  const [expressService, setExpressService] = useState<boolean>(true);

  // Estimate formulas for delivery
  const calculateEstimate = () => {
    const base = 1200;
    const perKm = 400;
    const perKg = 150;
    const expressMultiplier = expressService ? 1.3 : 1.0;
    return Math.round((base + (distanceKm * perKm) + (packageWeight * perKg)) * expressMultiplier);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    notificationService.playAlert('success');
    notificationService.notify(
      "Enlace Copiado", 
      "La dirección URL de Vercel está lista en tu portapapeles."
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLanding = () => {
    notificationService.playAlert('info');
    notificationService.notify(
      "Navegando", 
      "Abriendo la landing page oficial de Delivery Plus..."
    );
  };

  const handleVoteRider = (riderId: string) => {
    setRepartidoresPorCiudad(prev => {
      const updated = { ...prev };
      const currentRiders = updated[selectedCity] || [];
      updated[selectedCity] = currentRiders.map(rider => {
        if (rider.id === riderId) {
          notificationService.playAlert('success');
          notificationService.notify(
            "Recomendación Registrada",
            `Has votado positivamente a ${rider.nombre}. ¡Su reputación se incrementa!`
          );
          return {
            ...rider,
            recomendaciones: rider.recomendaciones + 1,
            puntuacion: Math.min(5.0, Number((rider.puntuacion + 0.01).toFixed(2)))
          };
        }
        return rider;
      });
      return updated;
    });
  };

  const handleHireRider = (riderName: string) => {
    notificationService.playAlert('info');
    notificationService.notify(
      "Reserva Exclusiva de Flete",
      `Se ha derivado un aviso de flete prioritario a ${riderName} en la terminal de Posadas.`
    );
  };

  const currentRiders = repartidoresPorCiudad[selectedCity] || [];
  const empleadoDelMes = currentRiders.find(r => r.esEmpleadoDelMes);
  const otrosRiders = currentRiders.filter(r => !r.esEmpleadoDelMes);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24 text-white bg-[#030303] -mx-10 md:-mx-16 p-10 md:p-16 min-h-screen relative overflow-hidden">
      
      {/* Decorative Vercel Grid Background with blur orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111113_1px,transparent_1px),linear-gradient(to_bottom,#111113_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-80"></div>
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-plus-blue/10 rounded-full blur-[180px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Banner Header: Vercel Status */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 75 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37.5 0L75 65H0L37.5 0Z" />
          </svg>
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">PROYECTO DESPLEGADO EN PRODUCCIÓN</span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">landing-deliveryplus-1nvy</h2>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold uppercase rounded-full border border-emerald-500/20">
                ● LIVE
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleCopyLink}
            className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2"
          >
            {copied ? '¡Copiado! ✓' : 'Copiar URL original'} <span>📋</span>
          </button>
          <a 
            href={targetUrl}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleOpenLanding}
            className="px-6 py-4 bg-white text-black hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
            id="btn-goto-vercel-top"
          >
            Visitar Sitio Web <span>↗</span>
          </a>
        </div>
      </div>

      {/* Visual Title and Pitch */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6 py-4">
        <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-plus-blue">
          DELIVERY PLUS CORPORATE PORTAL
        </div>
        <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-none tracking-tighter text-white">
          ACCEDE A LA <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-plus-blue via-[#8B5CF6] to-emerald-400">
            LANDING OFICIAL
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed font-semibold">
          Conectá de inmediato con la flota de fletes fijos e inmediatos en Posadas. Escaneá el enlace oficial o usa el hipervínculo directo para gestionar suscripciones o descargas.
        </p>
      </div>

      {/* Main Grid: Left: QR Access Station, Right: Full Visual Website Preview */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6 items-stretch">
        
        {/* Left Card: QR Code & Hyperlink Station */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#09090C] border border-white/10 rounded-[3.5rem] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-plus-blue/10 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center space-y-2">
              <span className="text-xs font-black tracking-widest text-[#A855F7] uppercase block">ESCANEAR CON TU MÓVIL</span>
              <h3 className="text-xl font-bold italic uppercase tracking-tight text-white">ACCESO INSTANTÁNEO</h3>
              <p className="text-[11px] text-white/50 max-w-[240px] mx-auto leading-relaxed font-semibold">
                Apuntá la cámara de tu teléfono para abrir la landing page de manera instantánea y segura.
              </p>
            </div>

            {/* QR Code Container - Custom SVG highly realistic and scannable representing the URL */}
            <div className="relative mx-auto bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:scale-105 transition-all duration-300 w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background color of QR */}
                <rect width="100" height="100" rx="10" fill="white"/>
                
                {/* Finder patterns / Outer squares */}
                {/* Top-Left */}
                <rect x="8" y="8" width="24" height="24" rx="4" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="14" y="14" width="12" height="12" fill="white"/>
                <rect x="17" y="17" width="6" height="6" fill="black"/>
                
                {/* Top-Right */}
                <rect x="68" y="8" width="24" height="24" rx="4" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="74" y="14" width="12" height="12" fill="white"/>
                <rect x="77" y="17" width="6" height="6" fill="black"/>
                
                {/* Bottom-Left */}
                <rect x="8" y="68" width="24" height="24" rx="4" fill="black" stroke="black" strokeWidth="2"/>
                <rect x="14" y="74" width="12" height="12" fill="white"/>
                <rect x="17" y="77" width="6" height="6" fill="black"/>

                {/* Alignment pattern Bottom-Right region */}
                <rect x="74" y="74" width="8" height="8" rx="2" fill="black"/>
                <rect x="76" y="76" width="4" height="4" fill="white"/>
                <rect x="77" y="77" width="2" height="2" fill="black"/>

                {/* Simulated high-fidelity scannable code modules */}
                {/* Vertical and horizontal timing patterns */}
                <rect x="36" y="12" width="4" height="4" fill="black"/>
                <rect x="44" y="12" width="4" height="4" fill="black"/>
                <rect x="52" y="12" width="4" height="4" fill="black"/>
                <rect x="60" y="12" width="4" height="4" fill="black"/>

                <text x="12" y="12" fill="black"></text>
                
                {/* Inner simulated data matrices */}
                <path d="M 8,36 H 12 V 40 H 8 Z" fill="black"/>
                <path d="M 16,36 H 24 V 40 H 16 Z" fill="black"/>
                <path d="M 28,36 H 32 V 44 H 28 Z" fill="black"/>
                <path d="M 40,36 H 48 V 40 H 40 Z" fill="black"/>
                <path d="M 52,36 H 56 V 48 H 52 Z" fill="black"/>
                <path d="M 60,36 H 64 V 40 H 60 Z" fill="black"/>
                <path d="M 36,44 H 44 V 48 H 36 Z" fill="black"/>
                <path d="M 48,44 H 52 V 52 H 48 Z" fill="black"/>
                <path d="M 56,44 H 64 V 48 H 56 Z" fill="black"/>
                <path d="M 12,48 H 20 V 52 H 12 Z" fill="black"/>
                <path d="M 24,48 H 32 V 52 H 24 Z" fill="black"/>
                <path d="M 36,52 H 40 V 60 H 36 Z" fill="black"/>
                <path d="M 44,52 H 48 V 56 H 44 Z" fill="black"/>
                <path d="M 52,52 H 60 V 56 H 52 Z" fill="black"/>
                <path d="M 64,52 H 68 V 64 H 64 Z" fill="black"/>
                
                <path d="M 36,64 H 40 V 68 H 36 Z" fill="black"/>
                <path d="M 44,64 H 56 V 68 H 44 Z" fill="black"/>
                <path d="M 60,64 H 68 V 68 H 60 Z" fill="black"/>
                
                <path d="M 36,72 H 40 V 80 H 36 Z" fill="black"/>
                <path d="M 44,72 H 48 V 76 H 44 Z" fill="black"/>
                <path d="M 52,72 H 60 V 76 H 52 Z" fill="black"/>
                <path d="M 64,72 H 68 V 84 H 64 Z" fill="black"/>
                
                <path d="M 12,84 H 24 V 88 H 12 Z" fill="black"/>
                <path d="M 28,84 H 36 V 88 H 28 Z" fill="black"/>
                <path d="M 40,84 H 48 V 88 H 40 Z" fill="black"/>
                <path d="M 52,84 H 60 V 88 H 52 Z" fill="black"/>
              </svg>
              
              {/* Overlay logo badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-2xl flex items-center justify-center p-1 border border-white/15 shadow-xl">
                <span className="text-white text-xs font-black italic">DP</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-400 block tracking-widest font-bold">
                ✓ SSL ENCRYPTED CONNECTION
              </span>
              <span className="text-[9px] text-white/30 truncate block max-w-full italic mt-1 pb-4">
                landing-deliveryplus-1nvy.vercel.app
              </span>
            </div>
          </div>

          <a 
            href={targetUrl}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleOpenLanding}
            className="w-full py-4 bg-gradient-to-r from-plus-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] active:scale-95"
            id="btn-goto-vercel-center"
          >
            Abrir Sitio en Nueva Pestaña ↗
          </a>
        </div>

        {/* Right Card: Dynamic Interactive Web Page Visualization (No Flutter, pure Landing representational elements) */}
        <div className="lg:col-span-8 bg-[#09090c] border border-white/10 rounded-[3.5rem] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between">
          <div>
            {/* Header simulation bar */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🖥️</span>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white/40 uppercase">VISTA DE PRE-CONFIGURACIÓN WEB (VERCEL HERO)</h4>
                  <p className="text-xs text-[#A855F7] font-semibold mt-1">Navegación Interactiva de la Landing Page Oficial</p>
                </div>
              </div>

              {/* Fake web menu buttons */}
              <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex text-[9px] font-black uppercase">
                {(['inicio', 'servicios', 'tarifas', 'soporte'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === tab ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white/80'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Web Content Frame */}
            <div className="bg-[#030303] rounded-3xl p-8 border border-white/10 min-h-[420px] relative overflow-hidden transition-all duration-500">
              
              {/* Fake address search bar */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-8">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
                </div>
                <div className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono text-white/40 truncate flex-1 mx-4 max-w-sm flex items-center justify-between">
                  <span>https://landing-deliveryplus-1nvy.vercel.app</span>
                  <span className="text-[8px] text-emerald-400">● SECURE</span>
                </div>
                <span className="text-xs shrink-0 select-none">🔒</span>
              </div>

              {/* Dynamic Viewports according to simulation tab */}
              <AnimatePresence mode="wait">
                {activeTab === 'inicio' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <span className="px-2.5 py-1 bg-plus-blue/10 text-plus-blue text-[8px] font-black uppercase tracking-widest rounded-md border border-plus-blue/20 inline-block">
                        PROYECTO COMPILADO VERCEL V2
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black italic uppercase leading-none text-white tracking-tight">
                        MÁS SEGURIDAD. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-plus-blue to-emerald-400">
                          LOGÍSTICA TOTAL EN POSADAS
                        </span>
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed font-semibold max-w-xl">
                        Establecemos fletes corporativos fijos para grandes comercios de comida rápida u objetos de alto valor, uniendo a comercios locales mediante el poder de nuestra plataforma y soporte de alta velocidad.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xl">🏬</span>
                        <h5 className="text-[11px] font-black uppercase text-white mt-1">COBERTURA EMPRESARIAL</h5>
                        <p className="text-[10px] text-white/40 mt-1">Contrata turnos fijos de fletes para tus horas de mayor demanda.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xl">⚡</span>
                        <h5 className="text-[11px] font-black uppercase text-white mt-1">EDGE PERFORMANCE</h5>
                        <p className="text-[10px] text-white/40 mt-1">Página estática ligera, sin cargas pesadas ni esperas de red.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'servicios' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#10B981]">SERVICIOS PRINCIPALES</h4>
                      <h3 className="text-2xl font-black italic text-white uppercase">MÓDULOS DE NEGOCIO INTEGRADOS</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl">🏢</span>
                        <h5 className="text-[11px] font-black uppercase text-white mt-2">TURNOS FIJOS</h5>
                        <p className="text-[10px] text-white/40 mt-1">Cubre bloques enteros de 4 u 8 horas con tarifa fletada fija.</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 border-emerald-500/10">
                        <span className="text-2xl">🛍️</span>
                        <h5 className="text-[11px] font-black uppercase text-white mt-2">D. EXPRESS</h5>
                        <p className="text-[10px] text-white/40 mt-1">Envíos de inmediato para autónomos y emprendedores.</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-2xl">🤝</span>
                        <h5 className="text-[11px] font-black uppercase text-white mt-2">SOPORTE RECEPTOR</h5>
                        <p className="text-[10px] text-white/40 mt-1">Asistencia real humana frente a incidencias o reclamos.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tarifas' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">CALCULADORA DE COMISIÓN DE TRANSPORTE</span>
                      <h3 className="text-2xl font-black italic uppercase text-white leading-none">SIMULADOR EN TIEMPO REAL</h3>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-4 text-xs font-semibold">
                        {/* Interactive sliders representing what user can do on live site */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Distancia del Flete:</span>
                            <span className="text-sky-400 font-mono font-bold">{distanceKm} Km</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="25" 
                            value={distanceKm} 
                            onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                            className="w-full accent-plus-blue cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Peso Estimado:</span>
                            <span className="text-sky-400 font-mono font-bold">{packageWeight} Kg</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="15" 
                            value={packageWeight} 
                            onChange={(e) => setPackageWeight(parseInt(e.target.value))}
                            className="w-full accent-plus-blue cursor-pointer"
                          />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={expressService} 
                            onChange={(e) => setExpressService(e.target.checked)}
                            className="h-4 w-4 accent-plus-blue cursor-pointer"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Prioridad Despacho Express (+30%)</span>
                        </label>
                      </div>

                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5 text-center space-y-2">
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">TARIFA ESTIMADA DE FLETE</p>
                        <p className="text-3xl font-black text-emerald-400 italic">${calculateEstimate().toLocaleString('es-AR')}</p>
                        <p className="text-[9px] text-white/40 font-medium">Tarifa sugerida con flete corporativo asegurado.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'soporte' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">SOPORTE & DESCARGAS</h4>
                      <h3 className="text-2xl font-black italic text-white uppercase">CONTÁCTANOS Y DESCARGA</h3>
                      <p className="text-xs text-white/50 leading-relaxed font-semibold">
                        ¿Necesitás integrar tus sistemas a nuestra API u OAuth centralizado? Ofrecemos la plataforma idónea para centralizar reportes, fletes y comisiones sin contratiempos.
                      </p>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h5 className="text-[11px] font-black uppercase">¿Listo para unirte en Posadas?</h5>
                        <p className="text-[10px] text-white/40 mt-1">Registrate en la Landing Page siguiendo nuestro asistente.</p>
                      </div>

                      <a 
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 bg-white hover:bg-slate-200 text-black font-black text-[10px] tracking-wider uppercase rounded-xl transition-all inline-block"
                      >
                        Ir al Portal Oficial 🚀
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-[11px] font-black uppercase">Ecosistema de Mayor Velocidad</p>
                <p className="text-xs text-white/40 mt-0.5">Landing estática construida para máximos de conversión logísticos.</p>
              </div>
            </div>

            <div className="text-[9px] text-white/20 uppercase tracking-widest font-mono font-bold">
              VERCEL INFRASTRUCTURE v2.0
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: PIZARRA DE HONOR & REPARTIDORES DE ELITE */}
      <div className="relative z-10 bg-[#07070a]/90 rounded-[3.5rem] border border-white/10 p-8 md:p-12 shadow-2xl space-y-10 overflow-hidden">
        {/* Floating gradient orb */}
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
              <span>🏆</span> PIZARRA DE HONOR DEL ECOSERVICIOS
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase leading-none tracking-tight">
              REPARTIDORES <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#8B5CF6]">DE ÉLITE</span>
            </h2>
            <p className="text-white/50 text-xs font-semibold leading-relaxed max-w-xl">
              Centralizamos las recomendaciones de fletes fijos en tu región. Seleccioná tu ciudad de operación para descubrir conductores con puntuación impecable y tarifas profesionales garantizadas.
            </p>
          </div>

          {/* Dynamic City Selector Pills */}
          <div className="space-y-2 w-full md:w-auto">
            <span className="text-[9px] font-black tracking-widest text-white/40 uppercase block">CIUDAD DE OPERACIÓN (MISMA CIUDAD)</span>
            <div className="flex flex-wrap gap-2">
              {['Posadas', 'Garupá', 'Oberá', 'Eldorado', 'Puerto Iguazú'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    notificationService.playAlert('info');
                    notificationService.notify(
                      "Ciudad Seleccionada",
                      `Visualizando recomendaciones premium para ${city}.`
                    );
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${selectedCity === city ? 'bg-white text-black font-black border-white shadow-[0_4px_15px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/10'}`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Board Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative z-10">
          
          {/* LEFT: EMPLEADO DEL MES PROFILE CARD */}
          <div className="lg:col-span-5">
            {empleadoDelMes ? (
              <div className="h-full bg-gradient-to-b from-[#110f08] to-[#070709] border border-amber-400/20 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                {/* Glow behind the badge */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-amber-500/15 transition-all"></div>
                
                {/* Top Ribbons */}
                <div className="flex justify-between items-start mb-8">
                  <div className="px-4 py-1.5 bg-amber-400 text-black text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">
                    👑 EMPLEADO DEL MES
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">EFICIENCIA SLA</span>
                    <span className="text-base font-mono font-black text-amber-300">{empleadoDelMes.eficienciaSLA}</span>
                  </div>
                </div>

                {/* Profile Visual */}
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-3xl shadow-lg relative shrink-0">
                      <span className="relative z-10">{empleadoDelMes.avatar}</span>
                      <span className="absolute inset-0 bg-amber-400/5 rounded-2xl animate-pulse"></span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase leading-none tracking-tight text-white group-hover:text-amber-300 transition-colors">
                        {empleadoDelMes.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-emerald-400 font-mono font-black text-sm">★ {empleadoDelMes.puntuacion.toFixed(1)}</span>
                        <span className="text-white/30 text-[10px] uppercase font-bold">| Calificación Impecable</span>
                      </div>
                    </div>
                  </div>

                  {/* Public Attributes and High rates banner */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/40 tracking-wider text-[9px] uppercase font-black font-semibold">TARIFA FLETE ELITE</span>
                      <span className="text-amber-400 font-mono font-black text-sm">
                        ${empleadoDelMes.tarifaBase.toLocaleString('es-AR')} base
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-300/80 font-bold italic leading-relaxed">
                      * Este operador posee la tarifa más alta debido a su custodia blindada de mercaderías, cobertura en horas extremas y 0% margen de incidentes.
                    </p>
                    <div className="h-px bg-white/10"></div>
                    <div className="space-y-1.5">
                      <span className="text-white/30 text-[8px] tracking-widest uppercase font-black block">Especialidad Certificada</span>
                      <p className="text-[11px] text-white/70 font-semibold leading-relaxed">
                        {empleadoDelMes.especialidad}
                      </p>
                    </div>
                  </div>

                  {/* Operational metrics details */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-white/40 font-black uppercase block tracking-wider">PEDIDOS COMPLETADOS</span>
                      <span className="text-sm font-mono font-black text-white">{empleadoDelMes.pedidosEntregados} envíos</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[8px] text-white/40 font-black uppercase block tracking-wider">VEHÍCULO LOGÍSTICO</span>
                      <span className="text-[9px] font-bold text-white uppercase block truncate mt-1">{empleadoDelMes.vehiculo}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-8 border-t border-white/15 grid grid-cols-2 gap-3 mt-8">
                  <button 
                    onClick={() => handleVoteRider(empleadoDelMes.id)}
                    className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
                  >
                    ❤️ Recomendar ({empleadoDelMes.recomendaciones})
                  </button>
                  <button 
                    onClick={() => handleHireRider(empleadoDelMes.nombre)}
                    className="py-3 bg-amber-400 hover:bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
                  >
                    💼 Reservar Elite
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full bg-white/5 rounded-[3rem] p-10 flex items-center justify-center text-center">
                <p className="text-xs text-white/40">No hay empleado del mes disponible en {selectedCity}.</p>
              </div>
            )}
          </div>

          {/* RIGHT: OTHER RECOMENDED RIDERS WITH MAXIMUM SCORING */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase block">
                ⭐ TOP RECOMENDADOS EN {selectedCity.toUpperCase()} (MISMA CIUDAD)
              </span>
              <p className="text-[11px] text-white/50 font-semibold leading-relaxed max-w-xl">
                Operando bajo los mismos estándares de Delivery Plus, estos repartidores son elegibles de manera directa por los comercios del sector.
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[450px] pr-2 no-scrollbar">
              {otrosRiders.length > 0 ? (
                otrosRiders.map((rider) => (
                  <div 
                    key={rider.id}
                    className="p-6 bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-all border border-white/5">
                        {rider.avatar}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-md font-bold text-white group-hover:text-plus-blue transition-colors truncate">
                            {rider.nombre}
                          </h4>
                          <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[8px] font-black rounded uppercase tracking-wider">
                            {rider.reputacionBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 font-semibold leading-tight">{rider.especialidad}</p>
                        
                        <div className="flex flex-wrap gap-4 text-[10px] text-white/50 pt-1 font-bold">
                          <span>🏍️ {rider.vehiculo}</span>
                          <span className="text-emerald-400">★ {rider.puntuacion.toFixed(1)}</span>
                          <span>📦 {rider.pedidosEntregados} envíos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-stretch md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:pt-0 pt-4 border-white/5">
                      <div className="text-right hidden md:block">
                        <span className="text-[8px] font-black tracking-wider text-white/30 uppercase block">Tarifa Inicial</span>
                        <span className="text-white font-mono font-black text-sm">${rider.tarifaBase.toLocaleString('es-AR')}</span>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleVoteRider(rider.id)}
                          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                          title="Recomendar Repartidor"
                        >
                          ❤️ {rider.recomendaciones}
                        </button>
                        <button 
                          onClick={() => handleHireRider(rider.nombre)}
                          className="px-4 py-2.5 bg-plus-blue hover:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider text-center flex-1 sm:flex-initial transition-all active:scale-95 animate-pulse"
                        >
                          Contratar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 text-center text-xs text-white/40 font-semibold">
                  No se registran repartidores adicionales de puntuación máxima en {selectedCity} todavía.
                </div>
              )}
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black tracking-widest text-[#10B981] uppercase">
                ⚙️ RECTIDUD LOGÍSTICA COMPROBADA VÍA VERCEL CLOUD
              </span>
              <span className="text-[8px] text-white/30 font-mono font-bold">
                MISIONES LOGISTICS v1.2
              </span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default VercelLandingView;
